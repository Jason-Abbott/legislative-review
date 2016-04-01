'use strict';

// Flux state store for user items (waypoints, tracks, routes, etc.)

const L = require('../../index');
const store = Object.assign({}, L.store, {
	key: 'items',
	empty: {
		items: []
	},
	handler(type, status, data) {
		switch (type) {
			case L.action.CHANGE_VIEW:
				this.state.view = data.view;
				break;
		}
	}
});

//module.exports = L.addStore(store);