var express = require('express'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser')
    session = require('express-session'),
    morgan = require('morgan'),
    fs = require('fs'),

    multer = require('multer'),

    swig = require('swig'),
     _ = require('underscore'),
    mongoose = require('mongoose'),

    passport = require('passport'),
    passportLocal =  require('passport-local'),

   
    validator = require('validator'),
    expressValidator = require('express-validator');


require('./models/note');

require('./models/notebook');

var api = require('./routes/api');
var router = require('./routes/web');


var NoteBook = mongoose.model('Note');
var Note = mongoose.model('Note');


var app = module.exports = express();

app.use(cookieParser('fDgfaRT243FDFrAS')); //with secure token for encryption
app.use(session({secret: 'fadsyg234lkjifasfds', resave:true, saveUninitialized: true}));
 

 


app.engine('html', swig.renderFile);
app.set('view engine', 'html');

// NOTE: You should always cache templates in a production environment.

// Swig will cache templates for you, but you can disable
app.set('view cache', false);

// To disable Swig's cache, do the following:
swig.setDefaults({ cache: false });
app.set('views', __dirname + '/views'); //view directory


// Don't cache templates in development
if (process.env.NODE_ENV !== 'production') {
  swig.setDefaults({ cache: false });
}

app.use(morgan('combined'));

app.disable('etag');

app.use(passport.initialize());
app.use(passport.session());
 

//file upload
app.use(multer({ dest: './uploads/'}))

app.use(expressValidator());


app.use('/api', api);
app.use('/', router);


//app.use('/assets', express.static(__dirname + '/assets', {maxAge: 1000 * 60})); // with expiry
app.use('/assets', express.static(__dirname + '/assets'));
app.use('/uploads', express.static(__dirname + '/uploads')); 

mongoose.connect('mongodb://localhost/notesdb');

var Note = mongoose.model('Note');

// get an instance of router
var router = express.Router();

// route middleware that will happen on every request
router.use(function(req, res, next) {

  // log each request to the console
  console.log(req.method, req.url);

  // continue doing what we were doing and go to the route
  next(); 
});

var router = express.Router();

// home page route (http://localhost:8080)
router.get('/', function(req, res) {
  res.send('im the home page!');  
});

// about page route (http://localhost:8080/about)
router.get('/about', function(req, res) {
  res.send('im the about page!'); 
});

// apply the routes to our application
app.use('/test', router);

var routerAPI = express.Router();

routerAPI.get('/say', function(req, res){
  res.json({'message': 'hello'});
});

app.use('/api', routerAPI);

app.get('/', function(req, res){
  res.locals.name = "express";
  res.render('home', {version: '4'});
});

app.get('/customfile/:filePath', function(req, res){
    return res.sendfile(req.params.filePath, { root: __dirname + '/uploads' });
});

var server = app.listen(process.env.PORT || 3000, function() {
    console.log('Listening on port %d', server.address().port);
});

