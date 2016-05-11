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
	tab: 0.38,
	line: {
		// vertical deviation allowed for text considered to be on the same line
		tolerance: 0.1,
		height: 0.25,
		numberMargin: 0.85,
		underlineBelowText: 0.2,
		strikethroughBelowText: 0.15
	},
	replacements: {
		before: [
			[/^\s*(AN ACT)\n([^\n]+)\n+([^:]+:)/,
				'<header><h1>$1</h1><h2>$2</h2><h3>$3</h3></header>'],
			[/(\n|^)(SECTION \d+[^:]+:)\n+(.+[A-Z]\.)((\n|.)+)(?=(\nSECTION|$))/,
				'<section><h1>$2</h1><h2>$3</h2>$4</section>']
		],
		after: [
			[/(<section>.+<\/h2>)((?!(<p>|<ol)).+?)(<ol)/, '$1<p>$2</p>$4']
		]
	}
};

function convertPDF(pdf) {
	const hyphen = /\- *(<\/(ins|del)>$|$)/;
	const sub = pair => html = html.replace(pair[0], pair[1]);
	let previousWord = null;
	let previousLine = { bottom: 0, right: 0, words: [] };
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
						left: el.left, 
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
					if (el.left < line.left) { line.left = el.left; }
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
		.map((line, i) => {
			// line is tabbed or there's a double space above
			if (line.bottom - previousLine.bottom > layout.line.height) {
				line.words.unshift('\n');
			}
				 //line.left >= (layout.leftMargin + layout.tab)) { line.words.unshift('\n'); }

			if (line.right < (layout.width - layout.rightMargin)) {
				// add line break if words don't reach right margin
				line.words.push('\n');
			} else {
				// otherwise assume line wraps
				let last = line.words.pop();
				line.words.push(hyphen.test(last) ? last.replace(hyphen, '☺$1') : last + ' ');
			}
			previousLine = line;
			return line;
		})
		// combine words
		.reduce((text, line) => text + line.words.join(''), '')
		// now we're down to a string
		.replace(/ *\n */g, '\n')
		// hyphenated words
		.replace(/(\w)(<\/(ins|del)> *<\3>)? *☺ *(<\/\3> *<\3>)?(\w)/g, '$1$5');

	// custom replacements before outline
	layout.replacements.before.forEach(pair => html = html.replace(pair[0], pair[1]));
	// outline and clean-up
	html = format.pretty(outline.apply(html).replace(/\n/g, ''));
	// custom replacements after outline
	layout.replacements.after.forEach(pair => html = html.replace(pair[0], pair[1]));
	
	return '<article>' +	html + '</article>';
}

function isTabbed(line, previousLine, tab = 1) {
	return line.left >= (layout.leftMargin + layout.tab * tab)
		 && line.left < (layout.leftMargin + layout.tab * (tab + 1))
}

function isSameLine(el, line) {
	return line.bottom >= el.bottom - layout.line.tolerance
		 && line.bottom <= el.bottom + layout.line.tolerance;
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
}

module.exports = { isUnderlined,	isStricken,	isSameLine, outline,	parse: convertPDF, unit: convertUnit, layout };