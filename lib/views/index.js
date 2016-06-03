'use strict';

const c = require('../constants');
const React = require('react');
const Static = require('../components/static');

module.exports = {
	home: {
		[c.site.ADMIN]: require('./admin-home'),
		[c.site.PUBLIC]: require('./public-home')
	},
	bill: require('./bill'),
	blog: require('./blog'),

	'static': (fileName) => () => <Static name={fileName}/>
};
