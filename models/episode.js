var mongoose = require('mongoose');

var EpisodeSchema = new mongoose.Schema({
  bookID: mongoose.Schema.Types.ObjectId,
  title: String,
  episodeNo: Number,
  views: Number,
  isPublished: Boolean,
  content: String,
  datePublished: Date
});

module.exports = mongoose.model('Episode',EpisodeSchema);
