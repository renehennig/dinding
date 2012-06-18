(function() {

	var app, express, twitter, io, socket, fs, search,
	hashtags = [], tweetdata, count, config, logger, whitelist;

	fs = require('fs');
	express = require('express');
	twitter = require('ntwitter');
	io = require('socket.io');
	config = require('./config.js');

	hashtags = config.hashtags;

	function loadFile(fname) {
		fs.readFile(fname + '.json', 'ascii', function(err, data) {
			if (!err && data) {
				try {
					fname = JSON.parse(data);
				} catch (e) {
					console.log('Your "' + fname + '.json" file has no valid JSON!!');
				}
			}
		});
	}

	setInterval(function() {
		loadFile('whitelist');
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
		/*socket.on('data', function(action, data) {
			
			if (action === 'addHashTag') {
				hashtags.push(data);
			} else {
				if (hashtags.indexOf(data) !== -1) {
					hashtags.splice(hashtags.indexOf(data), 1);
				}
			}
		});*/

		socket.on('gethashtags', function() {
			socket.emit('hashtags', hashtags);
		});

		if (hashtags.length > 0) {

			/*twitter.search('#node', {}, function(err, data) {

				console.log(err);

				data.text = strencode(data.text);
				socket.emit('tweet', JSON.stringify(data));
			});*/

			twitter.stream('statuses/filter', {track: hashtags}, function(stream) {

				stream.on('data', function(data) {

					if (!data || !data.text) return;

					hashtags.forEach(function(str) {
						tweetdata = null, count = 0;

						for (x = 0; x < hashtags.length; x++) {
							if (data.text.indexOf(hashtags[x]) === -1) {
								count++;
							}
						}

						if (count === 3) return;

						search = new RegExp(str, 'gim');
						data.text = data.text.replace(search, '<span class="label label-success">' + str + '</span>');
						tweetdata = data;
					});
					
					if (tweetdata) {
						socket.emit('tweet', JSON.stringify(tweetdata));
					}
				});

				stream.on('end', function (response) {
					console.log('STREAM END', arguments);
					socket.emit('streamEnd');
					stream.destroySilent();
				});

				stream.on('destroy', function (response) {
					console.log('STREAM DESTROY', arguments);
					socket.emit('destroyed');
					stream.destroySilent();
				});

			});
		}
	});

	app.get('/', function(req, res) {
		res.render('index.html');
	});

	console.log('"dinding" is running at http://localhost:1337/');
	
}).call(this);