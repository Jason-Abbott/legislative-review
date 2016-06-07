'use strict';

// Flux state stores maintain and modify state based on dispatched messages
// then notify subscribed components when state has changed
//
// Create as many state stores as are useful for avoiding duplicity and complexity

const handlers = [];

module.exports = {
	__state: null,

	initial: {},
	reset() { this.__state = null; },
	get state() {
		if (this.__state === null) { this.__state = Object.assign({}, this.initial); }
		return this.__state;
	},
	set state(value) { this.__state = value; },

	// view components respond to state change
	subscribe(fn) { handlers.push(fn); },
	emit() { handlers.forEach(fn => { fn() }); },
	remove(fn) {
      const i = handlers.indexOf(fn);
      if (i >= 0) { handlers.splice(i, 1); }
      return this;
	},
	// called by message actions to change state
	handler(type, data) {}
};
