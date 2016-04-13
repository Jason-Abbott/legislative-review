'use strict';

// Load remote PDF or HTML and parse

const request = require('superagent');
const cheerio = require('cheerio');
const PDFParser = require('pdf2json/PDFParser');

module.exports = {
	pdf(url, callback) {
		load(url, text => {
			let parse = new PDFParser();

			parse.on("pdfParser_dataError", err => {
				console.error(err.parserError);
			});
			parse.on("pdfParser_dataReady", data => {
				callback(data);
			});
			parse.parseBuffer(text);
		});
	},
	
	dom(url, callback) {
		load(url, text => { callback(cheerio.load(text)); })
	}
};

function load(url, callback) {
	request.get(url).end((err, res) => {
		if (err == null && res.statusCode == 200) {
			callback(res.text);
		} else {
			console.error('Scraping %s returned %d', url, err.status);
		}
	});
}