var mongoose = require('mongoose');

var CategorySchema = new mongoose.Schema({
  category: String,
  isDisabled: Boolean
});

module.exports = mongoose.model('Category',CategorySchema);
