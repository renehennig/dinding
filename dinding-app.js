(function() {

	var fs, express, twitter, io, config,
	dinding, socket, _stream_,
	count, tweetdata, streamStatus = false, destroy;

	fs = require('fs');
	express = require('express');
	twitter = require('ntwitter');
	io = require('socket.io');
	config = require('./config.json');


	// Config filewatcher.
	// For whitelist, blacklist or hashtag changes
	// while using
	/*fs.watchFile('./config.json', function(curr, prev) {
		if (curr.size != prev.size) {
			fs.readFile('./config.json', 'ascii', function(err, data) {
				try {
					config = JSON.parse(data);
					console.log('___ DESTROING STREAM DUE RELOAD HASHTAGS ___');
					//_stream_.destroy();
					destroy = true;
				} catch (e) {
					console.log('An error ... ', e);
				}
			});
		}
	});*/


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
	socket.set('log level', 2);

	socket.on('error', function() {
		console.log('socket error => ');
	});

	socket.on('connection', function(socket) {
		console.log('socket connected');
		twitterSearch(socket, config.dinding.hashtags[0]);
		sendHashTags(socket);
	});

<<<<<<< HEAD
	


=======
>>>>>>> 2cb1190cb0b69660b76a2553757289f1468a9a60
	socket.on('end', function() {
		console.log('socket, transport end');
	});


<<<<<<< HEAD
	/*
	var regTag = new RegExp(/[#]+[A-Za-z0-9\-_]/, 'gim');
					data.text = data.text.replace(regTag, function(tag) {
						console.log(tag);
					});

	*/


	function parseHashTags(string) {
		return string.replace(/[#]+[A-Za-z0-9\-_]+/gim, function(tag) {
			return '<a href="http://search.twitter.com/search?q=' + tag + '">' + tag + '</a>';
		});
	}

	function parseLabel(string) {
		config.dinding.hashtags.forEach(function(tag) {
			var search = new RegExp(tag, 'gim');
			string = string.replace(search, '<span class="label label-success">' + tag + '</span>');
		});
		return string;
	}

	/*unction parseUrls(string) {
		return string.replace(/[A-Za-z]+:\/\/[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_:%&~\?\/.=]+/gim, function(url) {
			return url;
		});
	}*/





=======
>>>>>>> 2cb1190cb0b69660b76a2553757289f1468a9a60
	function sendHashTags(_socket) {
		_socket.emit('hashtags', config.dinding.hashtags);
	}


	function twitterSearch(_socket, keyword) {
		twitter.search(keyword, {}, function(err, data) {
			for (var tweet in data.results) {
				
				data.results[tweet].text = parseLabel(data.results[tweet].text);
				data.results[tweet].text = parseHashTags(data.results[tweet].text);

				_socket.emit('tweetSearch', data.results[tweet]);
			}
		});

		twitterStream(_socket);
	}

	function twitterStream(_socket) {
		if (!!streamStatus) return;

		console.log('___ TWITTERSTREAM STARTED ___', config.dinding.hashtags);
		//sendHashTags(_socket);

		twitter.stream('statuses/filter', {track: config.dinding.hashtags}, function(stream) {

			streamStatus = true;
			_stream_ = stream;

			stream.on('error', function() {
				console.log('_ stream error', arguments);
			});

			stream.on('data', function(data) {

				//console.log(data);

				/*if (destroy) {
					stream.destroy();
					_socket.destroy();
					destroy = false;
				}*/
				
	//			config.dinding.hashtags.forEach(function(str) {
	//				tweetdata = null, count = 0;
	//
	//				/*for (x = 0; x < config.dinding.hashtags.length; x++) {
	//					if (data.text.indexOf(config.dinding.hashtags[x]) === -1) {
	//						count++;
	//					}
	//				}*/
	//
	//				/*if (count === config.dinding.hashtags.length) {
	//					return;
	//				}*/
	//
					
					data.text = parseLabel(data.text);
					data.text = parseHashTags(data.text);

	//				search = new RegExp(str, 'gim');
	//				data.text = data.text.replace(search, '<span class="label label-success">' + str + '</span>');

					



					
	//				//data.text = parseUrls(data.text);

					tweetdata = data;
	//			});

				if (tweetdata) {
					_socket.broadcast.emit('tweet', tweetdata);
				}
			});

			stream.on('destroy', function() {
				console.log('SELF DESTROY!!!');
				streamStatus = null;
			});

			stream.on('startstream', function(socket) {
				console.log('startStream???', socket);
			});

		});
	}

}).call(this);