var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    csrf = require('csurf'), //Cross Site Request Forgery CSRF

    util = require("util"); 

var urlencodedParser = bodyParser.urlencoded({extended: true});

var NoteBook = mongoose.model('NoteBook');
var Note = mongoose.model('Note');

module.exports = (function() {
    'use strict';
    var router = express.Router();

    router.use(csrf());

    
    router.get('/notebooks/new', function(req, res) {
        res.render('notebooks/edit', {csrfToken: req.csrfToken()});
    });

    router.get('/notebooks/edit/:id', function(req, res) {

        NoteBook.findById(req.params.id, function (err, notebook){
            if (!notebook) return res.sendStatus(404); //not found

            res.locals.notebook = notebook;
            res.render('notebooks/edit', {csrfToken: req.csrfToken()});
        });
    });

    router.post('/notebooks/save', urlencodedParser, function(req, res) {
        if (!req.body) return res.sendStatus(400); //bad request
        
        NoteBook.findById(req.body.id, function (err, notebook){
            if (err) return res.sendStatus(500); //something gone bad

            if (!notebook) {
                notebook = new NoteBook();
                notebook.created = new Date(); //optional, set default in schema
            }

            notebook.title = req.body.title;
            notebook.updated = new Date();

            notebook.save(function (err, saved_notebook) {
                if (!err) return res.redirect('/notebooks/edit/' + saved_notebook._id.toString());

                res.locals.errors = err.errors;
                res.locals.notebook = notebook;
                res.render('notebooks/edit', {csrfToken: req.csrfToken()});
            });
        });
    });

    router.get('/notebooks', function(req, res) {
        NoteBook.find(function(err, notebooks) {
            if (err) return res.sendStatus(500); //something gone bad

            res.locals.notebooks = notebooks;
            res.render('notebooks/list');    
        });
    });

    router.get('/notebooks/view/:id', function(req, res){
         NoteBook.findById(req.params.id, function (e, notebook){
            if (!notebook) return res.sendStatus(404); //not found
            res.locals.notebook = notebook;

            Note.find({ _notebook : notebook._id })
            .exec(function (err, notes) {
               if (err) return res.sendStatus(500); //something gone bad

               res.locals.notes = notes;
               res.render('notebooks/view');
            });
        });
    });

    router.get('/notebooks/:id/notes/new', function(req, res) {
        NoteBook.findById(req.params.id, function(err, notebook){
            res.locals.notebook = notebook;

            res.render('notes/edit', {csrfToken: req.csrfToken()});
        });
        
    });

    router.get('/notebooks/:notebook_id/notes/list', function(req, res) {
         NoteBook.findById(req.params.notebook_id, function(e, notebook){
            if (e) return res.sendStatus(500); //something gone bad

            if (!notebook) return res.sendStatus(404); //not found

            res.locals.notebook = notebook;

            Note.find({ _notebook : notebook._id })
            .exec(function (err, notes) {
               if (err) return res.sendStatus(500); //something gone bad
               res.locals.notes = notes;
               res.render('notes/list'); 
            });

        });        
    });

    router.get('/notebooks/:notebook_id/notes/view/:id', function(req, res){
         NoteBook.findById(req.params.notebook_id, function(e, notebook){
            if (e) return res.sendStatus(500); //something gone bad

            if (!notebook) return res.sendStatus(404); //not found

            res.locals.notebook = notebook;

             Note.findById(req.params.id, function (err, note){
                if (!note) return res.sendStatus(404); //not found

                res.locals.note = note;
                res.render('notes/view', {csrfToken: req.csrfToken()});
            });
        });
    });

    router.get('/notebooks/:notebook_id/notes/edit/:id', function(req, res) {
        NoteBook.findById(req.params.notebook_id, function(e, notebook){

            if (e) return res.sendStatus(500); //something gone bad

            if (!notebook) return res.sendStatus(404); //not found

            
            res.locals.notebook = notebook;

            Note.findById(req.params.id, function (err, note){
                if (!note) return res.sendStatus(404); //not found

                res.locals.note = note;
                res.render('notes/edit', {csrfToken: req.csrfToken()});
            });
        });    
    });

    router.post('/notebooks/:notebook_id/notes/upload/:id', function(req, res) {
         console.dir('files ' + req.files[0]);

        if (req.files) { 
        console.log(util.inspect(req.files));
        if (req.files.file.size === 0) {
                    return res.sendStatus(400);
        }

        fs.exists(req.files.file.path, function(exists) { 
            if(exists) { 
                 
                 Note.findById(req.params.id, function(err, note){
                    if (!note) res.sendStatus(404);

                    note.images.push(req.files.file.path);

                    note.save(function(e, saved_note) {
                        return res.redirect('/notebooks/' + req.params.notebook_id.toString() + '/notes/view/' + saved_note._id.toString());
                    });
                 });
                 

            } else { 
                return res.sendStatus(500);
            } 
        }); 
    }


          
    });

    router.post('/notebooks/:notebook_id/notes/save', urlencodedParser, function(req, res) {
        if (!req.body) return res.sendStatus(400); //bad request
        
        NoteBook.findById(req.params.notebook_id, function(e, notebook){
            if (e) return res.sendStatus(500); //something gone bad

            if (!notebook) return res.sendStatus(404); //not found

            Note.findById(req.body.id, function (err, note){
                if (err) return res.sendStatus(500); //something gone bad

                if (!note) {
                    note = new Note();
                    note.created = new Date(); //optional, set default in schema
                }

                note._notebook = notebook._id;

                note.title = req.body.title;
                note.description = req.body.description;
                note.updated = new Date();

                note.save(function (err, saved_note) {
                    if (!err) 
                        return res.redirect('/notebooks/' + notebook._id.toString() + '/notes/edit/' + saved_note._id.toString());

                    res.locals.errors = err.errors;
                    res.locals.note = note;
                    res.render('notes/edit', {csrfToken: req.csrfToken()});
                });
            }); //Note.find
        }); //Notebook

      
    });

    return router;    
})();