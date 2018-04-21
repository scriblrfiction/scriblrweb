var mongoose = require('mongoose');


var ViewSchema = mongoose.Schema({
  userID: mongoose.Schema.Types.ObjectId,
  bookID: mongoose.Schema.Types.ObjectId,
  percentViewed: Number,
  episodeNo: Number
});

module.exports = mongoose.model('View',ViewSchema);
