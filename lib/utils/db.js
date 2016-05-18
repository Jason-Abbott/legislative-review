'use strict';

// https://firebase.google.com/support/guides/firebase-web#import_your_project_to_the_firebase_console_numbered

const firebase = require('firebase');
const config = require('../config');
const section = {
	LOGS: 'log'
};

let db = null;

function connect(done = null) {
	db = firebase.initializeApp(config.db.url);
	db.authWithCustomToken(config.db.key, err => {
		if (err != null) { console.error(err); }
		if (done != null) { done(err == null); }
	});
}

module.exports = {
	connect,
	get logs() { return db.child(section.LOGS); }
};