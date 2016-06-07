'use strict';

const React = require('react');
const Icon = require('./icon');

module.exports = props => {
	const icon = (props.icon) ? <Icon name={props.icon}/> : null;
	
	return <button
		disabled={props.disabled}
		className={props.className}
		type={props.type}
		onClick={props.onClick}>{icon} {props.title}</button>;
};