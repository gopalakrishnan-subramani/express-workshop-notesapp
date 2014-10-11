var mongoose = require('mongoose');


var NoteSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  created: {type:Date, default: Date.now},
  updated: {type:Date},
  images: [{type: String}],
  _notebook : { type: mongoose.Schema.Types.ObjectId, ref: 'NoteBook' }
}, { collection: 'notes' });

//minimum 3 letter title
NoteSchema.path('title').validate(function (value) {
  return value && value.length >= 3;
}, 'Title should be minimum of 3 letters');

mongoose.model('Note', NoteSchema)
