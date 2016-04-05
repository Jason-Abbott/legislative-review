'use strict';

const jsdom = require('jsdom');
const html = '<html><body></body></html>';

module.exports = () => {
	global.document = jsdom.jsdom(html);
	global.window = document.defaultView;
	global.navigator = window.navigator;
};