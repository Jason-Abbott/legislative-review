'use strict';

// Flux state stores maintain and modify state based on dispatched messages
// then notify subscribed components when state has changed
// 
// Create as many state stores as are useful for avoiding duplicity and complexity

const L = require('../');
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
			let state = L.session !== null ? L.session.item(this.key) : null;
			this.state = state !== null ? state : this.initial;
			console.log("getter", this);
			this.firstTime = false;
		}
		return cache[this.key];
	},
	
	set state(value) {
		cache[this.key] = value;
		if (L.session !== null) { L.session.save(this.key, value); }
	},

	remove() { L.session.remove(this.key); }
};