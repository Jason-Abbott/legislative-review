'use strict';

const React = require('react');

module.exports = (props, context) => (
	<div className="card member" onClick={props.onClick}>
		{ props.member.name }
	</div>
);