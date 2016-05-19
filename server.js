'use strict';

// Node server application
const fs = require('fs');
const compress = require('zlib');
const path = require('path');
const root = path.join(__dirname, './dist/');
const now = (new Date()).getTime();
const home = { public: 'public.html', admin: 'admin.html' };
// white-list allowed files and folders
const allow = {
	folders: /^(fonts|img|partials)$/,
	files: /(html|css|js|jpg|png|ico|gif|svg|ttf|woff|woff2|otf)$/i
};
const test = true;
// extensions of files that will be gzipped
const zippable = /(html|css|js|svg|ttf|otf)$/;
const mimeTypes = {
	js: 'application/javascript',
	css: 'text/css',
	jpg: 'image/jpeg',
	png: 'image/png',
	html: 'text/html',
	svg: 'image/svg+xml',
	ttf: 'application/octet-stream',
	woff: 'application/font-woff',
	woff2: 'application/font-woff2'
};
const responder = {
	items: {},
	pending: 0,
	loaded: null,

	// add buffer to cache
	add(name, buffer, compressed) {
		let [, ext] = name.split('.');
		this.items[name] = {
			mimeType: mimeTypes[ext],
			buffer: buffer,
			compressed: compressed,
			eTag: name + now
		};
		this.next();
	},

	// load file and optionally compress for cache
	addFile(name) {
		fs.readFile(root + name, (err, content) => {
			if (err === null && content !== null) {
				if (zippable.test(name)) {
					compress.gzip(content, (err, buffer) => {
						this.add(name, buffer, true);
					});
				} else {
					this.add(name, content, false);
				}
			} else {
				this.next();
			}
		});
	},

	prepare(callback) {
		if (test) {
			this.send = this.sendFile;
			callback();
		} else {
			this.send = this.sendFromCache;
			this.loaded = callback;
			this.addFolder();
		}
	},

	// load folder of files to responder
	addFolder(path = '') {
		path += '/';
		fs.readdir(root + path, (err, files) => {
			files.forEach(f => {
				if (allow.folders.test(f)) {
					this.addFolder(path + f);
				} else if (allow.files.test(f)) {
					this.pending++;
					this.addFile(path + f)
				}
			});
		});
	},

	send(req, res) { throw new NotImplementedException(); },

	sendFile(req, res) {
		let name = req.url.replace(/^\//, '');

		if (name === '') {
			const parts = req.headers['host'].split('.');
			name = (parts[0] == 'admin') ? home.admin : home.public;
		}

		let [, ext] = name.split('.');
		let path = root + name;

		fs.exists(path, found => {
			if (found) {
				res.writeHead(200, {	'Content-Type': mimeTypes[ext] + ';charset=utf-8' });
				let stream = fs.createReadStream(root + name);
				stream.pipe(res);
			} else {
				console.warn(path + ' not found');
				res.writeHead(404);
				res.end();
			}
		});
	},

	// send cached file
	sendFromCache(req, res) {
		let url = req.url.replace(/^\//, '');
	
		if (url === '') {
			const parts = req.headers['host'].split('.');
			url = (parts[0] == 'admin') ? home.admin : home.public;
		}
		let item = this.items[url];
		if (item === undefined) { item = this.items[home.public]; }

		let headers = {
			'Cache-Control': 'max-age=86400, public',
			'ETag': item.eTag,
			'Content-Type': item.mimeType + ';charset=utf-8'
		};
			
		if (item.compressed) { headers['Content-Encoding'] = 'gzip'; }
		
		res.writeHead(200, headers);
		res.write(item.buffer);
		res.end();
	},

	next() {	if (--this.pending == 0 && this.loaded !== null) { this.loaded();	}	}
};

responder.prepare(() => {
	const http = require('http');
	const port = process.env['PORT'] || 3000;
	const config = require('./lib/config');
	const log = require('./lib/utils/logs');
	const db = require('./lib/utils/db');

	config.db.serviceAccount.clientEmail = process.env['FIREBASE_EMAIL'];
	config.db.serviceAccount.privateKey = '-----BEGIN PRIVATE KEY-----\n' +
		process.env['FIREBASE_KEY'].replace(/\\n/g, '\n') + '\n-----END PRIVATE KEY-----\n';

	db.connect();
	const tasks = require('./lib/tasks');
	//tasks.start();

	http.createServer(responder.send.bind(responder)).listen(port, ()=> {
		log.info("Starting Legislative Review on port " + port);
	});
});