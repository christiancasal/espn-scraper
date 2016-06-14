var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var bodyParser = require('body-parser');

var Headlines = require('../models/headlines_model.js')[0]
var db = require('../models/headlines_model.js')[1];

//
// router.use(bodyParser.json());
// router.use(bodyParser.urlencoded({extended: false}));
// router.use(bodyParser.text());
// router.use(bodyParser.json({type:'application/vnd.api+json'}));

router.use(express.static('public'));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('update-sport')
  // Headlines.find({viewed: false}, function(err, found) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     // console.log(found);
  //     // var foundObj = {
  //     //   results: found
  //     // }
  //     res.render('index', { title: 'ESPN Headlines', results: found});
  //     // res.json(foundObj);
  //   }
  // });
});

//initial update
router.get('/update-all', function(req, res, next) {
  var sports = [
    'nfl',
    'nba',
    'mlb',
    'college-football',
    'nhl'
  ]

  for (var i = 0; i < sports.length; i++) {
    update_sport(sports[i])
  }
  res.redirect('/update-text')
  // res.render('index', { title: 'ESPN Headlines'});
});

router.get('/update-text', function(req, res) {
  Headlines.find({text: ""}, 'link', function(err, found) {
    if (err) {
      console.log(err);
    } else {
      for (var i = 0; i < found.length; i++) {
        update_links_w_text(found[i].link);
      }
      res.redirect('/');
    }//end of text updater
  });
});

router.get('/update-sport', function(req, res) {
  var sports_id = req.query.id;
  update_sport(sports_id);
  //get one article
  Headlines.find({league: sports_id}, function(err, found) {
    if (err) {
      console.log(err);
    } else {
      console.log(found);
      console.log('hello');
      // res.render('index', { headline: found[0].headline, text: found[0].text });
      res.render('index', { title: 'ESPN Headlines', results: found });
    }//end of text updater
  }).sort({_id: -1}).limit(1);
});

router.get('/article-viewed', function(req, res) {
  var current_link = req.query.send_link;
  var current_view = req.query.send_view;
  console.log(current_link);
  console.log(current_view);

  var updates = { $set: { viewed: true } };

  Headlines.findOneAndUpdate({link: current_link}, updates, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log('updated!');
      res.redirect('/');
    }
  });//end of view updater
});//end route

// router.post('/submit', function(req, res) {
// 	console.log(req.body);
//   db.notes.save(req.body, function(err, saved) {
//     if (err) {
//       console.log(err);
//     } else {
//       res.send(saved);
//     }
//   });
// });

// router.get('/', function(req, res, next) {
//
//   res.render('index', { title: 'ESPN Headlines' });
// });
//
// router.get('/', function(req, res, next) {
//
//   res.render('index', { title: 'ESPN Headlines' });
// });
//
// router.get('/', function(req, res, next) {
//
//   res.render('index', { title: 'ESPN Headlines' });
// });

function update_sport(league){
  console.log(league);
  var queryUrl = 'https://espn.go.com';
  request(queryUrl + "/" + league, function (error, response, html) {
    if (!error && response.statusCode == 200) {

      var $ = cheerio.load(html);

      $('.headlines').each(function(i, element){

        var pull = $(this).children().children().children()

        for (var i = 0; i < pull.length; i++) {
          var Headlines = require('../models/headlines_model.js')[0];

          var article = new Headlines({
              league: league,
              headline: pull[i].children[0].data,
              link: pull[i].attribs.href,
              text: "",
              viewed: false,
              note: ""
          });

          Headlines.update(
              {link: pull[i].attribs.href},
              {$setOnInsert: article},
              {upsert: true},
              function(err, numAffected) {
                if (err) throw err
              });
        }//end of for loop
      });//end of each statement
    }//end if statement
  });//end request url
}//end function

function update_links_w_text(found_link){
    var queryUrl = 'https://espn.go.com';

    request(queryUrl + found_link, function (error, response, html) {
      if (!error && response.statusCode == 200) {
        console.log('request success!');

        var $ = cheerio.load(html);

        $('.article-body').each(function(i, element){
          var article_text = $(this).children().text();

          // console.log(article_text);
          Headlines.update(
              {link: found_link},
              {$set: { text: article_text }},
              {upsert: true},
              function(err, numAffected) {
                if (err) throw err
              }
          );
        });
      }
    });
}

module.exports = router;
