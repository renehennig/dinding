(function() {

	//try {

		var app, express, twitter, io, socket, search,
		hashtags = [], tweetdata, count;

		express = require('express');
		twitter = require('ntwitter');
		io = require('socket.io');

		app = express.createServer();

		twitter = new twitter({
			consumer_key: '',
			consumer_secret: '',
			access_token_key: '',
			access_token_secret: ''
		});

		app.configure(function() {
			app.use(express['static'](__dirname + '/public'));
			return app.use(app.router);
		});

		app.listen(1337);

		socket = io.listen(app);

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

						var tag;
						for (tag in hashtags) {
							str = hashtags[tag];
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
							tweetdata = data;
						}


						/*hashtags.forEach(function(str) {
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
							tweetdata = data;
						});*/
						
						if (tweetdata) socket.emit('tweet', JSON.stringify(tweetdata));
					});

				});
			}
		});

		app.get('/', function(req, res) {
			console.log('query', req.query);
			console.log('params', req.params);
			res.render('index.html');
		});

		console.log('"dinding" is running at http://localhost:1337/');
	//} catch (e) {
	//	console.log('error ==> ', arguments);
	//}

}).call(this);