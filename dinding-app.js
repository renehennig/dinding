(function() {

	var fs, express, twitter, io, config,
	dinding, socket, _stream_,
	count, tweetdata, streamStatus = false, destroy;

	fs = require('fs');
	express = require('express');
	twitter = require('ntwitter');
	io = require('socket.io');
	config = require('./config.json');

	// Server and server config
	dinding = express.createServer();

	dinding.configure(function() {
		dinding.use(express['static'](__dirname + '/public'));
		return dinding.use(dinding.router);
	});

	dinding.listen(1337);

	// Twitter config
	twitter = new twitter({
		consumer_key: config.twitter.consumer_key,
		consumer_secret: config.twitter.consumer_secret,
		access_token_key: config.twitter.access_token_key,
		access_token_secret: config.twitter.access_token_secret
	});

	twitter.verifyCredentials(function (err, data) {
		if (err) {
			console.log('Twitter credentials not valid!!');
		}
	});

	// socket.io
	socket = io.listen(dinding);
	socket.set('log level', 1);

	socket.on('connection', function(socket) {
		twitterSearch(socket, config.dinding.hashtags[0]);
		sendHashTags(socket);
	});

	function parseHashTags(string) {
		return string.replace(/[#]+[A-Za-z0-9\-_]+/gim, function(tag) {
			return '<a href="http://search.twitter.com/search?q=' + tag + '">' + tag + '</a>';
		});
	}

	function parseLinks(string) {
		//from http://stackoverflow.com/questions/37684/how-to-replace-plain-urls-with-links
		var exp = /(\b(https?|ftp|file):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z0-9+&@#\/%=~_|])/ig;
			return string.replace(exp,"<a target='_blank' href='$1'>$1</a>");
    }

	function sendHashTags(_socket) {
		_socket.emit('hashtags', config.dinding.hashtags);
	}

	function twitterSearch(_socket, keyword) {
		twitter.search(keyword, {}, function(err, data) {
			for (var tweet in data.results) {
				data.results[tweet].text = parseLinks(data.results[tweet].text);
				data.results[tweet].text = parseHashTags(data.results[tweet].text);
				_socket.emit('tweetSearch', data.results[tweet]);
			}
		});

		twitterStream(_socket);
	}

	function twitterStream(_socket) {
		if (!!streamStatus) return;

		twitter.stream('statuses/filter', {track: config.dinding.hashtags}, function(stream) {

			streamStatus = true;
			_stream_ = stream;

			stream.on('error', function() {
				console.log('_ stream error', arguments);
			});

			stream.on('data', function(data) {
				data.text = parseLinks(data.text);
				data.text = parseHashTags(data.text);
				_socket.broadcast.emit('tweet', data);
			});

			stream.on('destroy', function() {
				console.log('SELF DESTROY!!!');
				streamStatus = null;
			});

		});
	}

}).call(this);