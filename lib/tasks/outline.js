'use strict';

// parse haphazard section label placement

const roman = require('./roman-numeral');
const style = { ALPHA_LOWER: 0, ALPHA_UPPER: 1, NUMBER: 2, ROMAN_UPPER: 3, ROMAN_LOWER: 4 };
const capturesPerLabel = 4;
const config = {
	format: '(%s)',
	afterLabel: '[A-Z\\("]',
	// expected numbering style at each indent level
	expectStyles: [ style.ALPHA_LOWER, style.NUMBER, style.ROMAN_LOWER ],
	// pattern preceding first label at each indent level (may differ from subsequent labels)
	indentPrefix: [ '(\\n|\\.|^)', '(\\n|\\)|^)', '(\\n|\\)|^)' ]
};
// label styles detected at each indent level
let indentStyles = [];
// regex patterns to match labels at each indent level
let pattern = [];

function parse(indent = 0) {
	return (match, ...capture) => {
		let text = capture[0] + '<ol style="list-style-type: ' + css[indentStyles[indent]] + ';">';
		let last = capture.indexOf(undefined);

		for (let i = 1; i < last; i += capturesPerLabel) {
			text += '<li>' + ((indent >= indentStyles.length - 1)
					? capture[i]
					: capture[i].replace(pattern[indent + 1], parse(indent + 1))) + '</li>';
		}
		return text + '</ol>';
	}
}

function apply(text) { build(text); return text.replace(pattern[0], parse()); }

function build(text = null) {
	if (text != null) {
		// deduce outline structure from text
		let matches = config.expectStyles
			.map(s => ({re: new RegExp(itemPattern(s, config.indentPrefix[0])), styleID: s}))
			.map(o => Object.assign({match: o.re.exec(text)}, o))
			.filter(o => o.match != null)
			// label count from pattern captures
			.map(o => Object.assign({count: o.match.indexOf(undefined) - 1 / capturesPerLabel}, o))
			// remove single label match since that's not an outline
			.filter(o => o.count > 1)
			// outline structure defined by order in which styles are found
			.sort((o1, o2) => (o1.match.index < o2.match.index) ? -1 : 1);

		indentStyles = matches.map(o => o.styleID);
	} else {
		indentStyles = config.expectStyles;
	}
	pattern = indentStyles.map((s, i) => new RegExp(itemPattern(s, config.indentPrefix[i])));
}

// regular expression pattern for outline label style
function itemPattern(styleID, firstPrefix = '\\n', last = 25, index = 0) {
	let prefix = (index == 0) ? firstPrefix : '\\n';
	let label = indexLabel[styleID](index);
	// label follows a prefix pattern and precedes another pattern
	let bullet = `${prefix} *${formatLabel(label)} +(?=${config.afterLabel})`;
	// non-greedily match any content
	let body = (index < last) ? '((\\n|.)+?)' : '((\\n|.)+)';
	// only match until next label or end of text
	let until = (index < last)
		? `(?=(\\n *${formatLabel(nextLabel[styleID](label))} +${config.afterLabel}|$))` : '';
	let pattern = `${bullet} *${body}${until}`;
	// nest optional next label match
	if (index < last) { pattern += itemPattern(styleID, firstPrefix, last, index + 1); }

	return (index > 0) ? '(' + pattern + ')?' : pattern;
}

function formatLabel(label) {
	return config.format
		.replace('%s', label)
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

const css = {
	[style.ALPHA_LOWER]: 'lower-alpha',
	[style.ALPHA_UPPER]: 'upper-alpha',
	[style.NUMBER]: 'decimal',
	[style.ROMAN_LOWER]: 'lower-roman',
	[style.ROMAN_UPPER]: 'upper-roman'
};

module.exports = {
	pattern(index = 0) { return pattern[index]; },
	style, config, parse, apply, build,
	indexLabel, nextLabel, formatLabel, itemPattern };