/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20120409
 * @fileoverview a app for mxhr run example
 */

var http = require('http'),
fs = require('fs'),
mxhrmanager = require('./xhrmanager.js');

var server = http.createServer(function(req, rep) {
	var mxhrUrl = 'example.mxhr',
	exampleUrl = 'example.html',
	examplePath = '/home/mxhrmanager/public/example.html',
	publicUrl = '/home/mxhrmanager/public/',
	assest = function() {
		var files = ['test.js', 'test.css', 'test.jpg'];
		for (var i = 0; i < files.length; i++) {
			files[i] = publicUrl + files[i];
		}
		return files;
	} ();
	if (req.url == mxhrUrl) {
		mxhrmanager.load(assest, function(err, data) {
			var header = {
				'Content-Type': 'multipart/mixed',
				'server': 'node-server'
			};
			if (!err) {
				rep.writeHead('200', header);
				rep.write(data);
				rep.end();
			} else {
				console.log(err);
			}
		});
	} else if (req.url == exampleUrl) {
		var header = {
			'Content-Type': 'text/html',
			'server': 'node-server'
		};
		if (!err) {
			fs.readFile(examplePath, 'utf-8', function(err, data) {
				if (!err) {
					rep.writeHead('200', header);
					rep.write(data);
					rep.end();
				} else {
					console.log(err);
				}
			});
		} else {
			console.log(err);
		}
	}
});

server.listen(8000);

