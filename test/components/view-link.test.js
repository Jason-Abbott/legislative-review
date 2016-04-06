'use strict';

// https://facebook.github.io/react/docs/test-utils.html

const L = require('../');
const React = require('react');
const ViewLink = L.components.viewLink;
const mocha = require('mocha');
const expect = require('chai').expect;

describe('View Link Component', ()=> {
	it('shows a link', ()=> {
		let el = L.render(<ViewLink href="link" title="title"/>);

		expect(el).is.not.null;

		if (el !== null) {
			expect(el.getAttribute('href')).equals('/link');
			expect(el.innerHTML).equals('title');
		}
	});
});