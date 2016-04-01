'use strict';

// https://fortawesome.github.io/Font-Awesome/examples/

const React = require('react');

module.exports = props => {
	let css = 'fa fa-' + props.name;
	if (props.className) { css += ' ' + props.className;	}
	return <i className={css} aria-hidden="true"></i>;
};