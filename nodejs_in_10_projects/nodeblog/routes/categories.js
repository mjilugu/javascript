var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');
var multer = require('multer');
var uploads = multer({dest:'./public/images/uploads/'});

router.get('/add', function(req, res, next) {
	res.render('addcategory', {
		"title":"Add Category"
	});
});

router.get('/show/:category', function (req, res, next) {
	db = req.db;
	var posts = db.get('posts');
	posts.find({category: req.params.category},{},function(err, posts){
		res.render('index',{
			"title":req.params.category,
			"posts" : posts
		});
	});
});


router.post('/add', uploads.single(), function(req, res, next) {
	console.log(req.body);
	// get form values
	var title 		= req.body.title;
	
	// Form validation
	req.checkBody('title','Title field is required').notEmpty();
	
	// Check Errors
	var errors = req.validationErrors();
	
	if (errors) {
		res.render('addpost',{
			"errors":errors,
			"title":title
		});
	} else {
		var categories = db.get('categories');
		
		// Submit to DB
		categories.insert({
			"title": title
		}, function (err, category) {
			if (err) {
				res.send('There was an issue submitting the category');
			} else {
				req.flash('success','Category Submitted');
				res.location('/');
				res.redirect('/');
			}
		});
	}
});

module.exports = router;