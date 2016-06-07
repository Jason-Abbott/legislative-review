'use strict';

// Flux state stores maintain and modify state based on dispatched messages
// then notify subscribed components when state has changed
//
// Create as many state stores as are useful for avoiding duplicity and complexity

module.exports = {
   __handlers: [],
	state: null,
	initial: {},
	reset() { this.state = Object.assign({}, this.initial); return this.state; },
   update(values) { this.state = Object.assign(this.state, values); },
   load(force = false) {
      return (force || this.state === null) ? this.reset() : this.state;
   },

	// view components respond to state change
	subscribe(fn) { this.__handlers.push(fn); },
	changed() { this.__handlers.forEach(fn => { fn() }); },
	remove(fn) {
      const i = this.__handlers.indexOf(fn);
      if (i >= 0) { this.__handlers.splice(i, 1); }
      return this;
	},
	// called by message actions to change state
	handler(type, data) {}
};
