'use strict';

// parse haphazard outline label placement

//region Declarations
const roman = require('./roman-numeral');
const format = require('../format');
const style = { ALPHA_LOWER: 0, ALPHA_UPPER: 1, NUMBER: 2, ROMAN_UPPER: 3, ROMAN_LOWER: 4 };
// outline labels can be added or removed
const edited = { before: '(?:<(?:ins|del)>)?', after: '(?:<\\/(ins|del)>)?' };
const config = {
	format: '(%s)',
	// if outline labels repeat after some level of nesting
	repeat: { after: style.ROMAN_LOWER, format: '%s.', atIndent: 1000 },
	// whether to parse outline per <section>
	perSection: true,
	// expected numbering style at each indent level
	expectStyles: [ style.ALPHA_LOWER, style.NUMBER, style.ROMAN_LOWER ],
	beforeLabel: '\\n',
	beforeFirstLabel: '[\\n\\)>\\.]',
	afterLabel: '(?:<[^>]+>)?[A-Z\\("]',
	// number of items to generate a matching pattern for
	itemsPerLabel: 26
};
// label styles detected at each indent level
let indentStyle = [];
// regex patterns to match label styles
let pattern = {};
//endregion
//region Label formatting
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
//endregion
//region Build
const captures = {
	perLabel: 0,
	firstLabelAt: 0,
	// position of label status relative to item content
	labelStatus: 0,
	// position of outline content within capture array
	indexForLabel(count) { return this.firstLabelAt + ((count - 1) * this.perLabel);	},
	// calculate capture counts for label patterns
	calibrate() {
		// e.g. 'before. (a) One\n<del>(b)</del> Two\n(c) Three\n'
		let text = 'before. ';
		let styleID = config.expectStyles[0];
		let secondLabel = formatLabel(indexLabel[styleID](1), false, false);
		for (let i = 0; i < 3; i++) {
			// generate test content using first expected label style
			text += formatLabel(indexLabel[styleID](i), false, false) + ' ' + format.wordForNumber(i + 1) + '\n';
		}
		text = text.replace(/\n$/, '').replace(secondLabel, '<del>' + secondLabel + '</del>');

		let matches = text.match(new RegExp(itemPattern(styleID, false, 3)));
		let twoAt = matches.indexOf('Two');
		this.perLabel = matches.indexOf('Three') - twoAt;
		this.firstLabelAt = matches.indexOf('One');
		this.labelStatus = matches.lastIndexOf('del', twoAt) - twoAt;
	},
	// last content index after excluding optional captures that didn't match
	last(matches) {
		for (let i = matches.length - 1; i >= 0; i--) {
			if (matches[i] != undefined) { return i; }
		}
		return -1;
	},
	valid(matches) {
		return matches != null && (this.last(matches) / this.perLabel) > 1
	}
};

function build(text = null) {
	if (config.beforeFirstLabel === undefined || config.beforeFirstLabel === null) {
		config.beforeFirstLabel = config.beforeLabel;
	}
	captures.calibrate();

	if (config.repeat === undefined) { config.repeat = { after: -1, format: null, atIndent: 1000 }; }

	// build regex for all expected label styles
	config.expectStyles.forEach(s => pattern[s] = new RegExp(itemPattern(s)));

	if (text != null) {
		// deduce outline order from text
		let matches = config.expectStyles
		// execute each expected label pattern against the text
			.map(s => Object.assign({ match: pattern[s].exec(text), styleID: s }))
			// remove those that didn't match at least two labels	
			.filter(o => captures.valid(o.match))
			// outline structure defined by order in which label styles are found
			.sort((o1, o2) => (o1.match.index < o2.match.index) ? -1 : 1);

		indentStyle = matches.map(o => o.styleID);

		if (indentStyle[indentStyle.length - 1] == config.repeat.after) {
			// assume outline repeated for deeper nesting follows same label order
			let styleID = indentStyle[0];
			let re = new RegExp(itemPattern(styleID, true));
			let match = re.exec(text);
			if (captures.valid(match)) {
				config.repeat.atIndent = indentStyle.length;
				indentStyle.push(styleID);
				pattern[styleID + 'repeat'] = re;
			}
		} else {
			config.repeat.indent = 0;
		}
	} else {
		indentStyle = config.expectStyles;
	}
}
//endregion

function parse(indent = 0) {
	return (match, ...capture) => {
		// adjust .replace() captures to match re.exec() result
		capture.unshift(capture.pop()); capture.pop();
		let text = capture[1] + '<ol style="list-style-type: ' + css[indentStyle[indent]] + ';"' +
			(indent >= config.repeat.atIndent ? ' class="repeat"' : '') + '>';
		let last = captures.last(capture);
		let nextStyleID = indentStyle[indent + 1];
		
		if (indent + 1 >= config.repeat.atIndent) { nextStyleID += 'repeat'; }

		for (let i = captures.firstLabelAt; i <= last; i += captures.perLabel) {
			let css = '';

			if (i > Math.abs(captures.labelStatus)) {
				switch (capture[i + captures.labelStatus]) {
					case 'del': css = ' class="deleted"'; break;
					case 'ins': css = ' class="inserted"'; break;
				}
			}

			text += '<li' + css + '>' + ((indent >= indentStyle.length - 1)
				? capture[i]
				: capture[i].replace(pattern[nextStyleID], parse(indent + 1))) + '</li>';
		}
		return text + '</ol>';
	}
}

function apply(text) {
	build(text);
	const re = pattern[indentStyle[0]];
	const section = /<section>/g;

	if (config.perSection && section.test(text)) {
		// parse one section at a time
		return text.split(section).map(s => s.replace(re, parse())).join('<section>');
	} else {
		// parse the whole document
		return text.replace(re, parse());
	}
}

function itemPattern(styleID, repeating = false, last = config.itemsPerLabel - 1, index = 0) {
	let prefix = (index == 0) ? '(' + config.beforeFirstLabel + '|^)' : config.beforeLabel;
	let label = indexLabel[styleID](index);
	// label follows a prefix pattern and precedes another pattern and may be inserted or deleted
	let bullet = prefix + ' *' +
		edited.before + formatLabel(label, repeating) + edited.after +
		' +(?=' + config.afterLabel + ')';
	// non-greedily match content unless at end
	let body = (index < last) ? '((?:\\n|.)+?)' : '((?:\\n|.)+)';
	// only match until next label, end of section or end of text
	let until = (index < last)	? '(?=(' + config.beforeLabel + ' *' +
		edited.before + formatLabel(nextLabel[styleID](label), repeating) + edited.after +
		'|<\\/section>|$))' : '';
	let pattern = `${bullet} *${body}${until}`;
	// nest optional next label match
	if (index < last) { pattern += itemPattern(styleID, repeating, last, index + 1); }

	return (index > 0) ? '(?:' + pattern + ')?' : pattern;
}

function formatLabel(label, repeating = false, forRegEx = true) {
	let f = repeating ? config.repeat.format : config.format;
	let l = f.replace('%s', label);
	return forRegEx ? l.replace(/([\(\)\.])/g, '\\$1') : l;
}

module.exports = {
	pattern(index = 0) { return pattern[indentStyle[index]]; },
	style,
	config,
	parse,
	apply,
	build,
	captures,
	indexLabel,
	nextLabel,
	formatLabel,
	itemPattern
};