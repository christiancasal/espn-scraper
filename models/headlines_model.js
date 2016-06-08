var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/headlines_db');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
  console.log("mongodb connected!");
});
//define schema
var headlinesSchema = mongoose.Schema({
  league: String,
  headline: String,
  link: String,
  text: String,
  viewed: Boolean,
  note: String
});

//define model
var Headlines = mongoose.model('Headlines', headlinesSchema);


//export model
module.exports = [Headlines, db];
