'use strict';

// use pdf2json to convert PDF document to HTML
// three different units are used
//    page units: almost universal in the PDF JSON data, 4.5 per inch
//    standard units: defined in layout, can be in., cm. or whatever
//    points: used for some items in the PDF JSON data, 72 per inch

//region Declarations
const outline = require('./outline');
const format = require('../format');
const round = places => { const f = Math.pow(10, places); return n => Math.round(n * f) / f; };
// curried method to convert PDF units to standard layout units (e.g. in, cm)
// three decimal places are needed to differentiate word spacing as a fraction of inches
const convertUnit = (factor, places = 3) => { const r = round(places); return value => r(value / factor); };
const pointsPerInch = 72;
const margin = { left: 1000, right: 0, number: 0 };
// see https://github.com/modesty/pdf2json#dictionary-reference for all colors
const color = { BLACK: 0, BLUE: 35 };
//endregion
//region Configuration
const layout = {
	height: 11,
	width: 8.5,
	space: 0.044,
	tab: 0.33,
	indent: 0.23,
	minBlockQuoteLines: 3,
	line: {
		// vertical deviation allowed for text considered to be on the same line
		tolerance: 0.1,
		height: 0.25,
		underlineBelowText: 0.2,
		strikethroughBelowText: 0.15
	},
	replacements: {
		// some replacements are simpler before or after outlining elements are added
		beforeOutlined: [
			[/^\s*(AN ACT)\n([^\n]+)\n+([^:]+:)/,
				'<header><h1>$1</h1><h2>$2</h2><h3>$3</h3></header>'],
			[/(?:\n+|^)(SECTION \d+\.[^\.:]+[\.:])(?:\n+(.+[A-Z](?:<\/[^>]+>)?\.))?((?:\n|.)+?)?(?=(\n+SECTION|$))/g,
				'<section><h1>$1</h1><h2>$2</h2><p>$3</p></section>']
		],
		afterOutlined: [
			// remove <p> mixed with <ol>
			[/<p>(<ol.+?)<\/p>(<\/li><\/ol>)/g, '$1$2'],
			// add closing </p> before <ol>
			[/(<\/h2><p>)((?:(?!<\/p>).)+?)(<ol)/g, '$1$2</p>$3'],
			// remove </p> in <li> that has no <p>
			[/<li>(((?!<p>).)+)?<\/p><\/li>/, '<li>$1</li>'],
			// add end <p>...</p> to <li> that has </p><p> within
			[/<li>(?!<p>)(.+?<\/p><p>.+?)<\/li>/g, '<li><p>$1</p></li>'],
			// if <li> has <p> and <table> then close <p> around <table>
			[/(<li><p>.+?)(<table[^>]*>.+<\/table>)(.+?<\/p><\/li>)/g, '$1</p>$2<p>$3'],
			// treat "NEW SECTION" as emphasized rather than inserted
			[/<ins>(NEW SECTION)<\/ins>/g, '<em>$1</em>'],
			// add CSS class to inserted <section>
			[/(<section)(><h1>)((?:(?!<\/section>).)+)(NEW SECTION)/g, '$1 class="inserted"$2$3$4'],
			// fix parenthetical percents with extra number (error in pdf2json?)
			[/\((\d+%)\d+\)/g, '($1)']
		]
	}
};
//endregion

