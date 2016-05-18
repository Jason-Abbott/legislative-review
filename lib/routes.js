'use strict';

// ad hoc routing for custom router.js React component
// map regex pattern to React view (just a convention) component

const views = require('./views');

const r = {
	routes: [],
	home: null,
	add(re, view) { this.routes.push({ re: re, view: view }); },
	match(path) {
		let m = this.routes.find(r => r.re.test(path));
		return m !== undefined ? m.view : this.home;
		// TODO: give 404 if not found?
	}
};

r.publicHome = views.publicHome;

r.add(/bill/i, views.bill);
r.add(/blog/i, views.blog);
r.add(/finances?/i, views.static('finances'));
r.add(/privacy/i, views.static('privacy'));
r.add(/about/i, views.static('about'));

module.exports = r;