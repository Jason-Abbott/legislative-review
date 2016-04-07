'use strict';

// Load remote HTML and parse as DOM

const request = require('superagent');
const cheerio = require('cheerio');

module.exports = Object.assign({}, require('./task'), {
	url: null,
	run() {
		request.get(this.url).end((err, res) => {
			if (err == null && res.statusCode == 200) {
				this.parse(cheerio.load(res.text));
			} else {
				this.parse(null);
			}
		});
	},
	parse(dom) {}
});
