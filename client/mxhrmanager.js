/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20120408
 * @fileoverview mxhrmanager client
 */

(function(win, doc, $, swf, undefined) {
	var domready = swf.addDomLoadEvent,
	mix = $.extend,
	gid = new Date().valueOf(),
	swfid = '_process' + gid,
	supportSwf = swf.hasFlashPlayerVersion('9.0.0'),
	isLowIE = $.browser.msie && $.browser.version <= 7.0,
	supportDataUrl = isLowIE ? false: true,
	useSwfXhr = isLowIE && supportSwf,
	msxml = ['MSXML2.XMLHTTP.6.0', 'MSXML3.XMLHTTP', 'Microsoft.XMLHTTP', // Doesn't support readyState == 3 header requests.
	'MSXML2.XMLHTTP.3.0' // Doesn't support readyState == 3 header requests.
	],
	createSwfObject = function() {
		swf.embedSWF('mxhrmanager.swf', swfid, 1, 1, '9.0.0', 'http://www.adobe.com/cfusion/knowledgebase/index.cfm?id=6a253b75', {},
		{
			loop: false,
			menu: false,
			allowScriptAccess: 'always',
			allowFullScreen: 'false',
			quality: 'best',
			bgcolor: '#fff',
			wmode: 'transparent'
		});
		return doc.getElementById(swfid).load;
	},
	createXhrObject = function() {
		var req;
		try {
			req = new XMLHttpRequest();
		}
		catch(e) {
			for (var i = 0, len = msxml.length; i < len; ++i) {
				try {
					req = new ActiveXObject(msxml[i]);
					break;
				}
				catch(e2) {}
			}
		}
		finally {
			return req;
		}
	} (),
	readyStateHandler = function(host) {
		var mxhrmanager = host,
		req = mxhrmanager.req;
		if (req.readyState === 3 && mxhrmanager.ping === null) {
			mxhrmanager.ping = win.setInterval(function() {
				mxhrmanager.getPacket(req.responseText);
			},
			mxhrmanager.rate);
		}
		if (req.readyState === 4) {
			if (mxhrmanager.ping) clearInterval(mxhrmanager.ping);
			mxhrmanager.getPacket(req.responseText);
			if (mxhrmanager.complete) {
				mxhrmanager.complete.call(mxhrmanager, req.responseText);
			}
		}
	};

	var mxhrmanager = function(config) {
		this.listeners = {};
		this.lastLength = 0;
		this.ping = null;
		this.rate = 100;
		this.complete = function(){};
		this.boundary = '\u0003'; // IE jumps over empty entries if we use the regex version instead of the string.
		this.fieldDelimiter = '\u0001';
		this._config = {
			url: 'some.mxhr',
			type: 'GET',
			data: null,
			dataType: 'text',
			xhr: createXhrObject
		};
		mix(this._config, config);
		if (useSwfXhr) this.prototype.load = function(){
            var loader = createSwfObject();
            loader(this._config.url);
        };
	};

	mxhrmanager.prototype = {
		constructor: mxhrmanager,
		load: function() {
			var self = this,
			cg = self._config;
			this.req = cg.xhr;
			this.req.open(cg.type, cg.url, true);
			this.req.onreadystatechange = function() {
				readyStateHandler(self);
			};
			this.req.send(( !! cg.data) ? cg.data: null);
		},
		getPacket: function(str) {
			var self = this,
			len = str.length,
			packet = str.substring(self.lastLength, len);
			self._processPacket(packet);
			self.lastLength = len;
		},
		_processPacket: function(packet) {
			if (packet.length < 1) return;
			var startPos = packet.indexOf(this.boundary),
			endPos = - 1;
			if (startPos > - 1) {
				if (this.currentStream) {
					// If there's an open stream, that's an end marker.
					endPos = startPos;
					startPos = - 1;
				}
				else {
					endPos = packet.indexOf(this.boundary, startPos + this.boundary.length);
				}
			}
			// Using the position markers, process the payload.
			if (!this.currentStream) {
				// Start a new stream.
				this.currentStream = '';
				if (startPos > - 1) {
					if (endPos > - 1) {
						// Use the end marker to grab the entire payload in one swoop
						var payload = packet.substring(startPos, endPos);
						this.currentStream += payload;
						// Remove the payload from this chunk
						packet = packet.slice(endPos);
						this._processPayload();
						// Start over on the remainder of this packet
						try {
							this._processPacket(packet);
						}
						catch(e) {} // This catches the "Maximum call stack size reached" error in Safari (which has a really low call stack limit, either 100 or 500 depending on the version).
					}
					else {
						// Grab from the start of the start marker to the end of the chunk.
						this.currentStream += packet.substr(startPos);
						// Leave this.currentStream set and wait for another packet.
					}
				}
			}
			else {
				// There is an open stream.
				if (endPos > - 1) {
					// Use the end marker to grab the rest of the payload.
					var chunk = packet.substring(0, endPos);
					this.currentStream += chunk;
					// Remove the rest of the payload from this chunk.
					packet = packet.slice(endPos);
					this._processPayload();
					//Start over on the remainder of this packet.
					this._processPacket(packet);
				}
				else {
					// Put this whole packet into this.currentStream.
					this.currentStream += packet;
					// Wait for another packet...
				}
			}
		},
		_processPayload: function() {
			// Get rid of the boundary.
			this.currentStream = this.currentStream.replace(this.boundary, '');
			//remove the metadata
			var pieces = this.currentStream.split(this.fieldDelimiter);
			var mime = pieces[0];
			var payload = pieces[1];
			// Fire the listeners for this mime-type.
			var that = this;
			if (typeof this.listeners[mime] != 'undefined') {
				for (var n = 0, len = this.listeners[mime].length; n < len; n++) {
					this.listeners[mime][n].call(that, payload, mime);
				}
			}
			delete this.currentStream;
		},
		listen: function(mime, callback) {
			if (typeof this.listeners[mime] == 'undefined') {
				this.listeners[mime] = [];
			}
			if (typeof callback === 'function') {
				this.listeners[mime].push(callback);
			}
		}
	};

	win.mxhrmanager = mxhrmanager;

})(window, document, jQuery, swfobject);

