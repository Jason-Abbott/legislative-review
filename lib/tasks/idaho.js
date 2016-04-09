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
	phone: /\(\d{3}\) \d{3}\-\d{4}/,
	district: /District (\d{1,2})/i,
};

const db = new Firebase(config.db.url + 'idaho');

module.exports = {
	houseMembers: Object.assign({}, scraper, {
		url: baseURL + 'house/membership.cfm',
		parse(dom) { parseMemberPage(dom, 'house'); }
	}),

	senateMembers: Object.assign({}, scraper, {
		url: baseURL + 'senate/membership.cfm',
		startDelay: scraper.seconds(5),
		parse(dom) { parseMemberPage(dom, 'senate');	}
	}),

	houseCommittees: Object.assign({}, scraper, {
		url: baseURL + 'house/committees.cfm',
		startDelay: scraper.seconds(8),
		parse(dom) { parseCommitteePage(dom, 'house'); }
	}),

	senateCommittees: Object.assign({}, scraper, {
		url: baseURL + 'senate/committees.cfm',
		startDelay: scraper.seconds(10),
		parse(dom) { parseCommitteePage(dom, 'senate'); }
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
			cleanHTML(row('td:nth-child(2)').html()),
			row('img').attr('src')
		));
	});
	merge(dbList, webList, 'id');
}

function parseCommitteePage(dom, chamber) {
	let webList = [];
	let dbChamber = db.child(chamber);
	let dbList = dbChamber.child('committees');

	console.log('Parsing Idaho ' + chamber + ' committees');
	
	dbChamber.child('members').once('value', data => {
		let members = data.val();

		dom('table td:last-child table:last-child tr').each((i, el) => {
			if (i == 0) { return; }
			let row = cheerio.load(el);
			webList.push(parseCommittee(
				cleanHTML(row('td:first-child').html()),
				cleanHTML(row('td:nth-child(2)').html()),
				cleanHTML(row('td:nth-child(3)').html()),
				members
			));
		});
		merge(dbList, webList, 'name');
	});
}

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

function parseBio(html, img) {
	let photo = img.split('/');
	return {
		id: parseInt(match(html, re.id)),
		name: match(html, re.name),
		party: match(html, re.party),
		image: photo[photo.length - 1],
		terms: parseInt(match(html, re.term)),
		district: parseInt(match(html, re.district)),
		//phone: match(html, re.phone, 0),
		committees: []
	}
}

function parseCommittee(summary, republicans, democrats, members) {
	const parties = title =>
		parseMembers(republicans, members, title).concat(
		parseMembers(democrats, members, title));
	let chair = parties('Chair');
	let vice = parties('Vice Chair');
	
	return {
		name: match(summary, re.name),
		chair: first(chair),
		schedule: null,
		viceChair: first(vice),
		secretary: null,
		members: parties()
	};
}

function parseMembers(html, members, title) {
	return html
		.split(/<br>/i)
		.filter(n => title === undefined || (new RegExp('<strong>' + title + '</strong>', 'i')).test(n))
		.map(n => n.replace(re.name, ''))
		.map(n => Object.keys(members).find(key => members[key].name == n))
		.filter(n => n !== undefined && n !== null);
}

// remove hard spaces and spaces around tags
function cleanHTML(html) {
	return html.replace(/(&#xA0;)+/g, '').replace(/\s*([<>])\s*/g, '$1');
}

function first(a) { return (a !== null && a.length > 0) ? a[0] : null; }

//return value at regex match index
function match(text, re, i) {
	if (i === undefined) { i = 1; }
	let m = text.match(re);
	return (m != null && m.length > i) ? m[i] : null;
}

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