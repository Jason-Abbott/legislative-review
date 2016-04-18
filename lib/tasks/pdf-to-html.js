'use strict';

// use pdf2json to convert PDF document to HTML

// curried method to convert PDF units to standard layout units (e.g. in, cm)
const convert = factor => value => value / factor;
const section = require('./bill-section');

// future configurable
const layout = {
	height: 11,
	width: 8.5,
	leftMargin: 1,
	tab: { size: 0.4, tolerance: 0.2 },
	line: {
		// vertical deviation allowed for text considered to be on the same line
		tolerance: 0.1,
		height: 0.25,
		numberMargin: 0.85
	}
};

module.exports = function(pdf) {
	let previousLine = { bottom: 0, words: [] };
	// calculate unit conversion factor from known page size
	let unit = convert(pdf.formImage.Width / layout.width);
	// unlike position, width is measured in points
	let points = convert(72);
	
	return pdf.formImage.Pages
		.map(p => p.Texts
			// standardize text elements
			.map(el => ({
				left: unit(el.x),
				bottom: unit(el.y),
				right: unit(el.x) + points(el.w),
				text: (el.R[0].T)
					.replace('%2C', ',')
					.replace('%3A', ':')
					.replace('%3B', ';')
					.replace('%24', '$')
			}))
			// combine text elements into lines
			.reduce((lines, el) => {
				let line = lines.find(l =>
					// find line matching vertical position
					l.bottom >= el.bottom - layout.line.tolerance &&
					l.bottom <= el.bottom + layout.line.tolerance);

				if (line === undefined) {
					 line = {
						bottom: el.bottom,
						left: el.left,
						words: [],
						sectionLabels: [],
						firstWordSpace: 0,
						numbered: false
					};
					lines.push(line);
				}

				if (el.left < layout.line.numberMargin && /^\d+$/.test(el.text)) {
					line.numbered = true;
				} else {
					line.words.push(el.text);
					// first word spacing helps identify labels
					if (line.words.length == 1) {
						line.firstWordSpace = el.right;
					} else if (line.words.length == 2) {
						line.firstWordSpace = el.left - line.firstWordSpace;
					}
					// record positions of elements matching section label pattern
					if (section.isLabel(el.text)) {
						line.sectionLabels.push(line.words.length - 1);
					}
					if (el.left < line.left) { line.left = el.left; }
				}
				return lines;
			},	[])
			// remove un-numbered lines
			.filter(l => l.numbered)
		)
		// combine page lines
		.reduce((lines, p) => lines.concat(p), [])
		// identify sections
		.map(section.updateLine)
		// format paragraphs
		.map(line => {
			if (line.bottom - previousLine.bottom > layout.line.height) {
				// new paragraph
				line.words.unshift('<p>');
				previousLine.words.push('</p>');
			}

			previousLine = line;
			return line;
		});
};

// indent count to calculate number of nested lists
function inferIndent(line) {
	let left = layout.leftMargin;
	let middle = Math.floor(layout.width / 2);

	for (let i = 0, j = left; j < middle; i++, j += layout.tab.size) {
		if (line.left <= j + layout.tab.tolerance &&
			 line.left >= j - layout.tab.tolerance) { return i; }
	}
	return 0;
}

function isUnderlined(region) {
	pdf.HLines.find(line => {
		line.l > 0;
		line.w > region;
		line.x > 0;
		line.y > 0;
	})
}

function isStricken(region) {

}

// whether two items overlap
function overlap(item1, item2) {

}