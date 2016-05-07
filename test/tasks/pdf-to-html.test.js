'use strict';

const path = require('path');
const fs = require('fs');
const mocha = require('mocha');
const expect = require('chai').expect;
const PDFParser = require('pdf2json/PDFParser');
const pdfToHtml = require('../../lib/tasks/pdf-to-html');

describe('PDF to HTML converter', ()=> {	
	it('converts units to a standard', ()=> {
		const pdfWidth = 34;
		const unitWidth = 8.5;
		const unit = pdfToHtml.unit(pdfWidth / unitWidth);
		
		expect(unit(12)).equals(3);
	});
	
	it('identifies words on the same line', ()=> {
		let line = { bottom: 2 };
		let el1 = { bottom: 2.5 };
		let el2 = { bottom: 2.01 };

		pdfToHtml.layout.line.tolerance = 0.1;
		
		expect(pdfToHtml.isSameLine(el1, line)).is.false;
		expect(pdfToHtml.isSameLine(el2, line)).is.true;
	});
	
	it('identifies lines as strikethrough or underline', ()=> {
		// https://github.com/modesty/pdf2json#page-object-reference
		let page = { HLines: [
			{ x: 32.123, y: 35.822, w: 0.822, l: 1.644 },
			{ x: 6.26, y: 36.884, w: 0.822, l: 3.699 }
		]};
		let el1 = { x: 31.872999999999998, y: 35.226, w: 26.301 };
		let el2 = { x: 6.01, y: 35.98,	w: 59.178 };

		expect(pdfToHtml.isStricken(el1, page)).is.true;
		expect(pdfToHtml.isUnderlined(el2, page)).is.true;
	});

	it('creates well-formed HTML', done => {
		let root = path.join(__dirname, '../');
		let pending = 2;
		let source = '';
		let target = '';

		fs.readFile(root + 'test-input.pdf', (err, data) => {
			let parse = new PDFParser();
			parse.on("pdfParser_dataError", err => { throw err	});
			parse.on("pdfParser_dataReady", d => {
				source = pdfToHtml.from(d);
				if (--pending == 0) { expect(source).equals(target); done(); }
			});
			parse.parseBuffer(data);
		});

		fs.readFile(root + 'test-output.html', 'utf-8', (err, data) => {
			target = data
				.replace(/<!\-\-[^>]+>/g, '')
				.replace(/[\r\n]/g, '')
				.replace(/>\s+</g, '><')
				.replace(/\s*([<>])\s*/g, '$1');

			if (--pending == 0) { expect(source).equals(target); done(); }
		});
	});
});