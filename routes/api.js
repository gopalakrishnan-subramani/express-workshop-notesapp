var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');

var jsonParser = bodyParser.json();

var Note = mongoose.model('Note');
var NoteBook = mongoose.model('NoteBook');

module.exports = (function() {
    'use strict';
    var api = express.Router();

    api.get('/notebooks', function(req, res) {
        NoteBook.find(function(err, notebooks) {
            if (err) return res.sendStatus(500); //something gone bad
            res.json(notebooks);    
        });
    });

    api.get('/notebooks/:id', function(req, res) {
         NoteBook.findById(req.params.id, function (err, notebook){
         	 if (err) return res.sendStatus(500); //something gone bad

            if (!notebook) return res.sendStatus(404); //not found or with json response
            if (!notebook) return res.json(
                {result: false, error: 'not found'}, 404);
            res.json(notebook);
        });
    });

    //permanent delete, for soft delete, update the record with deleted boolean flag
    api.delete('/notebooks/:id', function(req, res){
    	NoteBook.findByIdAndRemove(req.params.id, function(err, deleted_notebook){
    		if (err) return res.sendStatus(500); //something gone bad

    		if (!deleted_notebook) return res.json({result: false, error: 'not found'}, 404);

    		//return res.json(deleted_notebook, 200); //OK
    		return res.sendStatus(204) //No Content => means delete OK, but not returning deleted content
    	});
    });

    api.post('/notebooks', jsonParser, function(req, res) {
        if (!req.body) return res.sendStatus(400); //bad request

        NoteBook.findById(req.body._id, function (err, notebook){
            if (err) return res.sendStatus(500); //something gone bad

            if (!notebook) {
                notebook = new NoteBook();
                notebook.created = new Date(); //optional, set default in schema
            }

            notebook.title = req.body.title;
            notebook.updated = new Date();

            notebook.save(function (err, saved_notebook) {
                if (!err) return res.json(saved_notebook);
                res.json(err.errors, 422); //Unprocessable Entity
            });
        });

    });


    api.get('/notes', function(req, res) {
        Note.find(function(err, notes) {
            if (err) return res.sendStatus(500); //something gone bad
            res.json(notes);    
        });
    });

    api.get('/notes/:id', function(req, res) {
         Note.findById(req.params.id, function (err, note){
         	 if (err) return res.sendStatus(500); //something gone bad

            //if (!note) return res.sendStatus(404); //not found or with json response
            if (!note) return res.json({result: false, error: 'not found'}, 404);
            res.json(note);
        });
    });

    //permanent delete, for soft delete, update the record with deleted boolean flag
    api.delete('/notes/:id', function(req, res){
    	Note.findByIdAndRemove(req.params.id, function(err, deleted_note){
    		if (err) return res.sendStatus(500); //something gone bad

    		if (!deleted_note) return res.json({result: false, error: 'not found'}, 404);

    		return res.json(deleted_note, 200); //OK
    		//return res.sendStatus(204) //No Content => means delete OK, but not returning deleted content
    	});
    });

    api.post('/notes', jsonParser, function(req, res) {
        if (!req.body) return res.sendStatus(400); //bad request

        Note.findById(req.body._id, function (err, note){
            if (err) return res.sendStatus(500); //something gone bad

            if (!note) {
                note = new Note();
                note.created = new Date(); //optional, set default in schema
            }

            note.title = req.body.title;
            note.description = req.body.description;
            note.updated = new Date();

            note.save(function (err, saved_note) {
                if (!err) return res.json(saved_note);
                res.json(err.errors, 422); //Unprocessable Entity
            });
        });

    });

    return api;
})();