var express = require('express');
var router = express.Router();
var multer = require('multer');
var uploads = multer({dest:'./uploads/'});
var User = require('../models/user');
var bodyParser = require('body-parser');

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


module.exports = router;
