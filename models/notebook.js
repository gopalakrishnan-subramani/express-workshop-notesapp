var mongoose = require('mongoose');


var NoteBookSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  created: {type:Date, default: Date.now},
  updated: {type:Date},

  notes : [{ type: mongoose.Schema.ObjectId, ref: 'Note' }]
}, { collection: 'notebooks' });


//minimum 3 letter title
NoteBookSchema.path('title').validate(function (value) {
  return value && value.length >= 3;
}, 'Title should be minimum of 3 letters');

mongoose.model('NoteBook', NoteBookSchema)