'use strict';

const config = require('../config');
const Firebase = require('firebase');
const cheerio = require('cheerio');
const scraper = require('./scrape-task');
const baseURL = 'http://legislature.idaho.gov/';
const re = {
	name: /^\s*<strong>([^<]+)<\/strong>/i,
	term: /<br>(\d+)<sup>\w+<\/sup>term/i,
	party: /\((\w)\)/i,
	id: /membershipSingle\.cfm\?ID=(\d+)/i,
	phone: /\(\d{3}\) \d{3}\-\d{4}/
};

const db = new Firebase(config.db.url + 'idaho');

module.exports = {
	houseMembers: Object.assign({}, scraper, {
		url: baseURL + 'house/membership.cfm',
		parse(dom) { parseMemberPage(dom, 'house'); }
	}),

	senateMembers: Object.assign({}, scraper, {
		url: baseURL + 'senate/membership.cfm',
		startDelay: scraper.seconds(10),
		parse(dom) { parseMemberPage(dom, 'senate');	}
	}),

	houseCommittees: Object.assign({}, scraper, {
		url: baseURL + 'house/committees.cfm',
		parse(dom) {
			console.log('Parsing Idaho House committees');
			let c = parseCommitteePage(dom);
			let x = c;
		}
	}),

	senateCommittees: Object.assign({}, scraper, {
		url: baseURL + 'senate/committees.cfm',
		parse(dom) {
			console.log('Parsing Idaho Senate committees');
			let c = parseCommitteePage(dom);
			let x = c;
		}
	}),

	districts: Object.assign({}, scraper, {
		url: baseURL + 'about/district.cfm',
		parse(dom) {
			console.log('Parsing Idaho legislative districts');
			let c = parseCommitteePage(dom);
		}
	}),

	bills: Object.assign({}, scraper, {
		url: baseURL + 'legislation/' + (new Date()).getYear() + '/minidata.htm',
		parse(dom) {
			console.log('Parsing Idaho bills');
			let c = parseCommitteePage(dom);
		}
	})
};

function parseMemberPage(dom, chamber) {
	let webList = [];
	let dbList = db.child(chamber).child('members');

	console.log('Parsing Idaho ' + chamber + ' membership');

	dom('table td:last-child table:last-child tr').each((i, el) => {
		let row = cheerio.load(el);
		webList.push(parseBio(
			row('td:nth-child(2)').html(),
			row('img').attr('src'),
			chamber
		));
	});

	dbList.once('value', data => {
		let matched = [];
		
		data.forEach(row => {
			let stored = row.val();
			let parsed = webList.find(w => w.id == stored.id);
			let dbItem = dbList.child(row.key());

			if (parsed !== null) {
				applyChanges(dbItem, stored, parsed);
				matched.push(stored.id);
			} else {
				dbItem.update({ removed: Firebase.ServerValue.TIMESTAMP });
			}
		});

		webList.filter(w => matched.indexOf(w.id) == -1).forEach(w => {
			w.created = Firebase.ServerValue.TIMESTAMP;
			w.updated = Firebase.ServerValue.TIMESTAMP;
			w.deleted = 0;
			dbList.push().set(w)
		});
	});
}

function applyChanges(dbItem, stored, parsed) {
	let changes = {};
	let changed = false;
	const ignoreFields = ['created','updated','deleted'];

	for (let key in stored) {
		if (ignoreFields.indexOf(key) == -1 && stored.hasOwnProperty(key) && stored[key] != parsed[key]) {
			changes[key] = parsed[key] === undefined ? null : parsed[key];
			changes['updated'] = Firebase.ServerValue.TIMESTAMP;
			changed = true;
		}
	}
	if (changed) { dbItem.update(changes); }
}

function parseCommitteePage(dom) {
	let committees = [];

	committees.push({
		name: null,
		chair: null,
		schedule: null,
		viceChair: null,
		secretary: null,
		members: [],
		email: null,
		phone: null
	});

	return committees;
}

function parseBio(html, img, chamber) {
	// remove hard spaces and spaces around tags
	let clean = html
		.replace(/(&#xA0;)+/g, '')
		.replace(/\s*([<>])\s*/g, '$1');
	let photo = img.split('/');

	return {
		id: parseInt(match(clean, re.id)),
		name: match(clean, re.name),
		party: match(clean, re.party),
		image: photo[photo.length - 1],
		terms: parseInt(match(clean, re.term)),
		//phone: match(clean, re.phone, 0),
		committees: []
	}
}

function match(text, re, i) {
	if (i === undefined) { i = 1; }
	let m = text.match(re);
	return (m != null && m.length > i) ? m[i] : null;
}

//<strong>Neil&#xA0; A.&#xA0; Anderson </strong>(R) &#xA0;&#xA0;&#xA0;&#xA0;<strong>
//<a href="/about/contactmembersform.cfm?ID=2128">E-mail</a></strong>&#xA0;&#xA0;&#xA0;&#xA0;
//<strong><a href="membershipSingle.cfm?ID=2128">Additional Information</a></strong>
//<br> District 31 <br>2<sup>nd</sup> term<br> 71 S. 700 West, Blackfoot, 83221
//<br> Home (208) 684-3723 <br>     Retired Financial Advisor, Rancher <br>
//<strong>Committees:</strong><br> Commerce &amp; Human Resources - Vice Chair
//<br> Environment, Energy, &amp; Technology <br> Revenue &amp; Taxation <br>