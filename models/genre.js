var mongoose = require('mongoose');

var GenreSchema = new mongoose.Schema({
  genre: String,
  isDisabled: Boolean
});

module.exports = mongoose.model('Genre',GenreSchema);
