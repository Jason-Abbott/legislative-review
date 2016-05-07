'use strict';

const format = require('../lib/format');
const mocha = require('mocha');
const expect = require('chai').expect;

describe('String Formatter', ()=> {
	it('replaces straight with curly quotes', ()=> {
		let source = 'some text "that is quoted," a bit';
		let target = 'some text &ldquo;that is quoted,&rdquo; a bit';
		expect(format.curlyQuotes(source)).equals(target);

		source = '"quote at beginning of line" should work';
		target = '&ldquo;quote at beginning of line&rdquo; should work';

		expect(format.curlyQuotes(source)).equals(target);

	});
	it('removes redundant HTML tags', ()=> {
		const source = '<del>something</del> <del>something else</del>';
		const target = '<del>something something else</del>';
		expect(format.removeExtraTags(source)).equals(target);
	});
	it('replaces straight with curly apostrophes', ()=> {
		const source = "no you didn't";
		const target = 'no you didn&rsquo;t';
		expect(format.apostrophes(source)).equals(target);
	});
});