'use strict';

// sugar
// beware of circular dependencies which don't explode but nullify

const c = require('./constants');
const dispatcher = require('./flux/dispatcher');
let views = null;
let store = null;

module.exports = {
	constants: c,
	config: require('./config'),
	is: require('./utils/is'),
	action: c.action,
	status: c.status,
	source: c.source,
	eventType: c.event,

	// Node Express instance
	app: null,
	// Flux style dispatch method
	emit: dispatcher.emit,
	// browser sessionStorage
	session: require('./session'),

	// subscribe store to dispatcher or queue it if dispatcher isn't ready
	subscribe(s) { return dispatcher.subscribe(s); },

	// convenience access to React view components
	get view() {
		if (views === null) { views = require('./routes'); }
		return views;
	},

	// convenience access to Flux state stores
	get store() {
		if (store === null) { store = require('./stores'); }
		return store;
	}
};