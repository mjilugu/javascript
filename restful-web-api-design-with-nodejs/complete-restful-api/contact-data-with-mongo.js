var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');
var mongoose = require('mongoose');
var dataservice = require('./modules/contactdataservice');
var app = express();
var url = require('url');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(methodOverride());
app.use(bodyParser.json());

// development only
if ('development' == app.get('env')) {
	app.use(errorHandler());
}

mongoose.connect('mongodb://localhost/contacts');

var contactSchema = new mongoose.Schema({
	primarycontactnumber: {type: String, index: {unique: true}},
	firstname: String,
	lastname: String,
	title: String,
	company: String,
	jobtitle: String,
	othercontactnumbers: [String],
	primaryemailaddress: String,
	emailaddresses: [String],
	groups: [String]
});

var Contact = mongoose.model('Contact', contactSchema);

app.get('/contacts/:number', function (request, response) {
	console.log(request.url + ' : querying for ' + request.params.number);
	dataservice.findByNumber(Contact, request.params.number, response);
});

app.post('/contacts', function (request, response) {
	dataservice.update(Contact, request.body, response);
});

app.put('/contacts', function (request, response) {
	dataservice.create(Contact, request.body, response);
});

app.del('/contacts/:primarycontactnumber', function(request, response){
	dataservice.remove(Contact, request.params.primarycontactnumber, response);
});

app.get('/contacts', function (request, response) {
	console.log('Listing all contacts with ' + request.params.key + '=' + request.params.value);
	dataservice.list(Contact, response);
});

console.log('Running at port ' + app.get('port'));
http.createServer(app).listen(app.get('port'));
