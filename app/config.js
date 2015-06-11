var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;
var path = require('path');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

Mongoose.connect('mongodb://127.0.0.1/shortliestdb');

var db = Mongoose.connection;

db.on('error', function(err){
  console.log('connection error:', err);
});
db.once('open', function(){
  console.log('database connection established');
});

// db schema urls
db.urlsSchema = new Schema({
  url: String,
  base_url: String,
  code: String,
  title: String,
  visits: {type: Number, default: 0},
  timestamps: {
    createdAt: {type: Date, default: Date.now},
    modifiedAt: {type: Date, default: Date.now}
  }
});

db.urlsSchema.pre('save', function(next){
  var url = this;
  var shasum = crypto.createHash('sha1');
  shasum.update(url.url);
  url.code = shasum.digest('hex').slice(0, 5);
  next();
});

// db schema users
db.usersSchema = new Schema({
  username: String,
  password: String,
  timestamps: {
    createdAt: {type: Date, default: Date.now},
    modifiedAt: {type: Date, default: Date.now}
  }
});

db.usersSchema.pre('save', function(next){
  var user = this;
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(user.password, null, null).bind(user)
    .then(function(hash) {
      user.password = hash;
    });
  next();
});

db.usersSchema.methods.comparePassword = function(attemptedPassword, callback) {
    bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
      callback(isMatch);
    });
};

// db schema join urls-users
db.users_urlsSchema = new Schema({
  users_id: Number,
  urls_id: Number
});


// var Bookshelf = require('bookshelf');
// var path = require('path');

// var db = Bookshelf.initialize({
//   client: 'sqlite3',
//   connection: {
//     host: '127.0.0.1',
//     user: 'your_database_user',
//     password: 'password',
//     database: 'shortlydb',
//     charset: 'utf8',
//     filename: path.join(__dirname, '../db/shortly.sqlite')
//   }
// });

// db.knex.schema.hasTable('urls').then(function(exists) {
//   if (!exists) {
//     db.knex.schema.createTable('urls', function (link) {
//       link.increments('id').primary();
//       link.string('url', 255);
//       link.string('base_url', 255);
//       link.string('code', 100);
//       link.string('title', 255);
//       link.integer('visits');
//       link.timestamps();
//     }).then(function (table) {
//       console.log('Created Table', table);
//     });
//   }
// });

// db.knex.schema.hasTable('users').then(function(exists) {
//   if (!exists) {
//     db.knex.schema.createTable('users', function (user) {
//       user.increments('id').primary();
//       user.string('username', 100).unique();
//       user.string('password', 100);
//       user.timestamps();
//     }).then(function (table) {
//       console.log('Created Table', table);
//     });
//   }
// });

module.exports = db;
