'use strict';

require('./setup')();
const React = require('react');
const ReactDOM = require('react-dom');
const ReactTest = require('react-addons-test-utils');

module.exports = {
	is: require('../lib/utils/is'),
	format: require('../lib/utils/format'),
	routes: require('../lib/routes'),
	views: require('../lib/views/'),
	components: require('../lib/components/'),
	// current test-utils fails to render bare, stateless components
	render(component) {
		let el = ReactTest.renderIntoDocument(<div>{component}</div>);
		return (el === null) ? null : ReactDOM.findDOMNode(el).children[0];
	}
};