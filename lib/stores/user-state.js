'use strict';

// Flux state store for users
// Kind of a catch-all since most all state is user-driven

const V = require('../');
const store = Object.assign({}, V.store.proto, {
	key: 'user',
	initial: {
		view: V.view.HOME,
		menu: null,
		notifications: [],
		signedIn: false,
		accountName: null,
		fullName: null
	},

	handler(type, data) {
		switch (type) {
			case V.action.CHANGE_VIEW:
				this.state.view = data.view;
				this.emit();
				break;
		}
	}
});

module.exports = V.subscribe(store);