'use strict';

// display view matching current URL path

const L = require('../index');
const React = require('react');

module.exports = props => {
	let view = L.view.match(window.location.pathname);
	return new view();
};