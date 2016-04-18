'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const section = require('../../lib/tasks/bill-section');

describe('Bill Sections', ()=> {
	it('matches section labels', ()=> {
		expect(section.isLabel('(a)')).is.true;
		expect(section.isLabel('a')).is.false;
		expect(section.isLabel('(1)')).is.true;
	});

	it('recognizes embedded section start', ()=> {
		let line = section.updateLine({
		   sectionLabels: [3],
		   words: ['one','two','three.','(a)','four','five']
	   });
		expect(line.words[3]).equals('<ol><li>');
	});

	it('allows label pattern configuration', ()=> {
		section.options.label.pattern = /^\[[A-Z]\]$/;
		expect(section.isLabel('(a)')).is.false;
		expect(section.isLabel('[A]')).is.true;
	});
});