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
	
	it('removes extra spaces', ()=> {
		expect(format.removeExtraSpace('one , two, three')).equals('one, two, three');
		// remove space between block tags
		expect(format.removeExtraSpace('<div>one</div> <div>two</div>')).equals('<div>one</div><div>two</div>');
		// retain space between inline tags
		expect(format.removeExtraSpace('<ins>one</ins> <del>two</del>')).equals('<ins>one</ins> <del>two</del>');
		// leading tag space
		expect(format.removeExtraSpace('<p attr="one"> two')).equals('<p attr="one">two');
		// before block tag
		expect(format
			.removeExtraSpace('where such payment is made:   <ol style="list-style-type: decimal;"><li>Shall'))
			.equals('where such payment is made:<ol style="list-style-type: decimal;"><li>Shall')
	});
	
	it('normalize dashes', ()=> {
		expect(format.dashes('em-dash --   after')).equals('em-dash &mdash; after');
		expect(format.dashes('some- thing')).equals('some-thing');
	});
	
	it('removes redundant HTML tags', ()=> {
		const source = '<del>one</del> <del>two three</del>';
		const target = '<del>one two three</del>';
		expect(format.removeExtraTags(source)).equals(target);
	});
	
	it('replaces straight with curly apostrophes', ()=> {
		const source = "no you didn't";
		const target = 'no you didn&rsquo;t';
		expect(format.apostrophes(source)).equals(target);
	});
});