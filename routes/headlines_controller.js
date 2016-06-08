var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');

var Headlines = require('../models/headlines_model.js')[0]
var db = require('../models/headlines_model.js')[1];

/* GET home page. */
router.get('/', function(req, res, next) {
  Headlines.find({viewed: false}, function(err, found) {
    if (err) {
      console.log(err);
    } else {
      // console.log(found);
      // var foundObj = {
      //   results: found
      // }
      res.render('index', { title: 'ESPN Headlines', results: found});
      // res.json(foundObj);
    }
  });
});

router.get('/update-link', function(req, res, next) {
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
      res.end();
    }//end of text updater
  });
});
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

function update_mongo_db(league){
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
                // Headlines.find({text: ""}, 'link', function(err, found) {
                //   if (err) {
                //     console.log(err);
                //   } else {
                //     // console.log(found[0].link;
                //     for(j = 0; j < found.length; j++){
                //       var found_link = found[j].link;
                //
                //       request(queryUrl + found[j].link, function (error, response, html) {
                //         if (!error && response.statusCode == 200) {
                //           console.log('request success!');
                //
                //           var $ = cheerio.load(html);
                //
                //           $('.article-body').each(function(i, element){
                //             var article_text = $(this).children().text();
                //
                //             console.log(article_text);
                //             console.log('article update here');
                //
                //             Headlines.update(
                //                 {link: found_link},
                //                 {$set: { text: article_text }},
                //                 {upsert: true},
                //                 function(err, numAffected) {
                //                   if (err) throw err
                //                 }
                //             );
                //
                //           });
                //         }
                //       });
                //     }
                //   }
                // })//end of function
          // );


        }//end of for loop
      });//end of each statement

      // Headlines.find({text: ""}, 'link', function(err, found) {
      //   if (err) {
      //     console.log(err);
      //   } else {
      //     // console.log(found[0].link;
      //     for(i = 0; i < found.length; i++){
      //       var found_link = found[i].link;
      //       console.log(found_link);
      //
      //       request(queryUrl + found_link, function (error, response, html) {
      //         if (!error && response.statusCode == 200) {
      //           console.log('request success!');
      //
      //           var $ = cheerio.load(html);
      //
      //           $('.article-body').each(function(i, element){
      //             var article_text = $(this).children().text();
      //
      //             // console.log(article_text);
      //             console.log('article update here');
      //
      //             Headlines.update(
      //                 {link: found_link},
      //                 {$set: { text: article_text }},
      //                 {upsert: true},
      //                 function(err, numAffected) {
      //                   if (err) throw err
      //                 }
      //             );
      //           });
      //         }
      //       });
      //     }
      //   }
      // })//end of text updater
    }
  });
}

function update_links_w_text(found_link){
    var queryUrl = 'https://espn.go.com';

    request(queryUrl + found_link, function (error, response, html) {
      if (!error && response.statusCode == 200) {
        console.log('request success!');

        var $ = cheerio.load(html);

        $('.article-body').each(function(i, element){
          var article_text = $(this).children().text();

          // console.log(article_text);
          console.log('article update here');
          console.log(found_link);
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
