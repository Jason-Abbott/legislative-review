'use strict';

// ad hoc routing for custom router.js React component
// map regex pattern to React view (just a convention) component

const items = require('./items/views');
const user = require('./user/views');
const about = require('./company/views');

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

r.home = items.waypoints;
r.add(/routes/i, items.routes);
r.add(/waypoints/i, items.waypoints);
r.add(/privacy/i, about.privacy);
r.add(/team/i, about.team);

module.exports = r;