'use strict';

// curried method to convert PDF units to standard layout units (e.g. in, cm)
const convert = factor => value => value / factor;
const sequence = { ALPHA_LOWER: 0, ALPHA_UPPER: 1, NUMBER: 2, ROMAN_NUMERAL: 3 };

// future configurable
const layout = {
	height: 11,
	width: 8.5,
	// vertical deviation allowed for text considered to be on the same line
	bottom: { vary: 0.1 },
	lineHeight: { at: 0.25 },
	indent: { at: 0.4, vary: 0.2 },
	lineNumber:  { at: 0.75, vary: 0.15 },
	leftMargin: { at: 1, vary: 0.15 },
	numbering: [ sequence.ALPHA_LOWER, sequence.NUMBER, sequence.ROMAN_NUMERAL ]
};

const re = {
	listItem: /\((\d|[a-z]|[ivx]{1,3})\)/,
	firstItem: /\([1ia]\)/,
	// return new instance to avoid lastIndex shenanigans
	get nonItem() { return /[^0-9a-z]/g; }
};

module.exports = function(pdf) {
	let indent = 0;
	// last sequence character for each indent level
	let nextItemLabel = [];
	let before = { bottom: 0, words: [] };
	// calculate unit conversion factor from known page size
	let unit = convert(pdf.formImage.Width / layout.width);

	return pdf.formImage.Pages
		.map(p => p.Texts
			// standardize text elements
			.map(t => ({
				left: unit(t.x),
				bottom: unit(t.y),
				right: unit(t.x) + unit(t.w),
				text: (t.R[0].T)
					.replace('%2C', ',')
					.replace('%3A', ':')
					.replace('%3B', ';')
					.replace('%24', '$')
			}))
			// combine text elements into lines
			.reduce((lines, t) => {
				let line = lines.find(l =>
					// find line at same vertical position
					l.bottom >= t.bottom - layout.bottom.vary &&
					l.bottom <= t.bottom + layout.bottom.vary);

				if (line === undefined) {
					line = lineFromText(t);
					lines.push(line);
				} else if (t.right > line.right && t.right < layout.width) {
					line.right = t.right;
				}

				if (t.left < layout.lineNumber.at + layout.lineNumber.vary && /\d/.test(t.left)) {
					line.numbered = true;
				} else {
					line.words.push(t.text);
					if (t.left < line.left) { line.left = t.left; }
				}
				return lines;
			},	[])
			// remove un-numbered lines
			.filter(l => l.numbered)
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
			
			if (re.listItem.test(l.words[0])) {
				let i = inferIndent(l);
				let tag = '<li>';
				nextItemLabel[0] = inferNextItemLabel(i, l.words[0]);

				if (re.firstItem.test(l.words[0])) {
					tag = '<ol>' + tag;
					indent++;
				} else if (i == indent) {
					// subsequent list item at current indent level
					before.words.push('</li>');
				}
				// replace list item label
				l.words[0] = tag;
			}
			
			before = l;
			return l;
		});
};


// indent count to calculate number of nested lists
function inferIndent(line) {
	let left = layout.leftMargin.at;
	let middle = Math.floor(layout.width / 2);

	for (let i = 0, j = left; j < middle; i++, j += layout.indent.at) {
		if (line.left <= j + layout.indent.vary &&
			 line.left >= j - layout.indent.vary) { return i; }
	}
	return 0;
}

function inferNextItemLabel(indent, label) {
	let bare = label.replace(re.nonItem, '');
	let next = '';

	switch(layout.numbering[indent]) {
		case sequence.ALPHA_LOWER: next = String.fromCharCode(bare.charCodeAt(0) + 1); break;
		case sequence.NUMBER: next = parseInt(bare) + 1; break;
		case sequence.ROMAN_NUMERAL: next = nextRomanNumeral(bare); break;
	}
	return label.replace(bare, next);
}

function nextRomanNumeral(n) {
	switch (n) {
		case 'i': return 'ii';
		case 'ii': return 'iii';
		case 'iii': return 'iv';
		case 'iv': return 'v';
		case 'v': return 'vi';
		case 'vi': return 'vii';
		case 'vii': return 'viii';
		case 'viii': return 'ix';
		case 'ix': return 'x';
	}
	console.error('Unable to get list item label after ' + n);
	return '';
}

// create new line from text element
function lineFromText(text) {
	return {
		bottom: text.bottom,
		left: text.left,
		// aberrant text elements extend off page
		right: (text.right < layout.right) ? text.right : 0,
		words: [],
		firstWordSpace: 0,
		numbered: false,
		indent: 0
	};
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