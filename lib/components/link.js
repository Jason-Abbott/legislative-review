'use strict';

const React = require('react');

module.exports = props => {
	let icon = (props.icon) ? <Icon name={props.icon}/> : null;

	return <a
		disabled={props.disabled}
		className={props.className}
		type={props.type}
		onClick={props.onClick}>{icon} {props.title}</a>;
};