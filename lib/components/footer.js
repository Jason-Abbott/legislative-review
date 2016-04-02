"use strict";

const L = require('../');
const React = require('react');
const Link = require('./view-link');
const v = L.constants.view;

module.exports = () => {
	return (
		<footer className="main">
			<nav>
				<Link href={v.FINANCES} title="Finances"/>
				<Link href={v.PRIVACY} title="Privacy"/>
				<Link href={v.ABOUT} title="About"/>
			</nav>
		</footer>
	);
};