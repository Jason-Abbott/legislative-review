'use strict';

const Firebase = require('firebase');
const config = require('../config');
const section = {
	LOGS: 'log'
};

let db = null;

function connect(done = null) {
	db = new Firebase(config.db.url);
	db.authWithCustomToken(config.db.key, err => {
		if (err != null) { console.error(err); }
		if (done != null) { done(err == null); }
	});
}

module.exports = {
	connect,
	get logs() { return db.child(section.LOGS); }
};