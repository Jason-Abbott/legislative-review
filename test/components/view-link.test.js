'use strict';

// https://facebook.github.io/react/docs/test-utils.html

const L = require('../');
const ViewLink = L.components.viewLink;
const mocha = require('mocha');
const expect = require('chai').expect;
const React = require('react');
const ReactDOM = require('react-dom');
const rt = require('react-addons-test-utils');

describe('View Link Component', ()=> {
	it('shows a link', ()=> {
		let el = rt.renderIntoDocument(<ViewLink href="link" title="title"/>);
		
		expect(el).is.not.null;

		if (el !== null) {
			let c = ReactDOM.findDOMNode(el);
			expect(c.getAttribute('href')).equals('/link');
			expect(c.innerHTML).equals('title');
		}
	});
});