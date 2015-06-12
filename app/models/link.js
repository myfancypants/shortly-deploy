var mongoose = require('mongoose');
var db = require('../config');
var crypto = require('crypto');

// db schema urls
var urlsSchema = mongoose.Schema({
  url: String,
  base_url: String,
  code: String,
  title: String,
  visits: {type: Number, default: 0}
});

urlsSchema.pre('save', function(next){
  var url = this;
  var shasum = crypto.createHash('sha1');
  shasum.update(url.url);
  url.code = shasum.digest('hex').slice(0, 5);
  next();
});

var Link = mongoose.model('Link', urlsSchema);

// var Link = db.Model.extend({
//   tableName: 'urls',
//   hasTimestamps: true,
//   defaults: {
//     visits: 0
//   },
  // initialize: function(){
  //   this.on('creating', function(model, attrs, options){
  //     var shasum = crypto.createHash('sha1');
  //     shasum.update(model.get('url'));
  //     model.set('code', shasum.digest('hex').slice(0, 5));
  //   });
  // }
// });

module.exports = Link;
