(function() {

	if (window.dinding === null) window.dinding = {};

	var oldTweet;

	dinding = {};

	// var host = window.location.hostname;
// console.log(host);
// 	if(host == 'www.barcamp-erfurt.de') {
// console.log('sub folder', 'http://'+ host);
// 		dinding.socket = io.connect('http://' + host, {path: '/twitterwall/socket.io'});
// 	}
// 	else {
// console.log('no subfolder');
		dinding.socket = io.connect();
	// }

	dinding.showTweets = 20;

	dinding.tweetCount = 0;

	dinding.socket.on('connect', function() {
		console.log('K! Were connected now. Please start transmission!');
		dinding.socket.emit('beginTransmisson');
	});


	dinding.socket.on('hashtags', function(tags) {
		// Clear hashtag list
		$('.nav').empty();

		// Write new tags
		tags.forEach(function(tag) {
			$('<li><a>' + tag + '</a></li>').prependTo('.nav');
		});
	});

	dinding.socket.on('tweet', function(data) {
		//dinding.twCount();
		console.log('new tweet');
		$('<li></li>').html('<div class="tweet-content">'+ data.text +
			'</div><div class="tweet-author"><img style="height: 48px; width: 48px;" src="' +
			data.user.profile_image_url + '" /><a target="_blank" href="http://twitter.com/' +
			data.user.screen_name + '">@' +
			data.user.screen_name + '</a></div>')
		.prependTo('#dinding')
		.css({opacity: 0}).slideDown('slow').animate({opacity: 1}, 'slow');

		$($('#dinding li')[dinding.showTweets]).remove();
	});

	dinding.socket.on('tweetSearch', function(data) {
		//dinding.twCount();

		if (oldTweet !== data.text) {
			oldTweet = data.text;

			$('<li></li>').html('<div class="tweet-content">'+ data.text +
				'</div><div class="tweet-author"><img style="height: 48px; width: 48px;" src="' +
				data.user.profile_image_url + '" /><a target="_blank" href="http://twitter.com/' +
				data.user.screen_name + '">@' +
				data.user.screen_name + '</a></div>')
			.prependTo('#dinding')
			.css({opacity: 0}).slideDown('slow').animate({opacity: 1}, 'slow');
		}


		$($('#dinding li')[dinding.showTweets]).remove();
	});

	dinding.twCount = function() {
		++dinding.tweetCount;
		$('#twCount').html(dinding.tweetCount);
	};

}).call(this);
