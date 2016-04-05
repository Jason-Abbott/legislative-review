'use strict';

require('./setup')();

module.exports = {
	is: require('../lib/is'),
	routes: require('../lib/routes'),
	views: require('../lib/views/'),
	components: require('../lib/components/')
};