'use strict';

// convenience references to state stores

module.exports = {
	proto: require('./flux/store'),
	user: require('./sections/user/state'),
	items: require('./sections/items/state')
};