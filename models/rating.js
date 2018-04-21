var mongoose = require('mongoose');

var RatingSchema = new mongoose.Schema({
  bookID: mongoose.Schema.Types.ObjectId,
  userID: mongoose.Schema.Types.ObjectId,
  rating: Number
});

module.exports = mongoose.model('Rating',RatingSchema);
