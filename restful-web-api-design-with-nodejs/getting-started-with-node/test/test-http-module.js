var sinon = require('sinon');
var http_module = require('../modules/http-module');

exports.test_handle_GET_request = function (test) {
	var response = {
		'writeHead' : function () {},
		'end' : function () {}
	};
	var responseMock = sinon.mock(response);
	responseMock.expects('end').once().withArgs('Get action was requested');
	responseMock.expects('writeHead').once().withArgs(200, {
		'Content-Type' : 'text/plain'
	});
	
	var request = {};
	var requestMock = sinon.mock(request);
	requestMock.method = 'GET';
	
	
	http_module.handle_request(requestMock, response);
	responseMock.verify();
	test.done();
};

exports.test_handle_POST_request = function (test) {
	var response = {
		'writeHead' : function () {},
		'end' : function () {}
	};
	
	var responseMock = sinon.mock(response);
	responseMock.expects('end').once().withArgs('Post action was requested');
	responseMock.expects('writeHead').once().withArgs(200, {
		'Content-Type' : 'text/plain'
	});
	
	
	var request = {};
	var requestMock = sinon.mock(request);
	requestMock.method = 'POST';
	
	http_module.handle_request(requestMock, response);
	responseMock.verify();
	test.done();
}