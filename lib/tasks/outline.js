'use strict';

// parse haphazard outline label placement

//region Declarations
const roman = require('./roman-numeral');
const format = require('../format');
const style = { ALPHA_LOWER: 0, ALPHA_UPPER: 1, NUMBER: 2, ROMAN_UPPER: 3, ROMAN_LOWER: 4 };
// outline labels can be added, removed or changed
const edited = { before: '(?:<(?:ins|del|dfn)>)?', after: '(?:<\\/(ins|del|dfn)>)?' };
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
	afterLabel: '(?:<[^>]+>)?[A-Z\\("]'
};
const label = {
	[style.ALPHA_LOWER]: {
		after: l => String.fromCharCode(l.charCodeAt(0) + 1),
		at: index => String.fromCharCode(index + 'a'.charCodeAt(0)),
		css: 'lower-alpha',
		count: 26,
		re: null,
		nestedRegEx: null
	},
	[style.ALPHA_UPPER]: {
		after: l => String.fromCharCode(l.charCodeAt(0) + 1),
		at: index => String.fromCharCode(index + 'a'.charCodeAt(0)),
		css: 'upper-alpha',
		count: 26,
		re: null,
		nestedRegEx: null
	},
	[style.NUMBER]: {
		after: l => parseInt(l) + 1,
		at: index => index + 1,
		css: 'decimal',
		count: 52,
		re: null,
		nestedRegEx: null
	},
	[style.ROMAN_LOWER]: {
		after: l => roman.increment(l).toLowerCase(),
		at: index => roman.from(index + 1).toLowerCase(),
		css: 'lower-roman',
		count: 15,
		re: null
	},
	[style.ROMAN_UPPER]: {
		after: l => roman.increment(l),
		at: index => roman.from(index + 1),
		css: 'upper-roman',
		count: 15,
		re: null
	}
};
// label styles detected at each indent level
let indentStyle = [];

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
		let secondLabel = formatLabel(label[styleID].at(1), false, false);
		for (let i = 0; i < 3; i++) {
			// generate test content using first expected label style
			text += formatLabel(label[styleID].at(i), false, false) + ' ' + format.wordForNumber(i + 1) + '\n';
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

// labels containing both inserted and deleted text will not match the label sequence
function normalizeLabels(text) {
	const any = '[\\w\\d]';
	const l = `(${any}*)<del>${any}+<\\/del>(${any}*)<ins>(${any}+)<\\/ins>`;
	const pattern = '(' + config.beforeLabel + ')' +
		formatLabel('ph').replace('ph', l) + '(?= +' + config.afterLabel + ')';
	return text.replace(new RegExp(pattern, 'g'), '$1<dfn>($2$3$4)</dfn>');
}

function build(text = null) {
	let clean = null;
	
	if (config.beforeFirstLabel === undefined || config.beforeFirstLabel === null) {
		config.beforeFirstLabel = config.beforeLabel;
	}
	captures.calibrate();

	if (config.repeat === undefined) { config.repeat = { after: -1, format: null, atIndent: 1000 }; }

	// build regex for all expected label styles
	config.expectStyles.forEach(s => label[s].re = new RegExp(itemPattern(s)));

	if (text != null) {
		// deduce outline order from text
		clean = normalizeLabels(text);
		let matches = config.expectStyles
			// execute each expected label pattern against the text
			.map(s => Object.assign({ match: label[s].re.exec(clean), styleID: s }))
			// remove those that didn't match at least two labels	
			.filter(o => captures.valid(o.match))
			// outline structure defined by order in which label styles are found
			.sort((o1, o2) => (o1.match.index < o2.match.index) ? -1 : 1);

		indentStyle = matches.map(o => o.styleID);

		// test for nested outlines if allowed after last found outline style
		if (indentStyle[indentStyle.length - 1] == config.repeat.after) {
			// assume outline repeated for deeper nesting follows same label order
			let styleID = indentStyle[0];
			let re = new RegExp(itemPattern(styleID, true));
			let match = re.exec(clean);
			if (captures.valid(match)) {
				config.repeat.atIndent = indentStyle.length;
				indentStyle.push(styleID);
				label[styleID].nestedRegEx = re;
			}
		} else {
			config.repeat.indent = 0;
		}
	} else {
		indentStyle = config.expectStyles;
	}
	return clean;
}
//endregion

function parse(indent = 0) {
	return (match, ...capture) => {
		// adjust .replace() captures to match re.exec() result
		capture.unshift(capture.pop()); capture.pop();
		const last = captures.last(capture);
		let text = capture[1] + '<ol style="list-style-type: ' + label[indentStyle[indent]].css + ';"' +
			(indent >= config.repeat.atIndent ? ' class="repeat"' : '') + '>';
		let nextRegEx = null;
		
		if (indent < indentStyle.length - 1) {
			const nextLabel = label[indentStyle[indent + 1]];
			nextRegEx = (indent + 1 >= config.repeat.atIndent) ? nextLabel.nestedRegEx : nextLabel.re;
		}
		
		for (let i = captures.firstLabelAt; i <= last; i += captures.perLabel) {
			let css = '';

			if (i > Math.abs(captures.labelStatus)) {
				switch (capture[i + captures.labelStatus]) {
					case 'del': css = ' class="deleted"'; break;
					case 'ins': css = ' class="inserted"'; break;
					case 'dfn': css = ' class="changed"'; break;
				}
			}

			text += '<li' + css + '>' + ((indent >= indentStyle.length - 1)
				? capture[i]
				: capture[i].replace(nextRegEx, parse(indent + 1))) + '</li>';
		}
		return text + '</ol>';
	}
}

function apply(text) {
	const clean = build(text);
	
	if (indentStyle.length > 0) {
		const re = label[indentStyle[0]].re;
		const section = /<section>/g;

		if (config.perSection && section.test(clean)) {
			// parse one section at a time
			return clean.split(section).map(s => s.replace(re, parse())).join('<section>');
		} else {
			// parse the whole document
			return clean.replace(re, parse());
		}
	} else {
		// text has no outline
		return text;
	}
}

function itemPattern(styleID, nested = false, last = label[styleID].count, index = 0) {
	let prefix = (index == 0) ? '(' + config.beforeFirstLabel + '|^)' : config.beforeLabel;
	let name = label[styleID].at(index);
	// label follows a prefix pattern and precedes another pattern and may be inserted or deleted
	let bullet = prefix + ' *' +
		edited.before + formatLabel(name, nested) + edited.after +
		' +(?=' + config.afterLabel + ')';
	// non-greedily match content unless at end
	let body = (index < last) ? '((?:\\n|.)+?)' : '((?:\\n|.)+)';
	// only match until next label, end of section or end of text
	let until = (index < last)	? '(?=(' + config.beforeLabel + ' *' +
		edited.before + formatLabel(label[styleID].after(name), nested) + edited.after +
		'|<\\/section>|$))' : '';
	let pattern = `${bullet} *${body}${until}`;
	// nest optional next label match
	if (index < last) { pattern += itemPattern(styleID, nested, last, index + 1); }

	return (index > 0) ? '(?:' + pattern + ')?' : pattern;
}

function formatLabel(name, nested = false, forRegEx = true) {
	let f = nested ? config.repeat.format : config.format;
	let l = f.replace('%s', name);
	return forRegEx ? l.replace(/([\(\)\.])/g, '\\$1') : l;
}

module.exports = {
	pattern(index = 0) { return label[indentStyle[index]].re; },
	style,
	config,
	parse,
	apply,
	build,
	captures,
	label,
	formatLabel,
	itemPattern,
	normalizeLabels
};