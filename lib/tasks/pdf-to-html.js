'use strict';

// use pdf2json to convert PDF document to HTML

// curried method to convert PDF units to standard layout units (e.g. in, cm)
const convertUnit = factor => value => value / factor;
const outline = require('./outline');
const format = require('../format');

// future configurable
const layout = {
	height: 11,
	width: 8.5,
	leftMargin: 1,
	rightMargin: 1,
	//tab: { size: 0.4, tolerance: 0.2 },
	line: {
		// vertical deviation allowed for text considered to be on the same line
		tolerance: 0.1,
		height: 0.25,
		numberMargin: 0.85
	}
};

function convertPDF(pdf) {
	let previousLine = { bottom: 0, words: [] };
	// calculate unit conversion factor from known page size
	let unit = convertUnit(pdf.formImage.Width / layout.width);
	// unlike position, width is measured in points
	let points = convertUnit(72);
	let html = pdf.formImage.Pages
		.map(p => p.Texts
			// standardize text elements
			.map(el => ({
				left: unit(el.x),
				bottom: unit(el.y),
				right: unit(el.x) + points(el.w),
				underline: isUnderlined(el, p),
				strikethrough: isStricken(el, p),
				text: format.htmlDecode(el.R[0].T)
			}))
			// combine text elements into lines
			.reduce((lines, el) => {
				let line = lines.find(l => isSameLine(el, l));
				if (line === undefined) {
					 line = {
						bottom: el.bottom,
						right: el.right,
						words: [],
						numbered: false
					};
					lines.push(line);
				}

				if (el.left < layout.line.numberMargin && /^\d+$/.test(el.text)) {
					line.numbered = true;
				} else {
					if (el.right > line.right) { line.right = el.right; }
					// don't push line number into the word list
					line.words.push(el.text);
				}

				// if (isUnderlined(el, p)) {
				// 	el.text = '<ins>' + el.text + '</ins>';
				// } else if (isStricken(el, p)) {
				// 	el.text = '<del>' + el.text + '</del>';
				// }

				return lines;
			},	[])
			// remove un-numbered lines
			.filter(l => l.numbered)
		)
		// combine page lines into one line array
		.reduce((lines, p) => lines.concat(p), [])
		// add line breaks
		.map(line => {
			// double space above
			if (line.bottom - previousLine.bottom > layout.line.height) { line.words.unshift('\n'); }

			if (line.right < layout.line.rightMargin) {
				// assume lines that reach right margin are wrapped while others need a line break
				line.words.push('\n');
			} else {
				// replace hyphen in margin-aligned last word
				line.words[line.words.length - 1].replace(/\- *$/, '☺');
			}
			previousLine = line;
			return line;
		})
		// combine words
		.reduce((text, line) => text + ' ' + line.words.join(' '), '')
		// now we're down to a string
		.replace(/ *\n */g, '\n')
		// hyphenated words
		.replace(/(\w) *☺ *(\w)/g, '$1$2')
		// paragraphs
		.replace(/\n{2}/g, '</p><p>')
		.replace(/^/, '<div><p>')
		.replace(/<div><p>\n?AN ACT/, '<div>AN ACT<p class="summary">')
		// section outline
		.replace(outline.pattern(), outline.parse())
		// flatten
		.replace(/\n/g, ' ');

	return format.pretty(html) + '</div>';
}

function isSameLine(el, line) {
	return line.bottom >= el.bottom - layout.line.tolerance &&
			 line.bottom <= el.bottom + layout.line.tolerance;
}

function isUnderlined(el, page) { return hasLine(el, page, 0); }
function isStricken(el, page) { return hasLine(el, page, 0); }

function hasLine(el, page, offset) {
	// https://github.com/modesty/pdf2json
	// underline {
	//    x: 6.01,
	// 	y: 35.98,
	// 	w: 59.178 = 0.822in = 3.7pu (page units)
	// 	sw: 0.32553125,
	// 	clr: 0,
	// 	A: 'left',
	// 	R: [ { T: 'twentieth', S: -1, TS: [ 3, 13.9589, 0, 0 ] } ] }

	// strike {
	//    x: 31.872999999999998,
	// 	y: 35.226,
	// 	w: 26.301 = 0.365in = 1.64pu
	// 	sw: 0.32553125,
	// 	clr: 0,
	// 	A: 'left',
	// 	R: [ { T: '20th', S: -1, TS: [Object] } ] }

	// HLines [
	//(s) { x: 32.123, y: 35.822, w: 0.822, l: 1.644 },
	//(u)	{ x: 6.26, y: 36.884, w: 0.822, l: 3.699 } ]

	// page width is given as 38.x
	// so

	let match = page.HLines.find(line => {
		
	});
	
	if (el.R[0].T == 'twentieth' || el.R[0].T == '20th') {
		console.log(el);
		console.log(page.HLines);
	}
	return match != undefined;
}

module.exports = {
	isUnderlined: isUnderlined,
	isStricken: isStricken,
	isSameLine: isSameLine,
	from: convertPDF,
	unit: convertUnit,
	layout: layout
};