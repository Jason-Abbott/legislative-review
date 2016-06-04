'use strict';

// Flux state store for bills

const Ϟ = require('../');
const store = Object.assign({}, Ϟ.state.proto, {
	key: 'bills',
	initial: {
		summaries: [],
		current: null
	},

	handler(type, data) {
		switch (type) {
			case Ϟ.action.CHANGE_VIEW:
				this.state.view = data.view;
				this.emit();
				break;
		}
	}
});

module.exports = Ϟ.subscribe(store);
