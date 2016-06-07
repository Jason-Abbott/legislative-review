'use strict';

// Flux state store for bills

const { constants, flux, copy } = require('../');
const baseStore = require('../stores/flux-store');
const store = copy(baseStore, {
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

module.exports = flux.subscribe(store);