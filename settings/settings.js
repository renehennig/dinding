(function() {

	module.exports = function(dinding, express, dir) {

		dinding.configure(function() {
			dinding.use(express['static'](dir + '/public'));
			dinding.use(express.bodyParser());
			dinding.use(express.methodOverride());
			dinding.use(dinding.router);
		});

		dinding.set('view options', {layout: false});

		dinding.engine('.html', function () {
			compile: function bernd(str, options){
				return function(locals){
					return str;
				};
			}
		});

	};
	
}).call(this);