'use strict';

// Flux state stores maintain and modify state based on dispatched messages
// then notify subscribed components when state has changed
//
// Create as many state stores as are useful for avoiding duplicity and complexity

const Ϟ = require('../');
const handlers = {};
const cache = {};
let token = 0;

// prototypical store
module.exports = {
	// session key
	key: null,
	// initial state
	initial: {},
	firstTime: true,

	// view components respond to state change
	subscribe(fn) { handlers[++token] = fn; return token; },
	emit() { for (let t in handlers) { handlers[t](); } },
	ignore(t) { delete handlers[t]; },

	// called by message actions to change state
	handler(type, data) {},

	get state() {
		if (this.firstTime) {
			// load state from storage if this is the first access
			let state = Ϟ.session !== null ? Ϟ.session.item(this.key) : null;
			this.state = state !== null ? state : this.initial;
			//console.log("getter", this);
			this.firstTime = false;
		}
		return cache[this.key];
	},

	set state(value) {
		cache[this.key] = value;
		if (Ϟ.session !== null) { Ϟ.session.save(this.key, value); }
	},

	remove() { if (Ϟ.session !== null) { Ϟ.session.remove(this.key); } }
};
