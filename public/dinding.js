(function() {

	if (window.dinding === null) window.dinding = {};

	dinding = {

		socket: io.connect(),

		addTag: function(data) {
			dinding.socket.emit('data', 'addHashTag', $('#data').attr('value'));
			dinding.socket.disconnect();
			dinding.socket.socket.reconnect();

			$('#addSuccess').show();
			$('#addSuccess').css({opacity: 1});

			setTimeout(function() {
				$('#addSuccess').animate({opacity: 0}, 'slow');
			}, 800);
			setTimeout(function() {
				$('#addSuccess').hide();
			}, 1200);
		}
	};

	$(document).ready(function() {
		dinding.socket.on('tweet', function(data) {
			data = JSON.parse(data);

			if (data.text) replacedText = data.text;
			if (!data.user) return;

			$('<li></li>').html('<div class="tweet-content">'+ data.text 
				+ '</div><div class="tweet-author"><img style="height: 48px; width: 48px;" src="'
				+ data.user.profile_image_url + '" /><span>[' 
				+ data.user.screen_name + '</span></div>')
			.prependTo('#dinding')
			.css({opacity: 0}).slideDown('slow').animate({opacity: 1}, 'slow');
		});

		dinding.socket.on('connect', function() {
			dinding.socket.emit('gethashtags', {});
		});

		dinding.socket.on('hashtags', function(data) {
			dinding.hastags = data;
			$('#tracker').empty();

			data.forEach(function(str) {
				$('<div class="alert alert-block alert-error fade in"><a class="close" data-dismiss="alert" id="'+str+'" href="#">&times;</a><p>' + str + '</p></div>').prependTo('#tracker');
			});
		});

		$('#tracker').delegate('a', 'click', function() {
			dinding.socket.emit( 'data', '-', $(this).attr('id'));
			dinding.socket.disconnect();
			dinding.socket.socket.reconnect();
		});

	});

	return dinding;

}).call(this);