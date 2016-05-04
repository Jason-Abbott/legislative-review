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
	get pattern() { return sequence[this.options.numbering[0]](); },
	
	parse(match, p1, offset, text) {
		//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
		// (\n|\.) *\(a\) *((\n|.)+)(?=\n *\(b\))(\n *\(b\) *((\n|.)+)(?=(\n *\(c\)|$)))?(\n *\(c\) *((\n|.)+)(?=(\n *\(d\)|$)))?
	}
};

const sequence = {
	[style.ALPHA_LOWER]: ()=> {
		let start = 'b'.charCodeAt(0);
		let pattern = bulletItem('a', style.ALPHA_LOWER, false, '(\\n|\.)');

		for (let a = start; a <= start + 25; a++) {
			pattern += bulletItem(String.fromCharCode(a), style.ALPHA_LOWER)
		}
		return pattern;
	},
	[style.NUMBER]: ()=> {

	},
	[style.ROMAN_LOWER]: ()=> {

	}
};


function bulletItem(label, type, optional = true, before = '\\n') {
	let bullet = `${before} *${stylizeLabel(label)}`;
	// non-greedily match anything
	let body = '((\\n|.)+?)';
	// only match until next label or end of file
	let until = ((type == style.ALPHA_LOWER && label == 'z')
		|| (type == style.ALPHA_UPPER && label == 'Z')) ? ''
		: `(?=(\\n *${stylizeLabel(nextLabel(label, type))}|$))`;
	let pattern = `${bullet} *${body}${until}`;
	return (optional) ? '(' + pattern + ')?' : pattern;
}

function stylizeLabel(letter) {
	return outline.options.label.style
		.replace('{0}', letter)
		.replace(/([\(\)])/g, '\\$1')
}

function nextLabel(label, type) {
	switch(type) {
		case style.ALPHA_LOWER:
		case style.ALPHA_UPPER:	return String.fromCharCode(label.charCodeAt(0) + 1);
		case style.NUMBER: return parseInt(label) + 1;
		case style.ROMAN_LOWER: return roman.increment(label).toLowerCase();
		case style.ROMAN_UPPER: return roman.increment(label);
		default:
			console.error('Unable to increment ' + label + ' for style ' + type);
			return label;
	}
}

outline.nextLabel = nextLabel;
outline.stylizeLabel = stylizeLabel;
outline.bulletItem = bulletItem;

module.exports = outline;