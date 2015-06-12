var mongoose = require('mongoose');
var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

// db schema users
var usersSchema = mongoose.Schema({
  username: String,
  password: String
});

usersSchema.pre('save', function(next){
  var user = this;
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(user.password, null, null).bind(user)
    .then(function(hash) {
      user.password = hash;
      next();
    });
});

var User = mongoose.model('User', usersSchema);

User.comparePassword = function(attemptedPassword, callback) {
    bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
      callback(isMatch);
    });
};


// var User = db.Model.extend({
//   tableName: 'users',
//   hasTimestamps: true,
//   initialize: function(){
//     this.on('creating', this.hashPassword);
//   },
//   comparePassword: function(attemptedPassword, callback) {
//     bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
//       callback(isMatch);
//     });
//   },
//   hashPassword: function(){
//     var cipher = Promise.promisify(bcrypt.hash);
//     return cipher(this.get('password'), null, null).bind(this)
//       .then(function(hash) {
//         this.set('password', hash);
//       });
//   }
// });

module.exports = User;
