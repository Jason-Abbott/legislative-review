'use strict';

const React = require('react');
const Static = require('../components/static');

module.exports = {
	publicHome: require('./public-home'),
	adminHome: require('./admin-home'),
	bill: require('./bill'),
	blog: require('./blog'),

	'static': (fileName) => () => <Static name={fileName}/>
};
