'use strict';

const lines = [];
const range = {
	baseLine: 0.25,
	lineHeight: 1,
	indent: { min: 5.5, max: 6.5 },
	lineNumber: { min: 2.2, max: 2.75 },
	leftMargin: { min: 4.0, max: 4.5 }
};

module.exports = function(pdf) {
	return pdf.formImage.Pages.map(p => {
		let underline = false;
		let strike = false;

		p.Texts.forEach(t => {
			let line = lineForText(t);
			let text = decode(t.R[0].T);
			
			if (t.x < line.left && t.x < range.lineNumber.max && /\d+/.test(text)) {
				// sometimes the digits of a number are broken into separate "words"
				if (line.number > 0) { text = line.number + '' + text; }
				line.number = parseInt(text);
			} else {
				line.words.push(text);
				if (t.x < line.left) { line.left = t.x; }
			}
		});

		let rows = lines.filter(l => l.number > 0);

		rows.sort((l1, l2) => l1.number - l2.number);
		
		let html = '<ol>';
		
		rows.forEach(l => {
			let css = (l.left > range.indent.min && l.left < range.indent.max) ? ' class="indent"' : '';
			html += '<li' + css + '>' + l.words.join(' ') + '</li>';
		});

		return html + '</ol>';
	});
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

// find line this word region belongs to
function lineForText(region) {
	let min = region.y - range.baseLine;
	let max = region.y + range.baseLine;
	let right = region.x + region.w;
	let line = lines.find(l => l.base >= min && l.base <= max);
	
	if (line === undefined) {
		line = { base: region.y, left: region.x, right: right, words: [], number: 0, indent: 0 };
		lines.push(line);
	} else {
		if (right > line.right) { line.right = right; }
	}
	return line;
}

function decode(text) {
	return text
		.replace('%2C', ',')
		.replace('%3A', ':')
		.replace('%3B', ';');
}