'use strict';

// sugar
// beware of circular dependencies which don't explode but nullify

const c = require('./constants');
let views = null;
let state = null;
let dispatcher = null;

module.exports = {
	constants: c,
	config: require('./config'),
	is: require('./is'),
	action: c.action,
	status: c.status,
	source: c.source,
	eventType: c.event,
	
	// Node Express instance
	app: null,
	// Flux style dispatch method
	emit: null,
	// browser sessionStorage
	session: null,

	// Flux dispatcher
	set dispatcher(d) {
		this.emit = d.emit;
		dispatcher = d;
	},
	get dispatcher() { return dispatcher; },

	// convenience access to React view components
	get view() {
		if (views === null) { views = require('./routes'); }
		return views;
	},

	// convenience access to Flux state stores
	get state() {
		if (state === null) { state = require('./state'); }
		return state;
	}
};