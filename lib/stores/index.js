'use strict';

// convenience references to state stores

module.exports = {
	get proto() { return require('./../flux/store'); },
	get bills() { return require('./bill-state'); },
	get user() { return require('./user-state'); }
};