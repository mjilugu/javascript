var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var contacts = require('./data/contacts');
var levelup = require('levelup');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
// app.use(express.favicon());
// app.use(express.logger('dev'));
// app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
// app.use(express.methodOverride());
// app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  // app.use(express.errorHandler());
}

// app.get('/', routes.index);
// app.get('/users', user.list);

// LevelDB
var db = levelup('./data/contacts-leveldb',{valueEncoding: 'json'});
db.put('359777123456', {
  "firstname": "Joe",
  "lastname": "Smith",
  "title": "Mr.",
  "company": "Dev Inc.",
  "jobtitle": "Developer",
  "primarycontactnumber": "+359777123456",
  "othercontactnumbers": [
    "+359777456789",
    "+359777112233"],
  "primaryemailaddress": "joe.smith@xyz.com",
  "emailaddresses": [
    "j.smith@xyz.com"],
  "groups": ["Dev","Family"]
});

db.get('359777123456', function (err, data) {
	if (err) throw err;
	console.log(data.firstname);
});

app.get('/contacts', function (req, res) {
	var query_arg = Object.keys(req.query)[0];
	var query_value = req.query[query_arg];
	console.log(query_arg + " - " + query_value);
	
	res.setHeader('content-type', 'application/json');
	
	if (query_arg == null || query_value == null) {
		res.end(JSON.stringify(contacts.list()));
	} else {
		res.end(JSON.stringify(contacts.query_by_arg(query_arg, query_value)));
	}
});

app.get('/contacts/:number', function (req, res) {
	res.setHeader('content-type', 'application/json');
	res.end(JSON.stringify(contacts.query(req.params.number)));
});

app.get('/groups', function (req, res) {
	console.log ('groups');
	res.format({
		'application/json' : function() {
			res.setHeader('content-type', 'application/json');
			res.end(JSON.stringify(contacts.list_groups()));
		},
		'default' : function () {
			res.status(406).send('Not Acceptable');
		}
	});
});

app.get('/groups/:name', function (req, res) {
	console.log ('groups');
	res.setHeader('content-type', 'application/json');
	res.end(JSON.stringify(contacts.get_members(req.params.name)));
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});