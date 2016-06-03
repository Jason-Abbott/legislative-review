'use strict';

// Flux state store for users
// Kind of a catch-all since most all state is user-driven

const L = require('../');
const c = require('../constants');

console.log('before user store');

const store = Object.assign({}, L.store.proto, {
	key: 'user',
	initial: {
		view: c.view.HOME,
		menu: null,
		notifications: [],
		signedIn: false,
		accountName: null,
		fullName: null
	},

	handler(type, data) {
		switch (type) {
			case c.action.CHANGE_VIEW:
				this.state.view = data.view;
				this.emit();
				break;
		}
	}
});

module.exports = L.subscribe(store);