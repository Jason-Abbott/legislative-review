'use strict';

const config = require('../config');
const Firebase = require('firebase');
const cheerio = require('cheerio');
const parse = require('./parse');
const task = require('./task');
const log = require('../utils/logs');
const baseURL = 'http://legislature.idaho.gov/';
const selector = {
	body: 'table tr:first-child td:nth-child(2)'
};
const re = {
	strong: /^\s*<strong>([^<]+)<\/strong>/i,
	term: /<br>(\d+)<sup>\w+<\/sup>term/i,
	party: /\((\w)\)/i,
	id: /membershipSingle\.cfm\?ID=(\d+)/i,
	phone: /\(\d{3}\) \d{3}\-\d{4}/,
	billLink: /bill text/i,
	amendedLink: /engrossment (\d+)/i,
	purposeLink: /(purpose|fiscal)/i,
	district: /District (\d{1,2})/i,
	votes: />(AYES|NAYS|Absent)<\/span>\s*--\s*([^<]+)/gi
};

// https://firebase.google.com/support/guides/firebase-web#no-argument_getters_are_now_read-only_properties_numbered
//const db = new Firebase(config.db.url + 'idaho');

// curried page parsers
const page = {
	member: chamber => dom => {
		let webList = [];
		let dbList = db.child(chamber).child('members');

		log.info('Parsing Idaho ' + chamber + ' membership');

		dom('table td:last-child table:last-child tr').each((i, el) => {
			let row = cheerio.load(el);
			webList.push(HTML.bio(
				HTML.clean(row('td:nth-child(2)').html()),
				row('img').attr('src')
			));
		});
		merge(dbList, webList, 'id');
	},
	billList: year => dom => {
		let url = baseURL.replace(/\/$/, '');
		// limit scrape requests to [max] simultaneous
		let queue = {
			max: 10,
			current: 0,
			pending: [],
			run(task) {
				if (this.current >= this.max) {
					this.pending.push(task)
				} else {
					task(this.next.bind(this));
					this.current++;
				}
			},
			// method called when HTTP request completes
			next() {
				if (this.current < this.max) {
					let task = this.pending.pop();
					task(this.next.bind(this));
					this.current++;
				}
			}
		};

		log.info('Parsing Idaho bills for ' + year);

		dom('tr[id^="bill"] a:first-child').each((i, el) => {
			queue.run(next => {
				parse.dom(url + el.attribs['href'], page.bill(next))
			});
		});
	},
	bill: next => dom => {
		let body = dom(selector.body);
		let links = { text: null, purpose: null };
		let tally = { yes: [], no: [], absent: [] };
		// track amendments to link to the latest bill version
		let amend = 0;

		dom('span:first-of-type a.plain', body).each((i, el) => {
			let name = el.children[0].data;
			let url = el.attribs['href'];
			
			if (re.purposeLink.test(name)) {
				links.purpose = url;
			} else if (re.billLink.test(name) && amend == 0) {
				links.text = url;
			} else if (re.amendedLink.test(name)) {
				let version = parseInt(name.match(re.amendedLink)[1]);
				if (version > amend) {
					amend = version;
					links.text = url;
				}
			}
		});
		
		let lineNumber = 2.399;
		

		dom('table:nth-of-type(3) tr', body).each((i, el) => {
			if (el.children.length == 4) {
				// ignore spacer rows
				let row = cheerio.load(el);
				let html = HTML.clean(row('td:nth-child(3)').html());
				let votes;

				while ((votes = re.votes.exec(html)) !== null) {
					let field = 'absent';
					switch (votes[1]) {
						case 'AYES': field = 'yes'; break;
						case 'NAYS': field = 'no'; break;
					}
					tally[field] = votes[2].split(/\s*,\s*/);
				}
				re.votes.lastIndex = 0;
			}
		});

		parse.pdf(baseURL + 'legislation/2016/' + links.text, pdf => {
			
		});

		return {
			summary: dom('table:nth-of-type(2) td:first-child', body).html(),
			votes: tally,
			links: links
		};
	}
};

// HTML parsers
const HTML = {
	bio(html, img) {
		let photo = img.split('/');
		return {
			id: parseInt(match(html, re.id)),
			name: match(html, re.strong),
			party: match(html, re.party),
			image: photo[photo.length - 1],
			terms: parseInt(match(html, re.term)),
			district: parseInt(match(html, re.district)),
			//phone: match(html, re.phone, 0),
			committees: []
		}
	},
	// remove hard spaces and spaces around tags
	clean(html) {
		return html
			.replace(/(&#xA0;)+/g, ' ')
			.replace('  ', ' ')
			.replace(/\s*([<>])\s*/g, '$1');
	}
};

// load database objects for comparison to scraped web objects
function merge(dbList, webList, keyField) {
	dbList.once('value', data => {
		let matched = [];

		data.forEach(row => {
			let stored = row.val();
			let parsed = webList.find(w => w[keyField] == stored[keyField]);
			let dbItem = dbList.child(row.key());

			if (parsed !== null) {
				applyChanges(dbItem, stored, parsed);
				matched.push(stored[keyField]);
			} else {
				dbItem.update({ active: false });
			}
		});

		webList.filter(w => matched.indexOf(w[keyField]) == -1).forEach(w => {
			w.active = true;
			dbList.push().set(w)
		});
	});
}

// first element of array or null if not valid
function first(a, i) {
	if (i === undefined) { i = 0; }
	return (a !== null && a.length > i) ? a[i] : null;
}

// value at regex match index
function match(text, re, i) {
	if (i === undefined) { i = 1; }
	return first(text.match(re), i);
}

// use dbItem to apply parsed changes to stored object
function applyChanges(dbItem, stored, parsed) {
	let changes = {};
	let changed = false;
	const ignore = ['created','updated','deleted'];
	const done = [];
	const change = key => {
		changes[key] = parsed[key] === undefined ? null : parsed[key];
		changes['updated'] = Firebase.ServerValue.TIMESTAMP;
		changed = true;
	};

	for (let key in stored) {
		done.push(key);
		if (ignore.indexOf(key) == -1 &&
			stored.hasOwnProperty(key) &&
			stored[key] != parsed[key]) { change(key); }
	}
	for (let key in parsed) {
		if (done.indexOf(key) == -1 &&
			parsed.hasOwnProperty(key)) { change(key); }
	}
	if (changed) { dbItem.update(changes); }
}

module.exports = {
	houseMembers: Object.assign({}, task, {
		startDelay: task.seconds(2),
		run() { parse.dom(baseURL + 'house/membership.cfm', page.member('house')); }
	}),

	senateMembers: Object.assign({}, task, {
		startDelay: task.seconds(5),
		run() { parse.dom(baseURL + 'senate/membership.cfm', page.member('senate')); }
	}),

	billList: Object.assign({}, task, {
		run() {
			let year = (new Date()).getFullYear();
			parse.dom(baseURL + 'legislation/' + year + '/minidata.htm', page.billList(year));
		}})
};