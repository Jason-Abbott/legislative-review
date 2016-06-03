"use strict";

const c = require('../constants');
const React = require('react');
const Link = require('./view-link');

module.exports = () => {
	return (
		<footer className="main">
			<nav>
				<Link href={c.view.FINANCES} title="Finances"/>
				<Link href={c.view.PRIVACY} title="Privacy"/>
				<Link href={c.view.ABOUT} title="About"/>
			</nav>
		</footer>
	);
};