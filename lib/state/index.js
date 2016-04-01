'use strict';

// convenience references to state stores

module.exports = {
	proto: require('./../flux/store'),
	bills: require('./bill-state'),
	user: require('./user-state')
};