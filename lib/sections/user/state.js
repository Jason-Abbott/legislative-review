'use strict';

// Flux state store for users
// Kind of a catch-all since most all state is user-driven

const G = require('../../');
const store = Object.assign({}, G.state.proto, {
	key: 'user',
	initial: {
		view: G.view.HOME,
		menu: null,
		notifications: [],
		signedIn: false,
		accountName: null,
		fullName: null
	},

	handler(type, data) {
		switch (type) {
			case G.action.CHANGE_VIEW:
				this.state.view = data.view;
				this.emit();
				break;
		}
	}
}); 

module.exports = G.dispatcher.subscribe(store);