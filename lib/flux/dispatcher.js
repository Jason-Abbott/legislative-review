'use strict';

// Flux dispatcher singleton sends messages (object literals) to registered stores
// which then update their state and in turn notify subscribed components
//
// All stores will receive every dispatcher message but components subscribe to
// specific store(s)
//
// https://facebook.github.io/flux/docs/dispatcher.html

const handlers = [];

module.exports = {
	subscribe(store) {
		console.log('dispatcher subscribe', store);
		handlers.push(store.handler.bind(store));
		return store; // for chaining
	},
	emit(type, data) {
		handlers.forEach(fn => { fn(type, data) });
	}
};