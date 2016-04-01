'use strict';

const React = require('react');
const Static = require('../components/static');

module.exports = {
	home: require('./home'),
	bill: require('./bill'),
	blog: require('./blog'),

	'static': (fileName) => () => <Static name={fileName}/>
};
