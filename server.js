'use strict';

// Node server application
const fs = require('fs');
const compress = require('zlib');
const path = require('path');
const root = path.join(__dirname, './dist/');
const now = (new Date()).getTime();
const allow = {
	folders: /^(fonts|img|partials)$/,
	files: /(html|css|js|svg|ttf|woff|woff2|otf)$/i
};
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
	onComplete: null,
	
	add(name, buffer) {
		let parts = name.split('.');
		this.items[name] = {
			mimeType: mimeTypes[parts[parts.length - 1]],
			buffer: buffer,
			eTag: now
		};
	},

	addFile(name) {
		let content = fs.readFileSync(root + name);
		if (content !== null) {
			if (zippable.test(name)) {
				compress.gzip(content, (err, buffer) => {
					if (err === null) { this.add(name, buffer); }
					this.commit();
				});
			} else {
				this.add(name, content);
				this.commit();
			}
		} else {
			this.commit();
		}
	},
	
	addFolder(path) {
		path = ((path === undefined) ? '' : path + '/');
		let files = fs.readdirSync(root + path);
		this.pending += files.length;
		files.forEach(f => {
			if (allow.folders.test(f)) {
				this.addFolder(path + f);
			} else if (allow.files.test(f)) {
				this.addFile(path + f)
			} else {
				this.commit();
			}
		});
		return this;
	},

	send(req, res) {
		let item = this.items[req.url];
		res.writeHead('Content-Encoding', 'gzip');
		res.writeHead('Cache-Control', 'max-age=86400, public');    // seconds
		res.writeHead('ETag', item.eTag);
	 	res.writeHead('Content-Type', item.mimeType + ';charset=utf-8');
		res.write(item.buffer);
		res.end();
	},

	commit() {
		if (--this.pending == 0 && this.onComplete !== null) { this.onComplete(); }
		else { console.log(this.pending); }
	},

	then(fn) { this.onComplete = fn; }
};

cache.addFolder().then(() => {
	const http = require('http');
	const port = process.env['PORT'] || 3000;

	http.createServer(cache.send).listen(port, ()=> {
		console.info("Starting Legislative Review on port %s", port)
	});
});

// res.sendCompressed = (mimeType, item, cache) => {
// 	if (cache === undefined) { cache = true; }
//
// 	res.setHeader('Content-Encoding', 'gzip');
//
// 	if (cache) {
// 		res.setHeader('Cache-Control', 'max-age=86400, public');    // seconds
// 	} else {
// 		// force no caching
// 		res.setHeader('Cache-Control', 'no-cache');
// 		res.setHeader('expires', 'Tue, 01 Jan 1980 1:00:00 GMT');
// 		res.setHeader('pragma', 'no-cache');
// 	}
// 	res.setHeader('ETag', item.eTag);
// 	res.setHeader('Content-Type', mimeType + ';charset=utf-8');
// 	res.write(item.buffer);
// 	res.end();
// };
//
// // res.setHeader('Content-Type', 'application/json');
// // res.send(JSON.stringify(o));
//
// function cacheAndSend(res, text, slug, mimeType) {
// 	compress.gzip(text, (err, buffer) => {
// 		let ci = new CacheItem(slug, buffer);
// 		if (config.cacheOutput) { db.cache.addOutput(key, slug, buffer); }
// 		res.sendCompressed(mimeType, ci, slug);
// 	});
// }

//
//
//
// L.app = express();
// L.app.use(require('./lib/middleware/json-response'));
// L.app.use(express.static(__dirname + '/dist'));
// L.app.use((req, res) => { res.sendFile('public.html', root) });
//
// console.info("Starting Legislative Review service in %s mode on port %s", mode, port);
//
// L.app.listen(port);