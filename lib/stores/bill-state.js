'use strict';

// Flux state store for bills

const L = require('../');
const store = Object.assign({}, L.state.proto, {
	key: 'bills',
	initial: {
		summaries: [],
		current: null
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

module.exports = L.registerStore(store);