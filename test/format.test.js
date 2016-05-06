'use strict';

const format = require('../lib/format');
const mocha = require('mocha');
const expect = require('chai').expect;

describe('String Formatter', ()=> {
	it('replaces straight with curly quotes', ()=> {
		let source = 'some text "that is quoted," a bit';
		let target = 'some text &ldquo;that is quoted,&rdquo; a bit';
		expect(format(source, false).curlyQuotes()).equals(target);

		source = '"quote at beginning of line" should work';
		target = '&ldquo;quote at beginning of line&rdquo; should work';

		expect(format(source, false).curlyQuotes()).equals(target);

	});
	it('replaces straight with curly apostrophes', ()=> {
		const source = "no you didn't";
		const target = 'no you didn&rsquo;t';
		expect(format(source, false).apostrophes()).equals(target);
	});
	it('supports method chaining', () => {
		const source = '"no you didn\'t," she said';
		const target = '&ldquo;no you didn&rsquo;t,&rdquo; she said';
		expect(format(source)
			.curlyQuotes()
			.apostrophes()
			.done())
			.equals(target);
	})
});