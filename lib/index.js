'use strict';

const handlers = [];
let routes = null;
let db = null;

module.exports = {
	config: require('./config'),
	is: require('./utils/is'),
   constants: require('./constants'),
   session: require('./session'),
	get db() {
      if (db === null) { db = require('./utils/db'); }
      return db;
   },

	copy(b1, b2) { return Object.assign({}, b1, b2); },

	// dispatch message to every subscribed state store
   emit(type, data) { handlers.forEach(fn => { fn(type, data) }); },
   // subscribe store
   subscribe(store) { handlers.push(store.handler.bind(store)); return store; },

	// convenience access to React routes
	get routes() {
		if (routes === null) { routes = require('./routes'); }
		return routes;
	}
};
