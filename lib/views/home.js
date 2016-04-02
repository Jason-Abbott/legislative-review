'use strict';

const React = require('react');
const BillList = require('../components/bill-list');
const BlogList = require('../components/blog-list');

module.exports = props => (
	<div>
		<div className="hero"></div>
		<BlogList/>
		<BillList/>
	</div>
);
