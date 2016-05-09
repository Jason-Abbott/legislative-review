'use strict';

// parse haphazard section label placement

const roman = require('./roman-numeral');
const style = { ALPHA_LOWER: 0, ALPHA_UPPER: 1, NUMBER: 2, ROMAN_UPPER: 3, ROMAN_LOWER: 4 };
const capturesPerLabel = 4;
const patternCache = {};
const config = {
	format: '(%s)',
	afterLabel: '[A-Z\\("]',
	maxIndent: 3,
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
		for (let i = 1; i < capture.length; i += capturesPerLabel) {
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
	let styleID = config.indentStyle[indent];

	if (patternCache[styleID] === undefined) {
		 patternCache[styleID] = new RegExp(itemPattern(styleID, config.indentPrefix[indent]));
	}
	return patternCache[styleID];
}

function apply(text) {
	detect(text);
	return text.replace(pattern(), parse());
}

function detect(text) {
	const test = (text, styleID) => {
		let re = new RegExp(itemPattern(styleID, config.indentPrefix[0]));
		let match = re.exec(text);

		return {	re, styleID,
			index: (match != null) ? match.index : -1,
			count: (match != null) ? (match.indexOf(undefined) - 1) / capturesPerLabel : 0
		}
	};
	const update = (match, secondStyleID) => {
		patternCache[match.styleID] = match.re;
		config.indentStyle[0] = match.styleID;
		config.indentStyle[1] = secondStyleID;
	};
	let alphaLower = test(text, style.ALPHA_LOWER);
	let number = test(text, style.NUMBER);
	
	if (alphaLower.count == 0 && number.count == 0) {
		console.error('Unable to detect outline');
	} else if (number.count == 0) {
		update(alphaLower, style.NUMBER);
	} else if (alphaLower.count == 0) {
		update(number, style.ALPHA_LOWER);
	} else if (alphaLower.index < number.index && alphaLower.count > 1) {
		update(alphaLower, style.NUMBER);
	} else {
		update(number, style.ALPHA_LOWER);
	}
}

function itemPattern(styleID, firstPrefix = '\\n', last = 25, index = 0) {
	let prefix = (index == 0) ? firstPrefix : '\\n';
	let label = indexLabel[styleID](index);
	// label follows a prefix and precedes a space and capital letter
	let bullet = `${prefix} *${formatLabel(label)} +(?=${config.afterLabel})`;
	// non-greedily match any content
	let body = (index < last) ? '((\\n|.)+?)' : '((\\n|.)+)';
	// only match until next label (followed by capitalized word) or end of text
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

module.exports = { style, config, parse, pattern, apply, detect,
	indexLabel, nextLabel, formatLabel, itemPattern };