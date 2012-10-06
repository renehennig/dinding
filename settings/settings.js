(function() {

	module.exports = function(dinding, express, dir) {

		dinding.configure(function() {
			dinding.use(express['static'](dir + '/public'));
			dinding.use(express.bodyParser());
			dinding.use(express.methodOverride());
			dinding.use(dinding.router);
		});

		dinding.set('view options', {layout: false});

		dinding.set('view engine', 'hbs');

		/*dinding.register('.html', {
    compile: function(str, options){
      return function(locals){
        return str;
      };
    }
  });*/

		/*dinding.engine('.html', function () {
			compile: function bernd(str, options){
				return function(locals){
					return str;
				};
			}
		});*/

	};
	
}).call(this);

/*
dinding.configure(function() {
		dinding.use(express['static'](__dirname + '/public'));
		dinding.use(express.favicon());
		//dinding.use(express.logger('dev'));
		dinding.use(express.bodyParser());
		dinding.use(express.cookieParser('iHaVeNoSeCrEtS'));
		dinding.use(express.methodOverride());
		//dinding.set('view engine', 'hbs');
		//dinding.use(express.session({
		//	key: 'gPush',
		//	store: new redis()
		//}));
		//dinding.use(flash());

		// Flash message
		//dinding.use(function(req, res, next) {
		//	res.locals.flashMessages = flashMessages(req, res);
		//	next();
		//});

		//dinding.use(passport.initialize());
		//dinding.use(passport.session());

		// Modify header
		//dinding.use(header);

		//dinding.use(dinding.router);

		// Error handling
		//dinding.use(err404);
		//dinding.use(err500);
		//dinding.use(exeption);
	});*/