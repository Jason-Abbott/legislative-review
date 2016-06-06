'use strict';

const { site } = require('../constants');
const React = require('react');
const Static = require('../components/static');

module.exports = {
	home: {
		[site.ADMIN]: require('./admin-home'),
		[site.PUBLIC]: require('./public-home')
	},
	bill: require('./bill'),
	blog: require('./blog'),

	'static': (fileName) => () => <Static name={fileName}/>
};
