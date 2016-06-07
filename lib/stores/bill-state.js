'use strict';

// Flux state store for bills

const { constants, stores, subscribe } = require('../');
const store = Object.assign({}, stores.flux, {
	key: 'bills',
	initial: {
		summaries: [],
		current: null
	},

	handler(type, data) {
		const a = constants.action;
		switch (type) {
			case a.CHANGE_VIEW:
				this.state.view = data.view;
				this.emit();
				break;
		}
	}
});

module.exports = subscribe(store);
