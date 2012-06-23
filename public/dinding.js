(function() {

	if (window.dinding === null) window.dinding = {};

	dinding = {};

	dinding.socket = io.connect();
	dinding.showTweets = 20;

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
		$('<li></li>').html('<div class="tweet-content">'+ data.text +
			'</div><div class="tweet-author"><img style="height: 48px; width: 48px;" src="' +
			data.user.profile_image_url + '" /><a target="_blank" href="http://twitter.com/' +
			data.user.screen_name + '">' +
			data.user.screen_name + '</a></div>')
		.prependTo('#dinding')
		.css({opacity: 0}).slideDown('slow').animate({opacity: 1}, 'slow');

		$($('#dinding li')[dinding.showTweets]).remove();
	});

	dinding.socket.on('tweetSearch', function(data) {
		$('<li></li>').html('<div class="tweet-content">'+ data.text +
			'</div><div class="tweet-author"><img style="height: 48px; width: 48px;" src="' +
			data.profile_image_url + '" /><a target="_blank" href="http://twitter.com/' +
			data.from_user + '">' +
			data.from_user + '</a></div>')
		.prependTo('#dinding')
		.css({opacity: 0}).slideDown('slow').animate({opacity: 1}, 'slow');

		$($('#dinding li')[dinding.showTweets]).remove();
	});

}).call(this);