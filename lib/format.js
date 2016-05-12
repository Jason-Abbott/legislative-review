'use strict';

module.exports = {
	curlyQuotes(text) {
		return text
			.replace(/(\s|^|>)"(<\/(ins|del)>)?(\w)/g, '$1&ldquo;$2$4')
			.replace(/([\w,\)])(<(ins|del)>)?"(\s|<|$)/g, '$1$2&rdquo;$4');
	},
	apostrophes(text) {
		return text
			.replace(/(\w)'(\w\b)/g, '$1&rsquo;$2')
			.replace(/s'(\b|$| )/g, 's&rsquo;$1');
	},
	dashes(text) {
		return text
			.replace(/ *\- */g, '-')
			// em-dash
			.replace(/ *\-\- */g, ' &mdash; ');
	},
	removeExtraSpace(text) {
		return text
			.replace(/ {2,}/g, ' ')
			// space before comma
			.replace(/ ,/g, ',')
			// space around block tags
			.replace(/\s*(<\/?(ol|li|div|p|dt|dd|ul|header|section|h1|h2|h3)[^>]*>)\s*/gi, '$1')
			// leading tag content space
			.replace(/(<[^\/>]+>)\s+([\w&])/g, '$1$2')
			// trailing tag content space
			.replace(/([\w\.:])\s+<\//g, '$1<\/')
			// space before end of sentence
			.replace(/>\s+\./g, '>.')
	},
	htmlDecode(text) {
		return text
			.replace(/%22/g, '"')
			.replace(/%2C/g, ',')
			.replace(/%20/g, ' ')
			.replace(/%3A/g, ':')
			.replace(/%3B/g, ';')
			.replace(/%24/g, '$')
	},
	removeExtraTags(text) {
		return text.replace(/<\/(ins|del|i|b)>( *)<\1>/gi, '$2');
	},
	removeEmptyTags(text) {
		return text.replace(/<(ins|del|i|b|p|span|h\d)[^>]*>\s*<\/\1>/gi, '');
	},
	wordForNumber(number) {
		switch (number) {
			case 1: return 'One';
			case 2: return 'Two';
			case 3: return 'Three';
		}
	},
	pretty(text) {
		return this.curlyQuotes(
			this.removeEmptyTags(
			this.removeExtraSpace(
			this.apostrophes(
			this.dashes(
			this.removeExtraTags(text)
		)))));
	}
};
