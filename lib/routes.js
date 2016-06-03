'use strict';

// ad hoc routing for custom router.js React component
// map regex pattern to React view (just a convention) component

const views = require('./views');
const c = require('./constants');
// subdomain specific routes
const subdomain = {
   routes: [],
   home: null,
   add(re, view) { this.routes.push({ re: re, view: view }); return this; }
};

const r = {
   subdomains: {},
   // current site
   site: c.site.PUBLIC,
	add(site) {
      const s = subdomain;
      s.home = views.home[site];
      this.subdomains[site] = s;
      return s;
   },
	match(path) {
      const s = this.subdomains[this.site];
		const m = s.routes.find(r => r.re.test(path));
		return m !== undefined ? m.view : s.home;
	}
};

r.add(c.site.PUBLIC)
   .add(/bill/i, views.bill)
   .add(/blog/i, views.blog)
   .add(/finances?/i, views.static('finances'))
   .add(/privacy/i, views.static('privacy'))
   .add(/about/i, views.static('about'));

r.add(c.site.ADMIN)
   .add(/about/i, views.static('about'));

module.exports = r;