/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20120409
 * @fileoverview a app for mxhr run example
 */

var http = require('http'),
fs = require('fs'),
mxhrmanager = require('./mxhrmanager.js');

var server = http.createServer(function(req, rep) {
	var mxhrUrl = '/example.mxhr',
	exampleUrl = '/example.html',
	examplePath = '/home/mxhrmanager/public/example.html',
	publicUrl = '/home/mxhrmanager/public/',
	assest = function() {
		var files = ['test.js', 'test.css', 'test.jpg'];
		for (var i = 0; i < files.length; i++) {
			files[i] = publicUrl + files[i];
		}
		return files;
	} ();
	console.log(req.url);
	if (req.url == mxhrUrl) {
		console.log(assest);
		mxhrmanager.load(assest, function(err, data) {
			var header = {
				'Content-Type': 'text/plain',
				'server': 'node-server',
				'Content-Length': data.length
			};
			if (!err) {
				rep.writeHead(200, header);
				rep.write(data);
				rep.end();
			} else {
				console.log(err);
			}
		});
	} else if (req.url == exampleUrl) {
		fs.readFile(examplePath, 'utf-8', function(err, data) {
			var header = {
				'Content-Type': 'text/html',
				'Content-Length': data.length,
				'server': 'node-server'
			};
			if (!err) {
				rep.writeHead(200, header);
				rep.write(data);
				rep.end();
			} else {
				console.log(err);
			}
		});
	}
});

server.listen(8000);
console.log('start server on 8000');

