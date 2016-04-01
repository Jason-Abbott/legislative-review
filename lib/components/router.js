'use strict';

// display view matching current URL path

const G = require('../');
const React = require('react');

module.exports = props => {
	let view = G.view.match(window.location.pathname);
	return new view();
};