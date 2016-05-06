'use strict';

module.exports = (text, chain = true) => ({
	curlyQuotes() {
		text = text
			.replace(/(\s|^)"(\w)/g, '$1&ldquo;$2')
			.replace(/([\w,])"(\s|$)/g, '$1&rdquo;$2');
		return (chain) ? this : text;
	},
	apostrophes() {
		text = text.replace(/(\w)'(\w\b)/g, '$1&rsquo;$2');
		return (chain) ? this : text;
	},
	dashes() {
		text = text
			.replace(/ +\- +/g, '-')
			// em-dash
			.replace(/ *\-\- */g, ' &mdash; ');
		return (chain) ? this : text;
	},
	done() { return text; }
});
