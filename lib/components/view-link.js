'use strict';

const L = require('../');
const React = require('react');

module.exports = props => {
	return <a onClick={onClick} href={"/" + props.href}>{props.title}</a>;
};

function onClick(e) {
	e.preventDefault();
	L.emit(L.action.CHANGE_VIEW, e.target.getAttribute('href'))
}