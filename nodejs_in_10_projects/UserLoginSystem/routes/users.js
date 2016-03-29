var express = require('express');
var router = express.Router();
var multer = require('multer');
var uploads = multer({dest:'./uploads/'});
var User = require('../models/user');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({
	extended: false
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register',{
	  'title' : 'Register'
  });
});

router.get('/login', function(req, res, next) {
  res.render('login',{
	  'title' : 'Log In'
  });
});

router.post('/register', uploads.single('profileImage'), function(req, res, next) {
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;
	console.log(req.body);
	console.log(req.file);
	console.log("Name: " + name + " Email: " + email + " Username: " + username + " Password: " + password + " Password2: " + password2);
	
	// Check for image field
	if (req.file) {
		console.log("Uploading File...");
		
		// File Info
		var profileImageOriginalName = req.file.originalname;
		var profileImageName         = req.file.name;
		var profileImageMime         = req.file.mimetype;
		var profileImagePath         = req.file.path;
		var profileImageExt         = req.file.extension;
		var profileImageSize         = req.file.size;
	} else {
		console.log("Using default file...");
		// Set a default image
		var profileImage = 'noimage.png';
	}

	// Form validator
	req.checkBody('name','Name field is required').notEmpty();
	req.checkBody('email','Email field is required').notEmpty();
	req.checkBody('email','Email is not valid').isEmail();
	req.checkBody('username','Username field is required').notEmpty();
	req.checkBody('password','Password field is required').notEmpty();
	req.checkBody('password2','Passwords do not match').equals(req.body.password);
	
	// Check for errors
	var errors = req.validationErrors();
	if (errors) {
		res.render('register',{
			errors : errors,
			'name' : name,
			'email': email,
			'username' : username,
			'password' : password,
			'password2' : password2
		});
	} else {
		var newUser = new User({
			name : name,
			email: email,
			username : username,
			password : password,
			profileImage : profileImage
		});
		
		//Create user
		User.createUser(newUser, function (err, user) {
			if (err) throw err;
			console.log(user);
		});
		
		//Success Message
		req.flash('success','You are now reqistered and may log in');
		res.location('/');
		res.redirect('/');
	}
});

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.getUserById(id, function(err, user) {
		done(err, user);
	});
});

passport.use(new LocalStrategy(function(username, password, done){
	console.log('LocalStrategy verifying user ' + username);
	User.getUserByUsername(username, function (err, user) {
		if (err) throw err;
		if (!user){
			console.log('Unknown User');
			return done(null, false, {message: 'Unknown User'});
		}
		
		User.comparePasswords(password, user.password, function(err, isMatch){
			if (err) throw err;
			if (isMatch) {
				console.log('Password verified');
				return done(null,user);
			} else {
				console.log('Invalid Password');
				return done(null,false,{message:'Invalid Password'});
			}
		});
	});
}));

router.post('/login',
	uploads.single(),
	passport.authenticate('local', {failureRedirect:'/users/login', 
		failureFlash:'Invalid username or password'}), 
	function(req, res, next) {
		// If this function gets called, authentication was successful
		console.log('Authentication Successful');
		req.flash('success','You are logged in');
		res.redirect('/');
});

router.get('/logout', function (req, res) {
	req.logout();
	req.flash('success','You have logged out');
	res.redirect('/users/login');
});


module.exports = router;
