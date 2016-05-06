'use strict';

const path = require('path');
const fs = require('fs');
const mocha = require('mocha');
const expect = require('chai').expect;
const PDFParser = require('pdf2json/PDFParser');
const pdfToHtml = require('../../lib/tasks/pdf-to-html');

describe('PDF to HTML converter', ()=> {
	let root = path.join(__dirname, '../');
	let source = '';
	let target = '';

	before(done => {
		let pending = 2;

		fs.readFile(root + 'test-input.pdf', (err, data) => {
			let parse = new PDFParser();
			parse.on("pdfParser_dataError", err => { throw err	});
			parse.on("pdfParser_dataReady", d => {
				source = pdfToHtml(d);
				if (--pending == 0) { done(); }
			});
			parse.parseBuffer(data);
		});

		fs.readFile(root + 'test-output.html', 'utf-8', (err, data) => {
			target = data
				.replace(/<!\-\-[^>]+>/g, '')
				.replace(/[\r\n]/g, '')
				.replace(/>\s+</g, '><')
				.replace(/\s*([<>])\s*/g, '$1');

			if (--pending == 0) { done(); }
		});
	});

	it('identifies paragraphs', ()=> {
		expect(source).equals(target);
	});
});