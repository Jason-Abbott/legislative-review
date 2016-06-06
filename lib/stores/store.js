'use strict';

// Flux state stores maintain and modify state based on dispatched messages
// then notify subscribed components when state has changed
//
// Create as many state stores as are useful for avoiding duplicity and complexity

const handlers = [];

// prototypical state store
module.exports = {
	state: {},
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