function convertPDF(pdf) {
	// words need three decimal places to identify formatting and spacing but line margins
	// are further rounded to mitigate tiny discrepencies
	const r = round(2);
	const re = { hyphen: /\- *(<\/(ins|del)>$|$)/, number: /^\d+$/ };
	// calculate unit conversion factor from known page size
	const unit = convertUnit(pdf.formImage.Width / layout.width);
	// unlike position, width is measured in points
	const points = convertUnit(pointsPerInch);
	// track possible block quotes
	const blockQuote = {	start: 0, left: 0, right: 0 };
	let previousWord = null;
	let html = pdf.formImage.Pages
		.map(p => p.Texts
			.map(region => {
				// standardize text elements
				const el =  {
					left: unit(region.x),
					bottom: unit(region.y),
					right: unit(region.x) + points(region.w),
					underline: isUnderlined(region, p),
					strikethrough: isStricken(region, p),
					text: format.htmlDecode(region.R[0].T).trim()
				};
				// calculate page margins
				if (el.right > margin.right) { margin.right = el.right; }
				if (el.left < margin.left) {
					if (re.number.test(el.text)) {
						if (el.right > margin.number) { margin.number = el.right; }
					} else {
						margin.left = el.left;
					}
				}
				return el;
			})
			// combine text elements into lines
			.reduce((lines, el) => {
				let line = lines.find(l => isSameLine(el, l));
				if (line === undefined) {
					 line = {
						bottom: r(el.bottom),
						right: r(el.right),
						left: r(el.left), 
						words: [],
						blockQuoteRight: 0,
						numbered: false
					};
					lines.push(line);
					previousWord = null;
				}

				if (el.left <= margin.number && re.number.test(el.text)) {
					// flag but don't push line numbers into the word list
					line.numbered = true;
				} else {
					// track maximum word extents to identify indents and wrapping
					if (el.right > line.right) { line.right = r(el.right); }
					if (el.left < line.left) { line.left = r(el.left); }
					if (el.underline) {
						el.text = '<ins>' + el.text + '</ins>';
					} else if (el.strikethrough) {
						el.text = '<del>' + el.text + '</del>';
					}
					// measure distance between words to add spacing
					if (previousWord != null && el.left - previousWord.right >= layout.space) {
						el.text = ' ' + el.text;
					}
					line.words.push(el.text);
					
					previousWord = el;
				}
				return lines;
			},	[])
			// remove un-numbered lines
			.filter(l => l.numbered)
		)
		// combine page lines into one line array
		.reduce((lines, p) => lines.concat(p), [])
		// paragraph and block quote breaks
		.map((line, i, lines) => {
			if (i == 0) {
				// round page margins to match line margins
				margin.left = r(margin.left);
				margin.right = r(layout.width - margin.right);
				margin.number = r(margin.number);
			} else {
				const before = lines[i - 1];
				const after = (lines.length > i + 1) ? lines[i + 1] : null;
				const indented = line.left >= margin.left + layout.indent
					&& line.right <= (layout.width - margin.right) - layout.indent;
				const doubleSpace = {
					before: line.bottom - before.bottom > layout.line.height,
					after: after != null && after.bottom - line.bottom > layout.line.height
				};

				if (doubleSpace.before || (
					after != null && !doubleSpace.after && before.left == after.left &&
					before.right < layout.width - margin.right &&
					line.left >= before.left + layout.tab)) {
					// double-space above or indentation relative to single-spaced
					// lines before and after signals paragraph break
					line.words.unshift('\n');
				}

				if (doubleSpace.before) {
					if (blockQuote.start != 0 && i - blockQuote.start > layout.minBlockQuoteLines) {
						// wrap existing quote
						lines[blockQuote.start].words.unshift('<blockquote>');
						before.words.push('</blockquote>');
						// record quote margin to allow correct wrapping
						for (let j = blockQuote.start; j <= i; j++) { lines[j].blockQuoteRight = blockQuote.right; }
					}
					if (indented) {
						// track possible new quote
						blockQuote.start = i;
						blockQuote.left = line.left;
						blockQuote.right = line.right;
					} else {
						blockQuote.start = 0;
					}
				} else if (blockQuote.start > 0 && line.left != blockQuote.left &&
					(line.right != blockQuote.right || !doubleSpace.after)) {
					// reset quote tracker if line margins differ
					blockQuote.start = 0;
				}
			}
			return line;
		})
		// line wrapping
		.map(line => {
			if ((line.blockQuoteRight > 0 && line.right < line.blockQuoteRight) ||
				(line.blockQuoteRight == 0 && line.right < layout.width - margin.right)) {
				// add line break if words don't reach right margin
				line.words.push('\n');
			} else {
				// otherwise assume line wraps
				let last = line.words.pop();
				// word hyphenation placeholder disambiguates from other kinds of hyphens
				line.words.push(re.hyphen.test(last) ? last.replace(re.hyphen, '☺$1') : last + ' ');
			}
			return line;
		})	
		// combine words
		.reduce((text, line) => text + line.words.join(''), '')
		// now we're down to a string
		.replace(/ *\n */g, '\n')
		// restore legitimate hyphens that happened to be at line end
		.replace(/(\w)☺(of)\-(\w)/g, '$1-$2-$3')
		// join hyphenated words
		.replace(/(\w)(?:<\/(ins|del)> *<\2>)? *☺ *(?:<\/\2> *<\2>)?(\w)/g, '$1$3');
	
	const replace = pair => { html = html.replace(pair[0], pair[1]); pair[0].lastIndex = 0; };
	
	// custom replacements before outline
	layout.replacements.beforeOutlined.forEach(replace);
	// outline and clean-up
	html = format.pretty(outline.apply(html).replace(/\n{2}/g, '</p><p>').replace(/\n/g, ''));
	// custom replacements after outline
	layout.replacements.afterOutlined.forEach(replace);

	return '<article>' +	html + '</article>';
}

function isSameLine(el, line) {
	return line.bottom >= el.bottom - layout.line.tolerance
		 && line.bottom <= el.bottom + layout.line.tolerance;
}

// underlined text that isn't black is probably a hyperlink
function isUnderlined(el, page) { return hasLine(el, page, layout.line.underlineBelowText) && el.clr == color.BLACK; }
function isStricken(el, page) { return hasLine(el, page, layout.line.strikethroughBelowText); }

function hasLine(el, page, relativeToBaseline = 0) {
	// factor to convert all units to page units
	const factor = page.Height / layout.height;
	const xTolerance = 0.3;
	const yTolerance = (layout.line.tolerance / 2) * factor;
	const y = el.y + (relativeToBaseline * factor);
	// text width is measured in points
	const xMin = el.x + (el.w / pointsPerInch) * factor;
	
	return page.HLines.findIndex(line =>
		line.x <= el.x + xTolerance && 
		line.y <= y + yTolerance &&
		line.y > y - yTolerance && 
		line.x + line.l >= xMin) >= 0;
}

module.exports = {
	isUnderlined,
	isStricken,
	isSameLine,
	outline,
	parse: convertPDF,
	unit: convertUnit,
	round,
	layout
};