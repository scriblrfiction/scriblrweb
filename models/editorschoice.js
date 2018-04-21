var mongoose = require('mongoose');

var EditorsChoiceSchema = new mongoose.Schema({
  bookID: mongoose.Schema.Types.ObjectId,
  comment: String,
  dateSelected: Date
});

module.exports = mongoose.model('EditorsChoice',EditorsChoiceSchema);
