'use strict';

const React = require('react');
const Icon = require('./icon');

module.exports = class extends React.Component {
	render() {
		return (
			<div className="notification-menu">
				<Icon name="bell"/>
			</div>
		);
	}
};
