'use strict';

// parse haphazard section label placement
// separate module simplifies testing

const roman = require('./roman-numeral');
const style = { ALPHA_LOWER: 0, ALPHA_UPPER: 1, NUMBER: 2, ROMAN_UPPER: 3, ROMAN_LOWER: 4 };
const patterns = [];
// public members
const outline = {
	style: style,
	options: {
		format: '({0})',
		maxIndent: 3,
		defaultStyle: style.NUMBER,
		// numbering style at each indent level
		indentStyle: [ style.ALPHA_LOWER, style.NUMBER, style.ROMAN_LOWER ],
		// pattern preceding first label at each indent level (may differ from subsequent labels)
		indentPrefix: [ '(\\n|\\.|^)', '(\\n|\\)|^)', '(\\n|\\)|^)' ]
	},
	pattern(indent = 0) {
		if (patterns.length === 0) {
			// build pattern for each indent level
			let o = this.options;
			for (let i = 0; i < o.maxIndent; i++) {
				let s = (o.indentStyle.length > i) ? o.indentStyle[i] : o.defaultStyle;
				patterns.push(new RegExp(itemPattern(s, o.indentPrefix[i])));
			}
		}
		return patterns[indent];
	},
	
	parse(indent = 0) {
		return (match, ...capture) => {
			let fullText = capture.pop();
			let index = capture.pop();
			let text = '<ol>';

			// four regex captures per label
			for (let i = 1; i < capture.length; i += 4) {
				if (capture[i] === undefined) {
					break;
				} else if (indent >= this.options.maxIndent - 1) {
					text += '<li>' + capture[i] + '</li>';
				} else {
					text += '<li>' + capture[i].replace(this.pattern(indent + 1), this.parse(indent + 1)) + '</li>';
				}
			}
			return text + '</ol>';
		}
	}
};

function itemPattern(type, firstPrefix = '\\n', last = 25, index = 0) {
	let prefix = (index == 0) ? firstPrefix : '\\n';
	// label is always followed by capitalized sentence or sub-label
	let after = '[A-Z\\(]';
	let label = indexLabel[type](index);
	// label follows a prefix and precedes a space and capital letter
	let bullet = `${prefix} *${formatLabel(label)} +(?=${after})`;
	// non-greedily match any content
	let body = (index < last) ? '((\\n|.)+?)' : '((\\n|.)+)';
	// only match until next label (followed by capitalized word) or end of text
	let until = (index < last)
		? `(?=(\\n *${formatLabel(nextLabel[type](label))} +${after}|$))` : '';
	let pattern = `${bullet} *${body}${until}`;
	// nest optional next label match
	if (index < last) { pattern += itemPattern(type, firstPrefix, last, index + 1); }

	return (index > 0) ? '(' + pattern + ')?' : pattern;
}

function formatLabel(label) {
	return outline.options.format
		.replace('{0}', label)
		.replace(/([\(\)])/g, '\\$1')
}

const indexLabel = {
	[style.ALPHA_LOWER]: index => String.fromCharCode(index + 'a'.charCodeAt(0)),
	[style.ALPHA_UPPER]: this[style.ALPHA_LOWER],
	[style.NUMBER]: index => index + 1,
	[style.ROMAN_LOWER]: index => roman.from(index + 1).toLowerCase(),
	[style.ROMAN_UPPER]: index => roman.from(index + 1)
};

const nextLabel = {
	[style.ALPHA_LOWER]: label => String.fromCharCode(label.charCodeAt(0) + 1), 
	[style.ALPHA_UPPER]: this[style.ALPHA_LOWER],
	[style.NUMBER]: label => parseInt(label) + 1,
	[style.ROMAN_LOWER]: label => roman.increment(label).toLowerCase(),
	[style.ROMAN_UPPER]: label => roman.increment(label)
};

outline.indexLabel = indexLabel;
outline.nextLabel = nextLabel;
outline.formatLabel = formatLabel;
outline.itemPattern = itemPattern;

module.exports = outline;