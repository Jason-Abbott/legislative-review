'use strict';

const cheerio = require('cheerio');
const scraper = require('./scrape-task');
const selector = {
	memberCell: 'table td:last-child table:last-child tr'
};

module.exports = {
	house: Object.assign({}, scraper, {
		url: 'http://legislature.idaho.gov/house/membership.cfm',
		parse(dom) {
			console.log('Parsing Idaho House membership');
			let members = [];
			
			dom(selector.memberCell).each((i, el) => {
				let row = cheerio.load(el);
				let bio = row('td:nth-child(2)');
				members.push({
					name: row('strong:first-child', bio).text(),
					image: row('img').attr('src')
				});
			});
			
			let x = members;
		}
	}),

	senate: Object.assign({}, scraper, {
		url: '',
		startDelay: scraper.seconds(45),
		parse(dom) {
			console.log('Parsing Idaho Senate membership');
		}
	})
};