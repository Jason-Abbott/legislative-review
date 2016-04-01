'use strict';

// Flux state store for users
// Kind of a catch-all since most all state is user-driven

const L = require('../');
const state = Object.assign({}, L.state.proto, {
	key: 'user',
	initial: {
		view: L.view.HOME,
		menu: null,
		notifications: [],
		signedIn: false,
		accountName: null,
		fullName: null
	},

	handler(type, data) {
		switch (type) {
			case L.action.CHANGE_VIEW:
				this.state.view = data.view;
				this.emit();
				break;
		}
	}
});

module.exports = L.dispatcher.subscribe(state);