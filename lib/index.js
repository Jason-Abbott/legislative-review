'use strict';

const handlers = [];
let routes = null;
let db = null;

module.exports = {
	config: require('./config'),
	is: require('./utils/is'),
   constant: require('./constants'),
   session: require('./session'),
	get db() {
      if (db === null) { db = require('./utils/db'); }
      return db;
   },

	// dispatch message to every subscribed state store
   emit(type, data) { handlers.forEach(fn => { fn(type, data) }); },
   // subscribe store
   subscribe(store) { handlers.push(store.handler.bind(store)); return store; },

	// convenience access to React routes
	get route() {
		if (routes === null) { routes = require('./routes'); }
		return routes;
	},

   store: require('./stores')
};