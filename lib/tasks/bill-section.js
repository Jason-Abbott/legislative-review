'use strict';

// parse haphazard section label placement
// separate module simplifies testing

const roman = require('./roman-numeral');
const style = { ALPHA_LOWER: 0, ALPHA_UPPER: 1, NUMBER: 2, ROMAN_UPPER: 3, ROMAN_LOWER: 4 };
// public members
const section = {
	style: style,
	expect: null,
	options: {
		label: {
			spaceAfter: 0.1,
			style: '(x)',
			pattern: /^\((\d|[a-z]|[ivx]{1,3})\)$/,
			formatting: /[^0-9a-z]/g,
			embedMustFollow: /\.$/,
			embeddable: /\(a\)/
		},
		// numbering style at each indent level
		numbering: [ style.ALPHA_LOWER, style.NUMBER, style.ROMAN_LOWER ]
	},
	isLabel(text) { return this.options.label.pattern.test(text); },
	// find and format section labels in a line of text
	updateLine(line) {
		line.sectionLabels.forEach(pos => {
			expect.forEach(expect => {
				if (expect.label == line.words[pos] && validLabel(pos, line)) {
					line.words[pos] = (expect.count == 1) ? '<ol><li>' : '<li>';
					update(expect);
				}
			});
		});
		return line;
	}
};
// next label to expect at each indent level
const expect = section.expect = [{ label: nextLabel(0), count: 1 }];

// update exectations for next section(s)
function update(match) {
	let i = expect.findIndex(s => s.label == match.label && s.count == match.count);
	
	nextExpectation(i);

	if (expect[i].count == 2) {
		expect.push({ label: nextLabel(i + 1), count: 1 });
	} else if (expect[i].count > 2) {
		nextExpectation(i + 1);
	}
}

const validLabel = (pos, line) =>
	(pos == 0 && line.firstWordSpace >= section.options.label.spaceAfter) ||
	(pos > 0 &&
	section.options.label.embeddable.test(line.words[pos]) &&
	section.options.label.embedMustFollow.test(line.words[pos - 1]));

function nextExpectation(indent) {
	expect[indent] = {
		label: nextLabel(indent, expect[indent].label),
		count: expect[indent].count++
	};
}

function nextLabel(indent, label) {
	let next = '';

	if (label === undefined) {
		switch(section.options.numbering[indent]) {
			case style.ALPHA_LOWER: next = 'a'; break;
			case style.ALPHA_UPPER:	next = 'A'; break;
			case style.NUMBER: next = '1'; break;
			case style.ROMAN_LOWER: next = 'i'; break;
			case style.ROMAN_UPPER: next = 'I'; break;
		}
		return section.options.label.style.replace('x', next);
	} else {
		let bare = label.replace(section.options.label.formatting, '');
		switch(section.options.numbering[indent]) {
			case style.ALPHA_LOWER:
			case style.ALPHA_UPPER:	next = String.fromCharCode(bare.charCodeAt(0) + 1); break;
			case style.NUMBER: next = parseInt(bare) + 1; break;
			case style.ROMAN_LOWER: next = roman.increment(bare).toLowerCase(); break;
			case style.ROMAN_UPPER: next = roman.increment(bare); break;
		}
		section.options.label.formatting.lastIndex = 0;
		return label.replace(bare, next);
	}
}

module.exports = section;