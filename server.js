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
const cache = {
	items: {},
	pending: 0,
	loaded: null,

	// add buffer to cache
	add(name, buffer, compressed) {
		let parts = name.split('.');
		this.items[name] = {
			mimeType: mimeTypes[parts[parts.length - 1]],
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

	// load folder of files to cache
	load(fnOrPath) {
		let path = '';
		if (typeof fnOrPath == 'function') {
			this.loaded = fnOrPath;
		} else {
			path = fnOrPath + '/';
		}
		fs.readdir(root + path, (err, files) => {
			files.forEach(f => {
				if (allow.folders.test(f)) {
					this.load(path + f);
				} else if (allow.files.test(f)) {
					this.pending++;
					this.addFile(path + f)
				}
			});
		});
		return this;
	},

	// send cached file
	send(req, res) {
		let url = req.url.replace(/^\//, '');
		if (url === '') { url = home.public; }
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

	next() {
		if (--this.pending == 0 && this.loaded !== null) {
			this.items['admin'] = this.items[home.admin];
			this.loaded();
		}
	}
};

cache.load(() => {
	const http = require('http');
	const port = process.env['PORT'] || 3000;
	const tasks = require('./lib/tasks');
	
	tasks.start();

	http.createServer(cache.send.bind(cache)).listen(port, ()=> {
		console.info("Starting Legislative Review on port %s", port);
		
	});
});