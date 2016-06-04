'use strict';

// flux state store for users
// kind of a catch-all since most all state is user-driven

const Ϟ = require('../');
const store = Object.assign({}, Ϟ.store.proto, {
	key: 'user',
	initial: {
		view: Ϟ.c.view.HOME,
		menu: null,
		notifications: [],
		signedIn: false,
		accountName: null,
		fullName: null
	},

	handler(type, data) {
		switch (type) {
			case Ϟ.c.action.CHANGE_VIEW:
				this.state.view = data.view;
				this.emit();
				break;
			case Ϟ.c.action.LOGOUT:
				break;
		}
	}
});

module.exports = Ϟ.subscribe(store);
