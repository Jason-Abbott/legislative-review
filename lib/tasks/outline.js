'use strict';

// parse haphazard section label placement

const roman = require('./roman-numeral');
const style = { ALPHA_LOWER: 0, ALPHA_UPPER: 1, NUMBER: 2, ROMAN_UPPER: 3, ROMAN_LOWER: 4 };
const patternCache = [];
const config = {
	format: '(%s)',
	afterLabel: '[A-Z\\(]',
	maxIndent: 3,
	defaultStyle: style.NUMBER,
	// numbering style at each indent level
	indentStyle: [ style.ALPHA_LOWER, style.NUMBER, style.ROMAN_LOWER ],
	// pattern preceding first label at each indent level (may differ from subsequent labels)
	indentPrefix: [ '(\\n|\\.|^)', '(\\n|\\)|^)', '(\\n|\\)|^)' ]
};

function parse(indent = 0) {
	return (match, ...capture) => {
		let [fullText, index] = [capture.pop(), capture.pop()];
		let text = capture[0] + '<ol>';

		// four regex captures per label
		for (let i = 1; i < capture.length; i += 4) {
			if (capture[i] === undefined) {
				break;
			} else if (indent >= config.maxIndent - 1) {
				text += '<li>' + capture[i] + '</li>';
			} else {
				text += '<li>' + capture[i].replace(pattern(indent + 1), parse(indent + 1)) + '</li>';
			}
		}
		return text + '</ol>';
	}
}

function pattern(indent = 0) {
	if (patternCache.length === 0) {
		// build pattern for each indent level
		for (let i = 0; i < config.maxIndent; i++) {
			let s = (config.indentStyle.length > i) ? config.indentStyle[i] : config.defaultStyle;
			patternCache.push(new RegExp(itemPattern(s, config.indentPrefix[i])));
		}
	}
	return patternCache[indent];
}

function itemPattern(type, firstPrefix = '\\n', last = 25, index = 0) {
	let prefix = (index == 0) ? firstPrefix : '\\n';
	let label = indexLabel[type](index);
	// label follows a prefix and precedes a space and capital letter
	let bullet = `${prefix} *${formatLabel(label)} +(?=${config.afterLabel})`;
	// non-greedily match any content
	let body = (index < last) ? '((\\n|.)+?)' : '((\\n|.)+)';
	// only match until next label (followed by capitalized word) or end of text
	let until = (index < last)
		? `(?=(\\n *${formatLabel(nextLabel[type](label))} +${config.afterLabel}|$))` : '';
	let pattern = `${bullet} *${body}${until}`;
	// nest optional next label match
	if (index < last) { pattern += itemPattern(type, firstPrefix, last, index + 1); }

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

module.exports = { style, config, parse, pattern, indexLabel, nextLabel, formatLabel, itemPattern };