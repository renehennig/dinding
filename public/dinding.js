(function() {

	if (window.dinding === null) window.dinding = {};

	dinding = {
		socket: io.connect()
	};

	$(document).ready(function() {
		dinding.socket.on('tweet', function(data) {
			data = JSON.parse(data);

			if (data.text) replacedText = data.text;
			if (!data.user) return;

			$('<li></li>').html('<div class="tweet-content">'+ data.text +
				'</div><div class="tweet-author"><img style="height: 48px; width: 48px;" src="' +
				data.user.profile_image_url + '" /><span>' +
				data.user.screen_name + '</span></div>')
			.prependTo('#dinding')
			.css({opacity: 0}).slideDown('slow').animate({opacity: 1}, 'slow');

			$($('#dinding li')[20]).remove();

		});

		dinding.socket.on('connect', function() {
			console.log('### CONNECTION LOST - RECONNECT');
			dinding.socket.emit('gethashtags', {});
		});

		dinding.socket.on('hashtags', function(data) {
			dinding.hashtags = data;
			$('.nav').empty();

			data.forEach(function(str) {
				$('<li><a>' + str + '</a></li>').prependTo('.nav');
			});
		});

		dinding.socket.on('destroyed', function() {
			console.log('##### RECONNECT destroyed #####');
			dinding.socket.socket.reconnect();
		});

		dinding.socket.on('streamEnd', function() {
			console.log('##### RECONNECT streamEnd #####');
			dinding.socket.socket.reconnect();
		});

		$('#tracker').delegate('a', 'click', function() {
			dinding.socket.emit( 'data', '-', $(this).attr('id'));
			dinding.socket.disconnect();
			dinding.socket.socket.reconnect();
		});

	});

	return dinding;

}).call(this);