'use strict';

// sugar
// beware of circular dependencies which don't explode but nullify

const dispatcher = require('./flux/dispatcher');
let routes = null;
let stores = null;
let actions = null;

module.exports = {
	config: require('./config'),
	is: require('./utils/is'),
   constant: require('./constants'),

	// dispatch message to every subscribed store
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
		if (stores === null) { stores = require('./stores'); }
		return stores;
	},

	// convenience access to Flux actions
	get action() {
		if (actions === null) { actions = require('./actions'); }
		return actions;
	}
};
