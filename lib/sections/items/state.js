'use strict';

// Flux state store for user items (waypoints, tracks, routes, etc.)

const G = require('../../');
const store = Object.assign({}, G.store, {
	key: 'items',
	empty: {
		items: []
	},
	handler(type, status, data) {
		switch (type) {
			case G.action.CHANGE_VIEW:
				this.state.view = data.view;
				break;
		}
	}
});

module.exports = G.addStore(store);