var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  imageUrl: String,
  coverUrl: String,
  penName: String,
  userName: String,
  about: String,
  dateOfBirth: String,
  location: String,
  gender: String,
  following: [{
    userID: mongoose.Schema.Types.ObjectId
  }]
});

UserSchema.plugin(passportLocalMongoose, {usernameField: 'email'});

module.exports = mongoose.model('User', UserSchema);
