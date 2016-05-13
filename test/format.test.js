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

		source = '<li>"Appraisal assignment" means';
		target = '<li>&ldquo;Appraisal assignment&rdquo; means';
		expect(format.curlyQuotes(source)).equals(target);

		source = '<ins>"</ins>forest land<ins>"</ins>';
		target = '<ins>&ldquo;</ins>forest land<ins>&rdquo;</ins>';
		expect(format.curlyQuotes(source)).equals(target);
		
		source = '"Provider(s)" means';
		target = '&ldquo;Provider(s)&rdquo; means';
		expect(format.curlyQuotes(source)).equals(target);
	});
	
	it('removes extra spaces', ()=> {
		expect(format.removeExtraSpace('one , two, three')).equals('one, two, three');
		// remove space between block tags
		expect(format.removeExtraSpace('<div>one</div> <div>two</div>')).equals('<div>one</div><div>two</div>');
		expect(format.removeExtraSpace('</tr>		<tr>')).equals('</tr><tr>');
		
		expect(format
			.removeExtraSpace('estate.</li>		<li>&ldquo;Appraisal'))
			.equals('estate.</li><li>&ldquo;Appraisal');

		expect(format
			.removeExtraSpace('<div>AN ACT	<p class="summary">RELATING'))
			.equals('<div>AN ACT<p class="summary">RELATING');

		// retain space between inline tags
		expect(format.removeExtraSpace('<ins>one</ins> <del>two</del>')).equals('<ins>one</ins> <del>two</del>');
		// leading tag space
		expect(format.removeExtraSpace('<p attr="one"> two')).equals('<p attr="one">two');
		expect(format.removeExtraSpace('<ins> &mdash;')).equals('<ins>&mdash;');
		// before block tag
		expect(format
			.removeExtraSpace('where such payment is made:   <ol style="list-style-type: decimal;"><li>Shall'))
			.equals('where such payment is made:<ol style="list-style-type: decimal;"><li>Shall');
		// around tables
		expect(format.removeExtraSpace('be:  <table>')).equals('be:<table>');
		
	});
	
	it('formats index lists', ()=> {
		let source = 'shall be:' +
			'Vehicles one (1) and two (2) years old .........................$69.00 ' +
			'Vehicles three (3) and four (4) years old ......................$57.00 ' +
			'Vehicles five (5) and six (6) years old ........................$57.00 ' +
			'Vehicles seven (7) and eight (8) years old .....................$45.00 ' +
			'Vehicles over eight (8) years old .............................$45.00 ' +
			'There shall be twelve (12) registration periods, starting in January for holders';
		let target = 'shall be:<table class="index">' +
			'<tr><td>Vehicles one (1) and two (2) years old</td><td>$69.00</td></tr>' +
			'<tr><td>Vehicles three (3) and four (4) years old</td><td>$57.00</td></tr>' +
			'<tr><td>Vehicles five (5) and six (6) years old</td><td>$57.00</td></tr>' +
			'<tr><td>Vehicles seven (7) and eight (8) years old</td><td>$45.00</td></tr>' +
			'<tr><td>Vehicles over eight (8) years old</td><td>$45.00</td></tr>' +
			'</table>There shall be twelve (12) registration periods, starting in January for holders';
		
		expect(format.indexes(source)).equals(target);
});
	
	it('normalize dashes', ()=> {
		expect(format.dashes('em-dash --   after')).equals('em-dash &mdash; after');
		expect(format.dashes('some- thing')).equals('some-thing');
		expect(format.dashes('<ins>-- POWDERED')).equals('<ins> &mdash; POWDERED');
	});
	
	it('removes redundant HTML tags', ()=> {
		const source = '<del>one</del> <del>two three</del>';
		const target = '<del>one two three</del>';
		expect(format.removeExtraTags(source)).equals(target);
		expect(format.removeEmptyTags('<p></p>')).equals('');
	});
	
	it('replaces straight with curly apostrophes', ()=> {
		let source = "no you didn't";
		let target = 'no you didn&rsquo;t';
		expect(format.apostrophes(source)).equals(target);

		source = 'plural possessives\'';
		target = 'plural possessives&rsquo;';
		expect(format.apostrophes(source)).equals(target);

		source = 'physicians\' assistants';
		target = 'physicians&rsquo; assistants';
		expect(format.apostrophes(source)).equals(target);
	});
});