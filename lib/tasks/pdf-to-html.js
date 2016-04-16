'use strict';

// curried method to convert PDF units to standard layout units (e.g. in, cm)
const convert = factor => value => value / factor;
const sequence = { ALPHA_LOWER: 0, ALPHA_UPPER: 1, NUMBER: 2, ROMAN_UPPER: 3, ROMAN_LOWER: 4 };
const roman = require('./roman-numeral');

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
	},
	section: {
		label: {
			spaceAfter: 0.1,
			style: '(x)',
			pattern: /^\((\d|[a-z]|[ivx]{1,3})\)$/,
			formatting: /[^0-9a-z]/g,
			embedMustFollow: /\.$/,
			embeddable: /\(a\)/
		},
		// numbering style at each indent level
		numbering: [ sequence.ALPHA_LOWER, sequence.NUMBER, sequence.ROMAN_LOWER ]
	}
};

module.exports = function(pdf) {
	let indent = 0;
	// next section label to expect at each indent level
	let nextSections = [{ label: nextSectionLabel(0), count: 1 }];
	let previousLine = { bottom: 0, words: [] };
	// calculate unit conversion factor from known page size
	let unit = convert(pdf.formImage.Width / layout.width);
	// unlike position, width is measured in points
	let points = convert(72);

	const validLabel = (pos, line) =>
		(pos == 0 && l.firstWordSpace >= layout.section.label.spaceAfter) ||
		(pos > 0 &&
			layout.section.label.embeddable.test(line.words[pos]) &&
			layout.section.label.embedMustFollow.test(line.words[pos - 1]));

	const updateSection = () => {
		nextSections[indent].label = nextSectionLabel(indent, nextSections[indent].label);
		nextSections[indent].count++;

		if (nextSections[indent].count == 2) {
			nextSections[indent + 1] = {
				label: nextSectionLabel(indent + 1),
				count: 1
			}
		}
	};

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
					// record positions of potential section labels
					if (layout.section.label.pattern.test(el.text)) {
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
		// identify sections and paragraphs
		.map(line => {
			line.sectionLabels.forEach(pos => {
				nextSections.forEach(s => {
					if (s.label == line.words[pos] && validLabel(pos, line)) {
						let tag = (s.count == 1) ? '<ol><li>' : '<li>';
						line.words[pos] = tag + line.words[pos];
						updateSection();
					}
				});
			});

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

function nextSectionLabel(indent, label) {
	let next = '';

	if (label === undefined) {
		switch(layout.section.numbering[indent]) {
			case sequence.ALPHA_LOWER: next = 'a'; break;
			case sequence.ALPHA_UPPER:	next = 'A'; break;
			case sequence.NUMBER: next = '1'; break;
			case sequence.ROMAN_LOWER: next = 'i'; break;
			case sequence.ROMAN_UPPER: next = 'I'; break;
		}
		return layout.section.style.replace('x', next);
	} else {
		let bare = label.replace(layout.section.label.formatting, '');
		switch(layout.section.numbering[indent]) {
			case sequence.ALPHA_LOWER:
			case sequence.ALPHA_UPPER:	next = String.fromCharCode(bare.charCodeAt(0) + 1); break;
			case sequence.NUMBER: next = parseInt(bare) + 1; break;
			case sequence.ROMAN_LOWER: next = roman.increment(bare).toLowerCase(); break;
			case sequence.ROMAN_UPPER: next = roman.increment(bare); break;
		}
		layout.section.label.formatting.lastIndex = 0;
		return label.replace(bare, next);
	}
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