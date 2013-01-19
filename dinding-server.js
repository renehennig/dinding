/**
 * Node Server [dinding]
 * Twitter Wall
 */

var fs =      require('fs');
var express = require('express');
var twitter = require('ntwitter');
var io      = require('socket.io');
var http    = require('http');
var openw   = require('open');
var config  = require(__dirname + '/config.json');
var utils   = require(__dirname + '/settings/utils.js');
var rights  = require(__dirname + '/settings/rights.js')(config);
var twit    = require(__dirname + '/settings/twitter.js')(twitter, config);

// Init
var dinding = express(),
    server  = http.createServer(dinding);

// Express settings
dinding.configure(function() {
  dinding.use(express['static'](__dirname + '/public'));
  dinding.use(express.bodyParser());
  dinding.use(express.methodOverride());
  dinding.use(dinding.router);
  dinding.set('view options', {layout: false});
  dinding.set('view engine', 'hbs');
});

// Routes
dinding.get('/', function(req, res) {
  res.render('index');
});

// ### SOCKET.IO ####
var socket = require('socket.io').listen(server);

// Socket settings
socket.set('log level', 1);
socket.on('connection', function(sock) {
  sock.on('beginTransmisson', function() {
    console.log('Ok! Got your request. Will send some data soon.');

    // First, send hashtag data
    sock.emit('hashtags', config.dinding.hashtags);

    dinding.twSearch(config.dinding.hashtags, sock);
  });
});

// Functions used by twit
dinding.twSearch = function(keyword, sock) {
  console.log('## Search started ##', keyword);

  twit.search(keyword, {}, function(err, data) {
    if (!err && data && data.results) {
      data.results = data.results.reverse();
      
      for (var tweet in data.results) {
        data.results[tweet].CHECK = rights.checkUser({
          username  : data.results[tweet].from_user,
          userid    : data.results[tweet].from_user_id,
          tweetisok : false
        }, 'search');

        if (data.results[tweet].CHECK.tweetisok) {
          data.results[tweet].text = utils.parseHasTags(data.results[tweet].text);
          data.results[tweet].text = utils.parseLinks(data.results[tweet].text);
          sock.emit('tweetSearch', data.results[tweet]);
        } else {
          console.log('!= ' + data.results[tweet].from_user + ' =! blocked!!');
        }
      }

    } else {
      console.log(err);
    }
  });

  dinding.twStream(sock);
};

dinding.twStream = function(sock) {
  if (!dinding.twitterInitialized) {
    twit.stream('statuses/filter', {track: config.dinding.hashtags}, function(stream) {
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

            // send data to all other clients exept sender
            sock.broadcast.emit('tweet', data);
          } else {
            console.log('!= ' + data.user.screen_name + ' =! blocked!!');
          }
        }
      });

      stream.on('error', function() {
        console.log('_ stream error', arguments);
      });
    });
  }
};

// Listen on port
server.listen(config.dinding.port);
openw('http://localhost:' + config.dinding.port);
console.log('Server started on port ' + config.dinding.port);