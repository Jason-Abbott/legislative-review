'use strict';

const config = require('../config');
const Firebase = require('firebase');
const cheerio = require('cheerio');
const parse = require('./parse');
const task = require('./task');
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
	district: /District (\d{1,2})/i,
	votes: />(AYES|NAYS|Absent)<\/span>\s*--\s*([^<]+)/gi
};

const db = new Firebase(config.db.url + 'idaho');

// curried page parsers
const page = {
	member: chamber => dom => {
		let webList = [];
		let dbList = db.child(chamber).child('members');

		console.log('Parsing Idaho ' + chamber + ' membership');

		dom('table td:last-child table:last-child tr').each((i, el) => {
			let row = cheerio.load(el);
			webList.push(html.bio(
				html.clean(row('td:nth-child(2)').html()),
				row('img').attr('src')
			));
		});
		merge(dbList, webList, 'id');
	},
	committee: chamber => dom => {
		let webList = [];
		let dbChamber = db.child(chamber);
		let dbList = dbChamber.child('committees');

		console.log('Parsing Idaho ' + chamber + ' committees');

		dbChamber.child('members').once('value', data => {
			let members = data.val();

			dom('table td:last-child table:last-child tr').each((i, el) => {
				if (i == 0) { return; }
				let row = cheerio.load(el);
				webList.push(html.committee(
					html.clean(row('td:first-child').html()),
					html.clean(row('td:nth-child(2)').html()),
					html.clean(row('td:nth-child(3)').html()),
					members
				));
			});
			merge(dbList, webList, 'name');
		});
	},
	billList: dom => {
		let year = (new Date()).getFullYear();
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

		console.log('Parsing Idaho bills for ' + year);

		dom('tr[id^="bill"] a:first-child').each((i, el) => {
			queue.run(next => { scrapeBillPage(url + el.attribs['href'], next); });
		});
	},
	bill: next => dom => {
		let body = dom(selector.body);
		let links = [];
		let tally = { yes: [], no: [], absent: [] };

		dom('span:first-of-type a.plain', body).each((i, el) => {
			links.push({ text: el.children[0].data, url: el.attribs['href'] });
		});

		dom('table:nth-of-type(3) tr', body).each((i, el) => {
			if (el.children.length == 4) {
				// ignore spacer rows
				let row = cheerio.load(el);
				let html = html.clean(row('td:nth-child(3)').html());
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

		return {
			summary: dom('table:nth-of-type(2) td:first-child', body).html(),
			votes: tally,
			links: links
		};
	}
};

// HTML parsers
const html = {
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
	},
	committee(summary, republicans, democrats, members) {
		const parties = title =>
			this.members(republicans, members, title).concat(
			this.members(democrats, members, title));
		let chair = parties('Chair');
		let vice = parties('Vice Chair');

		return {
			name: match(summary, re.strong),
			chair: first(chair),
			schedule: null,
			viceChair: first(vice),
			secretary: null,
			members: parties()
		};
	},
	// database keys for members listed in html with optional title
	members(html, members, title) {
		return html
			.split(/<br>/i)
			.filter(n => title === undefined || (new RegExp('<strong>' + title + '</strong>', 'i')).test(n))
			.map(n => n.replace(re.name, ''))
			.map(n => Object.keys(members).find(key => members[key].name == n))
			.filter(n => n !== undefined && n !== null);
	}
};

// create and start scrape task for each bill page
function scrapeBillPage(url, next) {
	console.log('Scraping bill page ' + url);
	Object.assign({}, task, {
		run() { parse.dom(url, page.bill(next)); }
	}).start();
}

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
				dbItem.update({removed: Firebase.ServerValue.TIMESTAMP});
			}
		});

		webList.filter(w => matched.indexOf(w[keyField]) == -1).forEach(w => {
			w.created = Firebase.ServerValue.TIMESTAMP;
			w.updated = Firebase.ServerValue.TIMESTAMP;
			w.deleted = 0;
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

	houseCommittees: Object.assign({}, task, {
		startDelay: task.seconds(8),
		run() { parse.dom(baseURL + 'house/committees.cfm', page.committee('house')); }
	}),

	senateCommittees: Object.assign({}, task, {
		startDelay: task.seconds(10),
		run() { parse.dom(baseURL + 'senate/committees.cfm', page.committee('senate')); }
	}),

	billList: Object.assign({}, task, {
		run() { parse.dom(
			baseURL + 'legislation/' + (new Date()).getFullYear() + '/minidata.htm',
			page.billList);
		}})
};