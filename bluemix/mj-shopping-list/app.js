/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// database credentials
var dbCredentials = {
	dbName : "shopping_list_db"
};


function initDBConnection() {
	
	if(process.env.VCAP_SERVICES) {
		var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
		// Pattern match to find the first instance of a Cloudant service in
		// VCAP_SERVICES. If you know your service key, you can access the
		// service credentials directly by using the vcapServices object.
		for(var vcapService in vcapServices){
			if(vcapService.match(/cloudant/i)){
				dbCredentials.host = vcapServices[vcapService][0].credentials.host;
				dbCredentials.port = vcapServices[vcapService][0].credentials.port;
				dbCredentials.user = vcapServices[vcapService][0].credentials.username;
				dbCredentials.password = vcapServices[vcapService][0].credentials.password;
				dbCredentials.url = vcapServices[vcapService][0].credentials.url;
				
				cloudant = require('cloudant')(dbCredentials.url);
				
				// check if DB exists if not create
				cloudant.db.create(dbCredentials.dbName, function (err, res) {
					if (err) { console.log('could not create db ', err); }
				});
				
				db = cloudant.use(dbCredentials.dbName);
				break;
			}
		}
		if(db==null){
			console.warn('Could not find Cloudant credentials in VCAP_SERVICES environment variable - data will be unavailable to the UI');
		}
	} else{
		console.warn('VCAP_SERVICES environment variable not set - data will be unavailable to the UI');
		// For running this app locally you can get your Cloudant credentials 
		// from Bluemix (VCAP_SERVICES in "cf env" output or the Environment 
		// Variables section for an app in the Bluemix console dashboard).
		// Alternately you could point to a local database here instead of a 
		// Bluemix service.
		dbCredentials.host = "8c485364-8116-4499-a03e-a420257c5ee6-bluemix.cloudant.com";
		dbCredentials.port = 443;
		dbCredentials.user = "8c485364-8116-4499-a03e-a420257c5ee6-bluemix";
		dbCredentials.password = "f758277ed7a455057cd7533b8f8d95e4d0a67ed17e11cdc0abe87bfdf75ce982";
		dbCredentials.url = "https://8c485364-8116-4499-a03e-a420257c5ee6-bluemix:f758277ed7a455057cd7533b8f8d95e4d0a67ed17e11cdc0abe87bfdf75ce982@8c485364-8116-4499-a03e-a420257c5ee6-bluemix.cloudant.com";
		
		
		cloudant = require('cloudant')(dbCredentials.url);
		
		// check if DB exists if not create
		cloudant.db.create(dbCredentials.dbName, function (err, res) {
			if (err) { console.log('could not create db ', err); }
		});
		
		db = cloudant.use(dbCredentials.dbName);
	}
}

function createResponseData(id, name, value, attachments) {

	var responseData = {
		id : id,
		name : name,
		value : value,
		attachements : []
	};
	
	 
	attachments.forEach (function(item, index) {
		var attachmentData = {
			content_type : item.type,
			key : item.key,
			url : 'http://' + dbCredentials.user + ":" + dbCredentials.password
					+ '@' + dbCredentials.host + '/' + dbCredentials.dbName
					+ "/" + id + '/' + item.key
		};
		responseData.attachements.push(attachmentData);
		
	});
	return responseData;
}

initDBConnection();

app.get('/api/items', function(request, response) {

	console.log("Get method invoked.. ")
	
	db = cloudant.use(dbCredentials.dbName);
	var docList = [];
	var i = 0;
	db.list(function(err, body) {
		if (!err) {
			var len = body.rows.length;
			console.log('total # of docs -> '+len);
			if(len == 0) {
				// push sample data
				// save doc
				var docName = 'sample_doc';
				var docDesc = 'A sample Document';
				db.insert({
					name : docName,
					value : 'A sample Document'
				}, '', function(err, doc) {
					if(err) {
						console.log(err);
					} else {
						
						console.log('Document : '+JSON.stringify(doc));
						var responseData = createResponseData(
							doc.id,
							docName,
							docDesc,
							[]);
						docList.push(responseData);
						response.write(JSON.stringify(docList));
						console.log(JSON.stringify(docList));
						console.log('ending response...');
						response.end();
					}
				});
			} else {

				body.rows.forEach(function(document) {
					
					db.get(document.id, { revs_info: true }, function(err, doc) {
						if (!err) {
							if(doc['_attachments']) {
							
								var attachments = [];
								for(var attribute in doc['_attachments']){
								
									if(doc['_attachments'][attribute] && doc['_attachments'][attribute]['content_type']) {
										attachments.push({"key": attribute, "type": doc['_attachments'][attribute]['content_type']});
									}
									console.log(attribute+": "+JSON.stringify(doc['_attachments'][attribute]));
								}
								var responseData = createResponseData(
										doc._id,
										doc.name,
										doc.value,
										attachments);
							
							} else {
								var responseData = createResponseData(
										doc._id,
										doc.name,
										doc.value,
										[]);
							}	
						
							docList.push(responseData);
							i++;
							if(i >= len) {
								response.write(JSON.stringify(docList));
								console.log('ending response...');
								response.end();
							}
						} else {
							console.log(err);
						}
					});
					
				});
			}
			
		} else {
			console.log(err);
		}
	});

});

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {

	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
