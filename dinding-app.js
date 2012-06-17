(function() {

	var app, express, twitter, io, socket, fs, search,
	hashtags = [], tweetdata, count, config, whitelist;

	fs = require('fs');
	express = require('express');
	twitter = require('ntwitter');
	io = require('socket.io');
	config = require('./config.js');

	setInterval(function() {
		fs.readFile('whitelist.json', 'ascii', function(err, data) {
			if (err) {
				//
			} else {
				if (data) {
					try {
						whitelist = JSON.parse(data);
					} catch (e) {
						console.log('Your "whitelist.json" file has no valid JSON!!');
					}
				}
			}
		});
	}, 1000);

	app = express.createServer();

	twitter = new twitter({
		consumer_key: config.consumer_key,
		consumer_secret: config.consumer_secret,
		access_token_key: config.access_token_key,
		access_token_secret: config.access_token_secret
	});

	app.configure(function() {
		app.use(express['static'](__dirname + '/public'));
		return app.use(app.router);
	});

	app.listen(1337);

	socket = io.listen(app);
	socket.set('log level', 1);

	socket.on('connection', function(socket) {
		socket.on('data', function(action, data) {
			
			if (action === 'addHashTag') {
				hashtags.push(data);
			} else {
				if (hashtags.indexOf(data) !== -1) {
					hashtags.splice(hashtags.indexOf(data), 1);
				}
			}
		});

		socket.on('gethashtags', function() {
			socket.emit('hashtags', hashtags);
		});

		if (hashtags.length > 0) {
			twitter.stream('statuses/filter', {track: hashtags}, function(stream) {

				stream.on('data', function(data) {

					if (!data || !data.text) return;

					hashtags.forEach(function(str) {
						tweetdata = null;
						count = 0;

						for (x = 0; x < hashtags.length; x++) {
							if (data.text.indexOf(hashtags[x]) === -1) {
								count++;
							}
						}

						if (count === 3) return;

						search = new RegExp(str, 'gim');
						data.text = data.text.replace(search, '<span class="label label-success">' + str + '</span>');
						data.text = strencode(data.text);
						tweetdata = data;
					});
					
					if (tweetdata) socket.emit('tweet', JSON.stringify(tweetdata));
				});


				stream.on('end', function (response) {
					console.log('STREAM END', arguments);
					// Handle a disconnection
					socket.disconnect();
					socket.socket.reconnect();
				});

				stream.on('destroy', function (response) {
					console.log('STREAM DESTROY', arguments);
					socket.disconnect();
					socket.socket.reconnect();
					// Handle a 'silent' disconnection from Twitter, no end/error event fired
				});

				//setTimeout(stream.destroy, 5000);


			});
		}
	});

	app.get('/', function(req, res) {
		console.log('query', req.query);
		console.log('params', req.params);
		res.render('index.html');
	});

	console.log('"dinding" is running at http://localhost:1337/');


	function strencode( data ) {
		return unescape( encodeURIComponent( JSON.stringify( data ) ) );
	}

	function strdecode( data ) {
		return JSON.parse( decodeURIComponent( escape ( data ) ) );
	}
	
}).call(this);