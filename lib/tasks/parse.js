'use strict';

// Load remote PDF or HTML and parse

const request = require('superagent');
const cheerio = require('cheerio');
const PDFParser = require('pdf2json/PDFParser');
const pdfToHtml = require('./pdf-to-html');

request.parse['application/pdf'] = (res, fn) => {
	let data = [];
	res.on('data', chunk => { data.push(chunk); });
	res.on('end', ()=> { fn(null, Buffer.concat(data)); });
};

module.exports = {
	pdf(url, callback) {
		url = 'https://www.legislature.idaho.gov/legislation/2016/H0339.pdf';
		load(url, buffer => {
			let parse = new PDFParser();
			parse.on("pdfParser_dataError", err => { console.error(err.parserError); });
			parse.on("pdfParser_dataReady", data => { callback(pdfToHtml(data)); });
			parse.parseBuffer(buffer);
		});
	},
	
	dom(url, callback) {
		load(url, text => { callback(cheerio.load(text)); })
	}
};

function load(url, callback) {
	request.get(url).buffer(true).end((err, res) => {
		if (err == null && res.statusCode == 200) {
			callback(url.endsWith('pdf') ? res.body : res.text);
		} else {
			console.error('Scraping %s returned %d', url, err.status);
		}
	});
}