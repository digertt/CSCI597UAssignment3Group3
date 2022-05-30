require('dotenv').config();
const express = require('express');
const config = require('./config/config');
const compression = require ('compression');
const helmet = require('helmet');
const https= require("https");
const fs = require('fs');
const Redis = require('ioredis');


const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const RedisStore = require('connect-redis')(session);

const userRouter = require('./routes/user.routes');
const postRouter = require('./routes/post.routes');

const passwordHandler = require('./middleware/passwords.middleware');

const app = express();

app.set('view engine', 'ejs');
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(compression());
app.use(express.static('public'));

  
app.set('trust proxy', 1); // trust first proxy

const port = config.get('port') || 3000;
const blogDB = config.get('db.name')

const blog_db_url =
	config.get('db.db_url') +
	config.get('db.password') +
	config.get('db.host') +
	blogDB +
	'?retryWrites=true&w=majority';

const dbConnection = mysql.createConnection({
	host     : config.get('db.host'),
	user     : config.get('db.name'),
	password : config.get('db.password'),
	port     : config.get('db.port'),
	database : config.get('db.database')
  });

dbConnection.connect(function(err) {
	if (err) {
		console.error('Database connection failed: ' + err.stack);
		return;
	}
	console.log('Connected to database.');
	// ensure schema is built out.
	dbConnection.query(`SELECT 
							TABLE_SCHEMA, 
							TABLE_NAME,
							TABLE_TYPE
						FROM 
							information_schema.TABLES 
						WHERE 
							TABLE_TYPE LIKE 'BASE TABLE' AND
							TABLE_NAME IN ('users', 'posts');`,
	(error, results, fields) => {
		if (error) { return error; }
		if (results.length == 0) {
			// tables don't exist, create them.
			dbConnection.query(`CREATE TABLE users (id int primary key AUTO_INCREMENT, username varchar(255), email varchar(255) not null, password varchar(255) not null, salt varchar(130) not null)`, (error, results, fields) => {
				if (error) { return error; }
				dbConnection.query(`CREATE TABLE posts (postId int primary key AUTO_INCREMENT, username varchar(255) not null, title TEXT not null, content LONGTEXT not null)`, (error, results, fields) => {
					if (error) { return error; }
					console.log('schema created') ;
				});
			});
		}
	});
});

// not sure if we need username/password to connect to redis?
const redis = new Redis("redis://" + config.get("redis_host") + ":" + config.get("redis_port"));
// redis.connect().catch(console.error)

app.use(
	session({
		secret: config.get('secret'),
		resave: false,
    	store: new RedisStore({
			client: redis,
			ttl: 2 * 24 * 60 * 60
		}),
		saveUninitialized: false,
		cookie: { secure: 'auto' }
	})
);

app.use(passport.initialize());
app.use(passport.session());

const verifyCallback = (username, password, done) => {
	dbConnection.query(`select * from users where email = ?`, [username], (error, results, fields) => {
		if (error) {
			return done(error);
		}
		if (results.length == 0) {
			// user does not exist.
			return done(null, false);
		}
		const isValid = passwordHandler.validPassword(password, results[0].password, results[0].salt);
		user = {id:results[0].id, username:results[0].username, email:results[0].email, hash:results[0].password, salt:results[0].salt};
		if (isValid) {
			return done(null, user);
		} else {
			console.log('login failed')
			return done(null, false);
		}
	});
}

const strategy = new LocalStrategy({usernameField: 'email', passwordField: 'password'}, verifyCallback);
passport.use(strategy);

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	dbConnection.query(`SELECT * FROM users where id = ?`, [id], (error, results, fields) => {
		done(null, results[0]);
	});
});

app.use(function(req, res, next) {
	res.locals.isAuthenticated=req.isAuthenticated();
	next();
});

app.use('/user', userRouter);

app.use('/post', postRouter);

app.all('*', function(req, res) {
  res.redirect("/post/about");
});

const server = https.createServer({
	key: fs.readFileSync('server.key'),
	cert: fs.readFileSync('server.cert')
}, app).listen(port,() => {
console.log('Listening ...Server started on port ' + port);
});

module.exports = app;