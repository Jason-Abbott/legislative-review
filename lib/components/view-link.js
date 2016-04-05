'use strict';

const L = require('../');
const React = require('react');

module.exports = class extends React.Component {
	render() {
		return <a onClick={this.onClick} href={"/" + this.props.href}>{this.props.title}</a>;
	}
	onClick(e) {
		e.preventDefault();
		L.emit(L.action.CHANGE_VIEW, e.target.getAttribute('href'))
	}
};

//module.exports = props => <a onClick={onClick} href={"/" + props.href}>{props.title}</a>
// function onClick(e) {
// 	e.preventDefault();
// 	L.emit(L.action.CHANGE_VIEW, e.target.getAttribute('href'))
// }