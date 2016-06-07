'use strict';

// convenience references to state stores

module.exports = {
	get flux() { return require('./flux-store'); },
	get articles() { return require('./article-state'); },
	get bills() { return require('./bill-state'); },
	get user() { return require('./user-state'); }
};
