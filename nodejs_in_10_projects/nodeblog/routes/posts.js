var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');
var multer = require('multer');
var uploads = multer({dest:'./public/images/uploads/'});

router.get('/add', function(req, res, next) {
	var categories = db.get('categories');
	categories.find({},{},function(err, categories){
		res.render('addpost', {
			"title":"Add Post",
			"categories":categories
		});
	});
});

router.get('/show/:postId', function (req, res, next) {
	var posts = db.get('posts');
	
	console.log(req.params);
	
	posts.findById(req.params.postId, function(err, posts){
		res.render('show',{
			"post" : posts
		});
	});
});

router.post('/add', uploads.single('mainimage'), function(req, res, next) {
	console.log(req.body);
	console.log(req.file);
	// get form values
	var title 		= req.body.title;
	var category 	= req.body.category;
	var body 		= req.body.body;
	var author 		= req.body.author;
	var date 		= new Date();
	
	if (req.file) {
		var mainImageOriginalName = req.file.originalname;
		var mainImageName = req.file.filename;
		var mainImageMime = req.file.mimetype;
		var mainImagePath = req.file.path;
		var mainImageExt  = req.file.extension;
		var mainImageSize = req.file.size;
	} else {
		var mainImageName = 'noimage.png';
	}
	
	// Form validation
	req.checkBody('title','Title field is required').notEmpty();
	req.checkBody('body','Body field is required').notEmpty();
	
	// Check Errors
	var errors = req.validationErrors();
	
	if (errors) {
		res.render('addpost',{
			"errors":errors,
			"title":title,
			"body":body
		});
	} else {
		var posts = db.get('posts');
		
		// Submit to DB
		posts.insert({
			"title": title,
			"body": body,
			"category": category,
			"date": date,
			"author": author,
			"mainimage": mainImageName
		}, function (err, post) {
			if (err) {
				res.send('There was an issue submitting the post');
			} else {
				req.flash('success','Post Submitted');
				res.location('/');
				res.redirect('/');
			}
		});
	}
});


router.post('/addcomment', uploads.single(), function(req, res, next) {
	console.log(req.body);
	console.log(req.file);
	// get form values
	var name 		= req.body.name;
	var email 		= req.body.email;
	var body 		= req.body.body;
	var postid 		= req.body.postid;
	var date 		= new Date();
	
	if (req.file) {
		var mainImageOriginalName = req.file.originalname;
		var mainImageName = req.file.filename;
		var mainImageMime = req.file.mimetype;
		var mainImagePath = req.file.path;
		var mainImageExt  = req.file.extension;
		var mainImageSize = req.file.size;
	} else {
		var mainImageName = 'noimage.png';
	}
	
	// Form validation
	req.checkBody('title','Title field is required').notEmpty();
	req.checkBody('body','Body field is required').notEmpty();
	
	// Check Errors
	var errors = req.validationErrors();
	
	if (errors) {
		res.render('addpost',{
			"errors":errors,
			"title":title,
			"body":body
		});
	} else {
		var posts = db.get('posts');
		
		// Submit to DB
		posts.insert({
			"title": title,
			"body": body,
			"category": category,
			"date": date,
			"author": author,
			"mainimage": mainImageName
		}, function (err, post) {
			if (err) {
				res.send('There was an issue submitting the post');
			} else {
				req.flash('success','Post Submitted');
				res.location('/');
				res.redirect('/');
			}
		});
	}
});


module.exports = router