'use strict';

// parse haphazard section label placement
// separate module simplifies testing

const roman = require('./roman-numeral');
const style = { ALPHA_LOWER: 0, ALPHA_UPPER: 1, NUMBER: 2, ROMAN_UPPER: 3, ROMAN_LOWER: 4 };
// public members
const outline = {
	style: style,
	options: {
		label: {
			style: '({0})',
			pattern: /^\((\d|[a-z]|[ivx]{1,3})\)$/,
			formatting: /[^0-9a-z]/g,
			embedMustFollow: /\.$/,
			embeddable: /\(a\)/
		},
		// numbering style at each indent level
		numbering: [ style.ALPHA_LOWER, style.NUMBER, style.ROMAN_LOWER ]
	},
	get pattern() {
		return bulletItem(this.options.numbering[0], '(\\n|\\.)');
	},
	
	parse(match, p1, offset, text) {
		//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
		// (\n|\.) *\(a\) *((\n|.)+)(?=\n *\(b\))(\n *\(b\) *((\n|.)+)(?=(\n *\(c\)|$)))?(\n *\(c\) *((\n|.)+)(?=(\n *\(d\)|$)))?
	}
};

function bulletItem(type, firstPrefix = '\\n', last = 25, index = 0) {
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
	if (index < last) { pattern += bulletItem(type, firstPrefix, last, index + 1); }

	return (index > 0) ? '(' + pattern + ')?' : pattern;
}

function formatLabel(label) {
	return outline.options.label.style
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
outline.stylizeLabel = formatLabel;
outline.bulletItem = bulletItem;

module.exports = outline;