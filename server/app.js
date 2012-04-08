/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20120409
 * @fileoverview a app for mxhr run example
 */

var http = require('http'),
fs = require('fs'),
path = require('path'),
mxhrmanager = require('./mxhrmanager.js');

var server = http.createServer(function(req, rep) {
	var mxhrUrl = '/example.mxhr',
	exampleUrl = '/example.html',
    client = '/home/mxhrmanager/client/',
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
	}else if(/mxhrmanager\/client/.test(req.url)){
		fs.readFile(client+path.basename(req.url),function(err, data) {
            var ext = path.extname(req.url).slice(1),
                types = {
                  "css": "text/css",
                  "gif": "image/gif",
                  "html": "text/html",
                  "ico": "image/x-icon",
                  "jpeg": "image/jpeg",
                  "jpg": "image/jpeg",
                  "js": "text/javascript",
                  "json": "application/json",
                  "pdf": "application/pdf",
                  "png": "image/png",
                  "svg": "image/svg+xml",
                  "swf": "application/x-shockwave-flash",
                  "tiff": "image/tiff",
                  "txt": "text/plain",
                  "wav": "audio/x-wav",
                  "wma": "audio/x-ms-wma",
                  "wmv": "video/x-ms-wmv",
                  "xml": "text/xml"
                },
                type = types[ext];
			    header = {
				'Content-Type': type,
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

