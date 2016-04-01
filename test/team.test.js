'use strict';

// https://facebook.github.io/react/docs/test-utils.html

const team = require('./views.js');
const reactTest = require('react-addons-test-utils');
const mocha = require('mocha');
const expect = require('chai').expect;

describe('Team', ()=> {
	it('dispatches actions', ()=> {
		expect(team.actions(2)).equals({});
	});
});