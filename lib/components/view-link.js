'use strict';

const Ϟ = require('../');
const React = require('react');

module.exports = props => <a onClick={onClick} href={"/" + props.href}>{props.title}</a>;
function onClick(e) {
	e.preventDefault();
	Ϟ.emit(Ϟ.action.CHANGE_VIEW, e.target.getAttribute('href'))
}
