'use strict';

const pages = [];
const convert = {
	// pdf2json units seem to be quarter inches (18 points)
	inches(x) { return x / 4; },
	centimeters(x) { return x; /* not implemented */ }
};
const layout = {
	bottom: { vary: 0.1 },
	lineHeight: { at: 0.25 },
	indent: { at: 0.5, vary: 0.15 },
	lineNumber:  { at: 0.75, vary: 0.15 },
	leftMargin: { at: 1, vary: 0.15 }
};
const re = {
	bullet: /\((\d|[a-z]|[ivx]{1,3})\)/,
	first: /\([1ia]\)/
};

let unit = convert.inches;

module.exports = function(pdf) {
	let indent = 0;
	// last sequence character for each indent level
	let sequence = [];
	// indents
	// numbers , text 4.267, (+1.74) first 6.01, (+2.18) second 8.19
	let expect = setExpectation(indent, sequence);
	let before = { bottom: 0, words: [] };
	let pages = pdf.formImage.Pages
		.map(p => p.Texts
			.map(normalize)
			// combine text elements into lines
			.reduce((lines, t) => {
				// find line at same vertical position
				let line = lines.find(l =>
					l.bottom >= t.bottom - layout.bottom.vary &&
					l.bottom <= t.bottom + layout.bottom.vary);

				if (line === undefined) {
					line = lineFromText(t);
					lines.push(line);
				} else if (t.right > line.right) {
					line.right = t.right;
				}

				if (t.left < line.left &&
					t.left < (layout.lineNumber.at + layout.lineNumber.vary) &&
					/\d+/.test(t.text)) {
					// sometimes the digits of a number are broken into separate "words"
					if (line.number > 0) { t.text = line.number + '' + t.text; }
					line.number = parseInt(t.text);
				} else {
					line.words.push(t.text);
					if (t.left < line.left) { line.left = t.left; }
				}
				//lines.sort((l1, l2) => l1.number - l2.number);
				return lines;
			},	[])
			// remove un-numbered lines
			.filter(l => l.number > 0)
		)
		// combine page lines
		.reduce((lines, p) => lines.concat(p), [])
		// format lines
		.map(l => {
			if (l.bottom - before.bottom > layout.lineHeight.at) {
				// new paragraph
				l.words.unshift('<p>');
				before.words.push('</p>');
			}

			if (re.bullet.test(l.words[0])) {
				let tag = '<li>';
				if (re.first.test(l.words[0])) {
					tag = '<ol>' + tag;
					indent++;
				}
				l.words[0] = tag;
			}

			let bulletIndex = l.words.indexOf(expect);
			if (bulletIndex >= 0) {

			}
			before = l;

			return l;
		});
	let x = pages;
};

function indentLevel(line) {
	//let x = line.left -  / 2
}

// create new line from text element
function lineFromText(text) {
	return {
		bottom: text.bottom,
		left: text.left,
		right: text.right,
		words: [],
		number: 0,
		indent: 0
	};
}

function setExpectation(indent, sequence) {
	if (indent == 0) {
		return '(a)';
	} else {
		return '(a)';
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

function normalize(t) {
	return {
		left: unit(t.x),
		bottom: unit(t.y),
		right: unit(t.x) + unit(t.w),
		text: (t.R[0].T)
			.replace('%2C', ',')
			.replace('%3A', ':')
			.replace('%3B', ';')
			.replace('%24', '$')
	}
}