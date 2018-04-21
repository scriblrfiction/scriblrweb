var mongoose = require('mongoose');

var BookSchema = new mongoose.Schema({
  title: String,
  authorID: mongoose.Schema.Types.ObjectId,
  rating: Number,
  genre: String,
  imageURL: String,
  description: String,
  category: String,
  uploadDate: String,
  language: String,
  isOriginal: Boolean,
  isMature: Boolean,
  copyright: Boolean,
  tags: [String]
});

module.exports = mongoose.model('Book', BookSchema);
