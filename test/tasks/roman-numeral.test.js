'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const roman = require('../../lib/tasks/roman-numeral');

describe('Roman Numeral Converter', ()=> {
	it('converts to arabic', ()=> {
		expect(roman.from(3)).equals('III');
		expect(roman.from(11)).equals('XI');
		expect(roman.from(9)).equals('IX');
	});
	
	it('converts from arabic', ()=> {
		expect(roman.toArabic('I')).equals(1);
		expect(roman.toArabic('i')).equals(1);
		expect(roman.toArabic('IX')).equals(9);
	});
	
	it('does addition', ()=> {
		expect(roman.add('III', 2)).equals('V');
	});
	
	it('does subtraction', ()=> {
		expect(roman.subtract('III', 2)).equals('I');
	});

	it('increments', ()=> {
		expect(roman.increment('III')).equals('IV');
	});

	it('decrements', ()=> {
		expect(roman.decrement('V')).equals('IV');
	});
});