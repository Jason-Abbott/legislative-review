'use strict';

// use pdf2json to convert PDF document to HTML

// curried method to convert PDF units to standard layout units (e.g. in, cm)
const convert = factor => value => value / factor;
const section = require('./bill-section');

// future configurable
const layout = {
	height: 11,
	width: 8.5,
	leftMargin: 1,
	tab: { size: 0.4, tolerance: 0.2 },
	line: {
		// vertical deviation allowed for text considered to be on the same line
		tolerance: 0.1,
		height: 0.25,
		numberMargin: 0.85,
		rightMargin: 7.2
	}
};

module.exports = function(pdf) {
	let previousLine = { bottom: 0, words: [] };
	// calculate unit conversion factor from known page size
	let unit = convert(pdf.formImage.Width / layout.width);
	// unlike position, width is measured in points
	let points = convert(72);
	
	return pdf.formImage.Pages
		.map(p => p.Texts
			// standardize text elements
			.map(el => ({
				left: unit(el.x),
				bottom: unit(el.y),
				right: unit(el.x) + points(el.w),
				text: (el.R[0].T)
					.replace(/%2C/g, ',')
					.replace(/%20/g, ' ')
					.replace(/%3A/g, ':')
					.replace(/%3B/g, ';')
					.replace(/%24/g, '$')
			}))
			// combine text elements into lines
			.reduce((lines, el) => {
				let line = lines.find(l =>
					// find line matching vertical position
					l.bottom >= el.bottom - layout.line.tolerance &&
					l.bottom <= el.bottom + layout.line.tolerance);

				if (line === undefined) {
					 line = {
						bottom: el.bottom,
						right: el.right,
						words: [],
						numbered: false
					};
					lines.push(line);
				}

				if (el.left < layout.line.numberMargin && /^\d+$/.test(el.text)) {
					line.numbered = true;
				} else {
					if (el.right > line.right) { line.right = el.right; }
					// don't push line number into the word list
					line.words.push(el.text);
				}
				return lines;
			},	[])
			// remove un-numbered lines
			.filter(l => l.numbered)
		)
		// combine page lines into one line array
		.reduce((lines, p) => lines.concat(p), [])
		// add line breaks
		.map(line => {
			if (line.bottom - previousLine.bottom > layout.line.height) {
				// double-space above
				line.words.unshift('\n');
			}
			// assume lines that reach right margin are wrapped
			if (line.right < layout.line.rightMargin) { line.words.push('\n'); }
			previousLine = line;
			return line;
		})
		// combine words
		.reduce((text, line) => text + ' ' + line.words.join(' '), '')
		// now we're down to a string
		.replace(/ *\n */g, '\n')
		// space before comma
		.replace(/ +,/g, ',')
		// hyphenated word
		//.replace(/ *\-\n *(\w)/g, '$1')
		// simple hyphens
		.replace(/ +\- +/g, '-')
		// em-dash
		.replace(/ *\-\- */g, ' &mdash; ')
		// paragraphs
		.replace(/\n{2}/g, '</p><p>')
		.replace(/^/, '<div><p>')
		.replace(/$/, '</p></div>')
		.replace(/<div><p>\n?AN ACT/, '<div>AN ACT<p class="summary">')	
		// outer list
		.replace(/(\n|\.) *\([a-z]\) */g, (match, p1, offset, text) => {
			//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
			// (\n|. *)\(a\)((.|\n)+)\n\(b\)((.|\n)+)\n\(c\)((.|\n)+)(\n\(d\))?
			// (\n *\(b\) *((.|\n)+))
			//(\n|\.) *\(a\) *((\n|.)+)(?=\n *\(b\))(\n *\(b\) *((\n|.)+)(?=\n *\(c\)))?(\n *\(c\) *((\n|.)+)(?=\n *\(d\)))?
			let x = p1;
		})
		// other list items
		.replace(/\n\([b-z2-9]\) */g, '</li><li>')
		// final cleanup
		.replace(/\n/g, ' ').replace(/\s+/, ' ');
};

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