'use strict';

const path = require('path');
const fs = require('fs');
const format = require('../../lib/utils/format');
const mocha = require('mocha');
const expect = require('chai').expect;
const PDFParser = require('pdf2json/PDFParser');
const pdfToHtml = require('../../lib/utils/pdf-to-html');
const testRange = [1, 15];


describe('PDF to HTML converter', ()=> {
	it('rounds numbers', ()=> {
		const round = pdfToHtml.round(2);
		expect(round(3.833333)).equals(3.83);
		expect(round(3.836666)).equals(3.84);
	});
	
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
		let page = {
			Height: 49.5,
			HLines: [
				{ x: 32.123, y: 35.822, w: 0.822, l: 1.644 },
				{ x: 6.26, y: 36.884, w: 0.822, l: 3.699 }
			]
		};
		let el1 = { x: 31.872999999999998, y: 35.226, w: 26.301, clr: 0 };
		let el2 = { x: 6.01, y: 35.98, w: 59.178, clr: 0 };

		expect(pdfToHtml.isStricken(el1, page)).is.true;
		expect(pdfToHtml.isUnderlined(el2, page)).is.true;
		expect(pdfToHtml.isStricken(el2, page)).is.false;
		expect(pdfToHtml.isUnderlined(el1, page)).is.false;

		// exclude hyperlink underlining indicated by blue text color
		el2.clr = 35;
		expect(pdfToHtml.isUnderlined(el2, page)).is.false;
	});

	let root = path.join(__dirname, '../pdf-to-html/');
	
	for (let i = testRange[0]; i <= testRange[1]; i++) {
		it('creates well-formed HTML ' + i, done => {
			let pending = 2;
			let source = '';
			let target = '';

			fs.readFile(root + 'test-input' + i + '.pdf', (err, data) => {
				let parse = new PDFParser();
				parse.on("pdfParser_dataError", err => { throw err	});
				parse.on("pdfParser_dataReady", d => {
					source = pdfToHtml.parse(d);
					if (--pending == 0) { expect(source).equals(target); done(); }
				});
				parse.parseBuffer(data);
			});

			fs.readFile(root + 'test-output' + i + '.html', 'utf-8', (err, data) => {
				target = format.removeExtraSpace(data
					.replace(/<!\-\-[^>]+>/g, '')
					.replace(/[\r\n]/g, ''));

				if (--pending == 0) { expect(source).equals(target); done(); }
			});
		})
	}
});