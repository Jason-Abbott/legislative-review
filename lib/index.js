'use strict';

// sugar
// beware of circular dependencies which don't explode but nullify

const dispatcher = require('./flux/dispatcher');
let routes = null;
let store = null;

module.exports = {
	config: require('./config'),
	is: require('./utils/is'),

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