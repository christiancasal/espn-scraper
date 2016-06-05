var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');

var Headlines = require('../models/headlines_model.js')[0];
var db = require('../models/headlines_model.js')[1];

/* GET home page. */
router.get('/', function(req, res, next) {
  var sports = [
    'nfl',
    'nba',
    'mlb',
    'college-football',
    'nhl'
  ]

  for (var i = 0; i < sports.length; i++) {
    update_mongo_db(sports[i])
  }

  res.render('index', { title: 'Express' });
});

function update_mongo_db(league){
  var queryUrl = 'https://espn.go.com';
  request(queryUrl + "/" + league, function (error, response, html) {
    if (!error && response.statusCode == 200) {
      console.log('request success!');

      var $ = cheerio.load(html);

      $('.headlines').each(function(i, element){

        var pull = $(this).children().children().children()

        for (var i = 0; i < pull.length; i++) {

          var article = new Headlines({
              league: league,
              headline: pull[i].children[0].data,
              link: pull[i].attribs.href,
              text: "",
              viewed: false,
              note: ""
          });

          //gets article text
          request(queryUrl + article.link, function (error, response, html) {
            if (!error && response.statusCode == 200) {
              console.log('request success!');

              var $ = cheerio.load(html);

              $('.article-body').each(function(i, element){
                article.text = $(this).children().text();
                console.log(article);

                //TODO check for existing articles

              });
            }
          });
        }
      });
    }
  });
}

module.exports = router;
