'use strict';

const { is } = require('./');
const mocha = require('mocha');
const expect = require('chai').expect;
let u;   // undefined

describe('Identity Evaluations', ()=> {
	it('identifies undefined variables', ()=> {
		expect(is.value(u)).is.false;
		expect(is.value(null)).is.false;
		expect(is.value('whatever')).is.true;
	});
	it('identifies empty strings', ()=> {
		expect(is.empty(u)).is.true;
		expect(is.empty(' ')).is.false;
		expect(is.empty('')).is.true;
		expect(is.empty(null)).is.true;
	});
	it('identifies arrays', ()=> {
		expect(is.array(u)).is.false;
		expect(is.array([])).is.true;
		expect(is.array(new Array())).is.true;
		expect(is.array(null)).is.false;
	});
});