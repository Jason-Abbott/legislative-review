'use strict';

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

module.exports = {
	houseMembers: Object.assign({}, scraper, {
		url: baseURL + 'house/membership.cfm',
		parse(dom) {
			console.log('Parsing Idaho House membership');
			let members = parseMemberPage(dom, 'house');
			let x = members;
		}
	}),

	senateMembers: Object.assign({}, scraper, {
		url: baseURL + 'senate/membership.cfm',
		startDelay: scraper.seconds(45),
		parse(dom) {
			console.log('Parsing Idaho Senate membership');
			let members = parseMemberPage(dom, 'senate');
			let x = members;
		}
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
			let x = c;
		}
	}),

	bills: Object.assign({}, scraper, {
		url: baseURL + 'legislation/' + (new Date()).getYear() + '/minidata.htm',
		parse(dom) {
			console.log('Parsing Idaho bills');
			let c = parseCommitteePage(dom);
			let x = c;
		}
	}),
};

function parseMemberPage(dom, chamber) {
	let members = [];
	dom('table td:last-child table:last-child tr').each((i, el) => {
		let row = cheerio.load(el);
		members.push(parseBio(
			row('td:nth-child(2)').html(),
			row('img').attr('src'),
			chamber
		));
	});
	return members;
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

	return {
		id: parseInt(match(clean, re.id)),
		name: match(clean, re.name),
		party: match(clean, re.party),
		image: img.replace('..', 'http://legislature.idaho.gov/' + chamber),
		terms: parseInt(match(clean, re.term)),
		phone: match(clean, re.phone, 0),
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