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
	list: {
		labelStyle: '(x)',
		labelPattern: /^\((\d|[a-z]|[ivx]{1,3})\)$/,
		labelTab: 0.1,
		numbering: [ sequence.ALPHA_LOWER, sequence.NUMBER, sequence.ROMAN_NUMERAL ]
	}
};

// const re = {
// 	firstItem: /\([1ia]\)/,
// 	// return new instance to avoid lastIndex shenanigans
// 	get nonItem() { return /[^0-9a-z]/g; }
// };

module.exports = function(pdf) {
	let indent = 0;
	// next list item label to expect at each indent level
	let nextItemLabel =
		layout.list.numbering.map(style =>
		layout.list.labelStyle.replace('x', ()=> {
			switch(style) {
				case sequence.ALPHA_LOWER: return 'a';
				case sequence.NUMBER: return '1';
				case sequence.ROMAN_NUMERAL: return 'i'
			}
		}));
	let previousLine = { bottom: 0, words: [] };
	let numberEdge = layout.lineNumber.at + layout.lineNumber.vary;
	// calculate unit conversion factor from known page size
	let unit = convert(pdf.formImage.Width / layout.width);
	// unlike position, width seems to be measured in points
	let points = convert(72);

	return pdf.formImage.Pages
		.map(p => p.Texts
			// standardize text elements
			.map(t => ({
				left: unit(t.x),
				bottom: unit(t.y),
				right: unit(t.x) + points(t.w),
				text: (t.R[0].T)
					.replace('%2C', ',')
					.replace('%3A', ':')
					.replace('%3B', ';')
					.replace('%24', '$')
			}))
			// combine text elements into lines
			.reduce((lines, t) => {
				let line = lines.find(l =>
					// find line matching vertical position
					l.bottom >= t.bottom - layout.bottom.vary &&
					l.bottom <= t.bottom + layout.bottom.vary);

				if (line === undefined) {
					 line = {
						bottom: t.bottom,
						left: t.left,
						words: [],
						listLabelAt: [],
						firstWordSpace: 0,
						numbered: false
					};
					lines.push(line);
				}

				if (t.left < numberEdge && /^\d+$/.test(t.text)) {
					line.numbered = true;
				} else {
					line.words.push(t.text);
					// first word space helps identify labels
					if (line.words.length == 1) {
						line.firstWordSpace = t.right;
					} else if (line.words.length == 2) {
						line.firstWordSpace = t.left - line.firstWordSpace;
					}
					if (layout.list.labelPattern.test(t.text)) {
						line.listLabelAt.push(line.words.length - 1);
					}
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
			if (l.listLabelAt.length > 0) {
				let pos = l.listLabelAt[0];
				if (nextItemLabel[indent] == l.words[pos]) {
					if ((pos == 0 && l.firstWordSpace >= layout.list.labelTab) ||
						 (pos > 0 && l.words[pos - 1] == '.')) {

					}
				}
			}
			
			if (re.listItem.test(l.words[0])) {
				if (nextItemLabel[indent] == l.words[0]) {
					
				}
				
				let i = inferIndent(l);
				let tag = '<li>';
				nextItemLabel[0] = inferNextItemLabel(i, l.words[0]);

				if (re.firstItem.test(l.words[0])) {
					tag = '<ol>' + tag;
					indent++;
				} else if (i == indent) {
					// subsequent list item at current indent level
					previousLine.words.push('</li>');
				}
				// replace list item label
				l.words[0] = tag;
			}

			if (l.bottom - before.bottom > layout.lineHeight.at) {
				// new paragraph
				l.words.unshift('<p>');
				previousLine.words.push('</p>');
			}

			previousLine = l;
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

	switch(layout.list.numbering[indent]) {
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