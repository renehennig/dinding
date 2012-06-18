(function() {

	if (window.dinding === null) window.dinding = {};

	dinding = {
		version: '0.0.1',
		socket: io.connect(),
		connected: 0
	};

	$(document).ready(function() {

		dinding.socket.on('connect', function() {
			//console.log('### connected', arguments);
		});

		// Get current hashtags
		dinding.socket.on('hashtags', function(tags) {
			// Clear hashtag list
			$('.nav').empty();

			// Write new tags
			tags.forEach(function(tag) {
				$('<li><a>' + tag + '</a></li>').prependTo('.nav');
			});
		});

		dinding.socket.on('tweet', function(data) {
			//console.log('INCOMING TWEET', arguments);

			$('<li></li>').html('<div class="tweet-content">'+ data.text +
				'</div><div class="tweet-author"><img style="height: 48px; width: 48px;" src="' +
				data.user.profile_image_url + '" /><span>' +
				data.user.screen_name + '</span></div>')
			.prependTo('#dinding')
			.css({opacity: 0}).slideDown('slow').animate({opacity: 1}, 'slow');

			$($('#dinding li')[20]).remove();
		});

	});

}).call(this);