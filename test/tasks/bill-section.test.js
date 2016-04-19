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
		   words: ['one','two','three','(a)','four','five']
	   });
		expect(line.words[3]).equals('(a)');

		// default label match requires preceding period
		line.words[2] += '.';
		section.updateLine(line);
		expect(line.words[3]).equals('<ol><li>');

		// default embed rule only recognizes first list item
		line = section.updateLine({
			sectionLabels: [2],
			words: ['one','two.','(b)','four']
		});
		expect(line.words[2]).equals('(b)');
	});
	
	it('updates label expectation', ()=> {
		section.update({ label: '(a)', count: 1 });

		expect(section.expect[0]).equals({ label: '(b)', count: 2 });
		expect(section.expect[1]).equals({ label: '(1)', count: 1 });
	});

	it('allows label pattern configuration', ()=> {
		section.options.label.pattern = /^\[[A-Z]\]$/;
		expect(section.isLabel('(a)')).is.false;
		expect(section.isLabel('[A]')).is.true;
	});
});