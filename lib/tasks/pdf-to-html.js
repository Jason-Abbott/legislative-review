'use strict';

// use pdf2json to convert PDF document to HTML
// three different units are used
//    page units: almost universal in the PDF JSON data, 4.5 per inch
//    standard units: defined in layout, can be in., cm. or whatever
//    points: used for some items in the PDF JSON data, 72 per inch

// curried method to convert PDF units to standard layout units (e.g. in, cm)
const convertUnit = factor => value => value / factor;
const outline = require('./outline');
const format = require('../format');
const pointsPerInch = 72;

const layout = {
	height: 11,
	width: 8.5,
	leftMargin: 1,
	rightMargin: 1.2,
	space: 0.045,
	line: {
		// vertical deviation allowed for text considered to be on the same line
		tolerance: 0.1,
		height: 0.25,
		numberMargin: 0.85,
		underlineBelowText: 0.2,
		strikethroughBelowText: 0.15
	}
};

function convertPDF(pdf) {
	let previousWord = null;
	let previousLine = { bottom: 0, words: [] };
	// calculate unit conversion factor from known page size
	let unit = convertUnit(pdf.formImage.Width / layout.width);
	// unlike position, width is measured in points
	let points = convertUnit(pointsPerInch);
	let html = pdf.formImage.Pages
		.map(p => p.Texts
			// standardize text elements
			.map(el => ({
				left: unit(el.x),
				bottom: unit(el.y),
				right: unit(el.x) + points(el.w),
				underline: isUnderlined(el, p),
				strikethrough: isStricken(el, p),
				text: format.htmlDecode(el.R[0].T).trim()
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
					previousWord = null;
				}

				if (el.left < layout.line.numberMargin && /^\d+$/.test(el.text)) {
					line.numbered = true;
				} else {
					if (el.right > line.right) { line.right = el.right; }
					// don't push line number into the word list
					if (el.underline) {
						el.text = '<ins>' + el.text + '</ins>';
					} else if (el.strikethrough) {
						el.text = '<del>' + el.text + '</del>';
					}
					if (previousWord != null && el.left - previousWord.right >= layout.space) {
						el.text = ' ' + el.text;
					}
					line.words.push(el.text);
					
					previousWord = el;
				}
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

			if (line.right < (layout.width - layout.rightMargin)) {
				// assume lines that reach right margin are wrapped while others need a line break
				line.words.push('\n');
			} else {
				// replace hyphen in margin-aligned last word
				const last = line.words.length - 1;
				line.words[last] = line.words[last].replace(/\- *$/, '☺');
			}
			previousLine = line;
			return line;
		})
		// combine words
		.reduce((text, line) => text + ' ' + line.words.join(''), '')
		// now we're down to a string
		.replace(/ *\n */g, '\n')
		// hyphenated words
		.replace(/(\w) *☺ *(\w)/g, '$1$2')
		// paragraphs
		.replace(/\n{2}/g, '</p><p>')
		.replace(/^\n?AN ACT/, '<div>AN ACT<p class="summary">');
		
	return format.pretty(
		// close intro paragraph and flatten	
		outline.apply(html).replace(/<ol/, '</p><ol').replace(/\n/g, ' ')
		) + '</div>';
}

function isSameLine(el, line) {
	return line.bottom >= el.bottom - layout.line.tolerance &&
			 line.bottom <= el.bottom + layout.line.tolerance;
}

function isUnderlined(el, page) { return hasLine(el, page, layout.line.underlineBelowText); }
function isStricken(el, page) { return hasLine(el, page, layout.line.strikethroughBelowText); }

function hasLine(el, page, relativeToBaseline = 0) {
	// factor to convert all units to page units
	const factor = page.Height / layout.height;
	const xTolerance = 0.3;
	const yTolerance = (layout.line.tolerance / 2) * factor;
	const y = el.y + (relativeToBaseline * factor);
	// text width is measured in points
	const xMin = el.x + (el.w / pointsPerInch) * factor;
	
	return page.HLines.findIndex(line =>
		line.x <= el.x + xTolerance && 
		line.y <= y + yTolerance &&
		line.y > y - yTolerance && 
		line.x + line.l >= xMin) >= 0;

	// underline { x: 6.01, y: 35.98, w: 59.178 = 3.7pu (page units)
	// strike { x: 31.872999999999998, y: 35.226, w: 26.301 = 1.64pu

	// HLines [
	//(u)	{ x: 6.26, y: 36.884, w: 0.822, l: 3.699 }
	//(s) { x: 32.123, y: 35.822, w: 0.822, l: 1.644 }]
}

module.exports = { isUnderlined,	isStricken,	isSameLine,	parse: convertPDF, unit: convertUnit, layout };