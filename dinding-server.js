/**
 * Node Server [app]
 * Twitter Wall
 */
'use strict';

var fs =      require('fs');
var express = require('express');
var twitter = require('twitter');
var io      = require('socket.io');
var http    = require('http');
var config  = require(__dirname + '/config.json');
var utils   = require(__dirname + '/settings/utils.js');
var rights  = require(__dirname + '/settings/rights.js')(config);

var twit = new twitter({
  consumer_key: config.twitter.consumer_key,
  consumer_secret: config.twitter.consumer_secret,
  access_token_key: config.twitter.access_token_key,
  access_token_secret: config.twitter.access_token_secret
});

// Init
var app = express();
var server  = http.createServer(app);

// Express settings
app
  .use(express.static(__dirname + '/public'))
  .set('view options', {
      layout: 'layout'
  })
  .set('views', __dirname + '/views')
  .set('view engine', 'hbs');

// Routes
app.get('/', function(req, res) {
  res.render('index');
});

// ### SOCKET.IO ####
var socket = require('socket.io').listen(server);

// Socket settings
socket.on('connection', function(sock) {
  sock.on('beginTransmisson', function() {
    // console.log('Ok! Got your request. Will send some data soon.');

    // First, send hashtag data
    sock.emit('hashtags', config.app.hashtags);

    app.twSearch(config.app.hashtags, sock);
  });
});

// Functions used by twit
app.twSearch = function(keyword, sock) {
  // console.log('## Search started ##', keyword);

  for (var i = 0; i < config.app.hashtags.length; i++) {
    twit.get('search/tweets', {q: config.app.hashtags[i]}, function(err, data) {

      if (!err && data && data.statuses) {
        // console.log('found ', data);
        data.statuses = data.statuses.reverse();
        for (var tweet in data.statuses) {
          data.statuses[tweet].CHECK = rights.checkUser({
            username  : data.statuses[tweet].from_user,
            userid    : data.statuses[tweet].from_user_id,
            tweetisok : false
          }, 'search');

          if (data.statuses[tweet].CHECK.tweetisok) {
            data.statuses[tweet].text = utils.parseHasTags(data.statuses[tweet].text);
            data.statuses[tweet].text = utils.parseLinks(data.statuses[tweet].text);
            sock.emit('tweetSearch', data.statuses[tweet]);
          } else {
            console.log('!= ' + data.statuses[tweet].from_user + ' =! blocked!!');
          }
        }

      } else {
          console.log('err', err);
      }
    });

  }

  app.twStream(sock);
};

app.twStream = function(sock) {
  twit.stream('statuses/filter', {track: 'bcef15'}, function(stream) {
    stream.on('data', function(data) {
      if (data && data.text) {
        data.CHECK = rights.checkUser({
          username      : data.user.screen_name,
          userid        : data.user.id,
          description   : data.user.description,
          followerscount: data.user.followers_count,
          friendscount  : data.user.friends_count,
          created       : data.user.created_at,
          tweetisok     : false
        });

        if (data.CHECK.tweetisok) {
          data.text = utils.parseHasTags(data.text);
          data.text = utils.parseLinks(data.text);

          // Send data to sender
          sock.emit('tweet', data);
          // console.log('ein tweet ein tweet!');

          // send data to all other clients exept sender
          sock.broadcast.emit('tweet', data);
        } else {
          console.log('!= ' + data.user.screen_name + ' =! blocked!!');
        }
      }
    });

    stream.on('error', function(err) {
      console.log('_ stream error', err);
    });
  });
};

// Listen on port
server.listen(config.app.port);
console.log('Server started on port ' + config.app.port);