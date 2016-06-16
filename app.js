/**
 * Module dependencied
 */
var express = require('express'),
	  routes = require('./routes'),
	    user = require('./routes/user'),
		 http = require('http'),
		 path = require('path'),
		mysql = require('mysql');

/**
 * Define MYSQL configuration and connect to database
 */
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'username',
	password : 'password',
	database : 'database'
});

var app = express();

// Connect to database
connection.connect();

/**
 * Configure app
 */
app.configure(function() {
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({secret: '1234567890QWERTY'}));
	app.use(app.router);
	app.use(require('stylus').middleware(__dirname + '/public'));
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

// connection.escape(variable)

app.get('/', function(req, res) {
	var p_food = 0;
	if (req.session.username) {
		connection.query('SELECT * FROM userdata WHERE username = ?', [ req.session.username ], function(err, rows) {
			rows = JSON.parse(JSON.stringify(rows));
			console.log(rows);
			p_food = rows[0].p_food;
			p_drink = rows[0].p_drink;
			p_wc = rows[0].p_wc;
			res.render('home', {
				  title: 'Aloitus'
				 ,username: null || req.session.username
				 ,p_food: 0 || p_food
				 ,p_drink: 0 || p_drink
				 ,p_wc: 0 || p_wc
			});

		});
	} else {
		res.render('home', {
			  title: 'Aloitus'
			 ,username: null || req.session.username
			 ,p_food: 0
			 ,p_drink: 0
			 ,p_wc: 0
		});
	}
});

app.post('/', function (req, res) {
	 if (req.body.username) {
	   req.session.username = req.body.username;
		connection.query('SELECT COUNT(username) AS num FROM userdata WHERE username = ?', [ req.body.username ], function(err, rows) {
			rows = JSON.parse(JSON.stringify(rows));
			if (rows[0].num == 0) {
				connection.query('INSERT INTO userdata (username) VALUES (?)', req.session.username);
			}
		});
	 } else {
		req.session.username = null;
	 }
    res.send('Post page');
	 res.redirect('/');
});

app.get('/drink', function(req, res) {
	res.render('drink', {
		 title: 'Drink'
		,username: null || req.session.username
	});
});

app.post('/drink', function (req, res) {
	if (req.body.use_drink) {
		connection.query(
		  'UPDATE userdata SET p_drink = p_drink + ? WHERE username = ?', [ 1, req.session.username ], function (err, result) {
		      if (err) throw err;
      	   console.log('Changed ' + result.changedRows + ' rows');
		  }
		);
		res.redirect('/drink');
	}
});

app.get('/food', function(req, res){
	res.render('eat', {
		 title: 'Food'
		,username: null || req.session.username
	});
});

app.post('/food', function (req, res) {
	if (req.body.use_food) {
		connection.query(
		  'UPDATE userdata SET p_food = p_food + ? WHERE username = ?', [ 1, req.session.username ], function (err, result) {
		      if (err) throw err;
      	   console.log('Changed ' + result.changedRows + ' rows');
		  }
		);
		res.redirect('/food');
	}
});

app.get('/wc', function(req, res){
	res.render('wc', {
		 title: 'WC'
		,username: null || req.session.username
	});
});

app.post('/wc', function (req, res) {
	if (req.body.use_wc) {
		connection.query(
		  'UPDATE userdata SET p_wc = p_wc + ? WHERE username = ?', [ 1, req.session.username ], function (err, result) {
		      if (err) throw err;
      	   console.log('Changed ' + result.changedRows + ' rows');
		  }
		);
		res.redirect('/wc');
	}
});

http.createServer(app).listen(app.get('port'), function() {
	console.log("Express server listening on port " + app.get('port'));
});
