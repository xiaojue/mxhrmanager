/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20120408
 * @fileoverview server mxhrmanager for nodejs
 */

var fs = require('fs'),
path = require('path'),
base64 = require('./base64');

var sep = String.fromCharCode(1),
//seperator character for MXHR response \u0001
newline = String.fromCharCode(3); //newline character for MXHR response
//you can extend it for your need \u0003
var header = {
	'html': 'text/html',
	'json': 'application/json',
	'js': 'text/javascript',
	'css': 'text/css',
	'jpg': 'image/jpeg',
	'jpeg': 'image/jpeg',
	'jpe': 'image/jpeg',
	'gif': 'image/gif',
	'png': 'image/png'
};

var imagesType = ['jpg', 'jpeg', 'jpe', 'gif', 'png'];

function in_array(v, ary) {
	for (var i = 0; i < ary.length; i++) {
		if (ary[i] === v) return true;
	}
	return false;
}

function createType(fileType) {
	try {
		var type = header[fileType];
		return 'Content-Type:' + type;
	} catch(e) {
		return 'Content-Type:x-undefined';
	}
}

function process(uri, callback) {
	var type = 'utf-8',
	filetype = path.extname(uri).slice(1),
	isImage = in_array(filetype, imagesType);
	if (isImage) type = 'binary'; //image read by binary
	fs.readFile(uri, type, function(err, data) {
		if (!err) {
			var ret = '',
			content_type = createType(filetype);
			//base64 image for send
			if (isImage) data = base64.encode(data);
			ret = content_type + sep + data + newline;
			callback(null, ret);
		} else {
			callback(err);
		}
	});
}

function notEmpty(ary) {
	for (var i = 0; i < ary.length; i++) {
		if (ary[i] === undefined) return false;
	}
	return true;
}

exports.load = function(lists, callback) {
	var i = 0,
	ret = [],
	len = lists.length;
	for (; i < len; i++) {
		var uri = lists[i];
		(function(i) {
			process(uri, function(err, data) {
				if (!err) {
					ret[i] = data;
					if (notEmpty(ret) && ret.length === len) {
						callback(null, ret.join(''));
					}
				} else {
					callback(err);
				}
			});
		})(i);
	}
};

