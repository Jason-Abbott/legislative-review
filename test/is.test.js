'use strict';

const L = require('./');
const mocha = require('mocha');
const expect = require('chai').expect;
let u;   // undefined

describe('Identity Evaluations', ()=> {
	it('identifies undefined variables', ()=> {
		expect(L.is.value(u)).is.false;
		expect(L.is.value(null)).is.false;
		expect(L.is.value('whatever')).is.true;
	});
	it('identifies empty strings', ()=> {
		expect(L.is.empty(u)).is.true;
		expect(L.is.empty(' ')).is.false;
		expect(L.is.empty('')).is.true;
		expect(L.is.empty(null)).is.true;
	});
	it('identifies arrays', ()=> {
		expect(L.is.array(u)).is.false;
		expect(L.is.array([])).is.true;
		expect(L.is.array(new Array())).is.true;
		expect(L.is.array(null)).is.false;
	});
});