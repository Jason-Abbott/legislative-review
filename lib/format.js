'use strict';

module.exports = {
	curlyQuotes(text) {
		return text
			.replace(/(\s|^)"(\w)/g, '$1&ldquo;$2')
			.replace(/([\w,])"(\s|$)/g, '$1&rdquo;$2');
	},
	apostrophes(text) {
		return text.replace(/(\w)'(\w\b)/g, '$1&rsquo;$2');
	},
	dashes(text) {
		return text
			.replace(/ +\- +/g, '-')
			// em-dash
			.replace(/ *\-\- */g, ' &mdash; ');
	},
	removeExtraSpace(text) {
		return text
			.replace(/ +/, ' ')
			// space before comma
			.replace(/ +,/g, ',')
			.replace(/ *([<>]) */g, '$1');
	},
	htmlDecode(text) {
		return text
			.replace(/%2C/g, ',')
			.replace(/%20/g, ' ')
			.replace(/%3A/g, ':')
			.replace(/%3B/g, ';')
			.replace(/%24/g, '$')
	},
	removeExtraTags(text) {
		return text.replace(/<\/(ins|del|i|b)>( *)<\1>/gi, '$2');
	},
	pretty(text) {
		text = this.curlyQuotes(text);
		text = this.apostrophes(text);
		text = this.dashes(text);
		text = this.removeExtraSpace(text);
		text = this.removeExtraTags(text);
		return text;
	}
};
