(function() {

	var fs, express, twitter, io, config,
	dinding, utils, rights, socket;

	fs			= require('fs');
	express	= require('express');
	twitter = require('ntwitter');
	io			= require('socket.io');
	config	= require('./config.json');
	utils		= require('./settings/utils.js');
	rights	= require('./settings/rights.js');

	// init server
	dinding = express.createServer();

	//
	dinding.streamInitialized = false;

	require('./settings/settings.js')(dinding, express, __dirname);
	twitter = require('./settings/twitter.js')(twitter, config);


	dinding.get('/', function(req, res) {
		res.render('index.html');
	});

	// ### SOCKET.IO ####
	socket = io.listen(dinding);
	socket.set('log level', 1);
	socket.on('connection', function(sock) {

		sock.on('beginTransmisson', function() {
			console.log('K! Got your request. Will send data soon.');

			// First, send hashtag data
			sock.emit('hashtags', config.dinding.hashtags);

			dinding.twSearch(config.dinding.hashtags, sock);
		});

	});

	dinding.twSearch = function(keyword, sock) {
		console.log('## Search started ##', keyword);

		twitter.search(keyword, {}, function(err, data) {
			if (!err && data && data.results) {
				data.results = data.results.reverse();
				for (var tweet in data.results) {

					data.results[tweet].CHECK = rights.checkUser({
						username	: data.results[tweet].from_user,
						userid		: data.results[tweet].from_user_id,
						tweetisok	: false
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
			dinding.streamInitialized = true;

			twitter.stream('statuses/filter', {track: config.dinding.hashtags}, function(stream) {

				stream.on('data', function(data) {
					if (data && data.text) {

						data.CHECK = rights.checkUser({
							username			: data.user.screen_name,
							userid				: data.user.id,
							description		: data.user.description,
							followerscount: data.user.followers_count,
							friendscount	: data.user.friends_count,
							created				: data.user.created_at,
							tweetisok			: false
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

	dinding.listen(config.dinding.port);
	console.log('Server started on port ' + config.dinding.port);

}).call(this);