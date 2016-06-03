'use strict';

// sugar
// beware of circular dependencies which don't explode but nullify

const dispatcher = require('./flux/dispatcher');
const c = require('./constants');
let routes = null;
let store = null;

module.exports = {
	config: require('./config'),
	is: require('./utils/is'),

   constants: c,
   action: c.action,
   site: c.site,
   view: c.view,

	// Flux style dispatch method
	emit: dispatcher.emit,
	// browser sessionStorage
	session: require('./session'),

	// subscribe store to dispatcher or queue it if dispatcher isn't ready
	subscribe(s) { return dispatcher.subscribe(s); },

	// convenience access to React routes
	get route() {
		if (routes === null) { routes = require('./routes'); }
		return routes;
	},

	// convenience access to Flux state stores
	get store() {
		if (store === null) { store = require('./stores'); }
		return store;
	}
};