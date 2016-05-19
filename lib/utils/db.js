'use strict';

// https://firebase.google.com/support/guides/firebase-web#import_your_project_to_the_firebase_console_numbered

const firebase = require('firebase');
const config = require('../config');
const section = {
	LOGS: 'log',
	TASKS: 'tasks'
};

let db = null;

function connect(done = null) {
	firebase.initializeApp(config.db);
	db = firebase.database();
	let x = 1;
	// db.authWithCustomToken(config.db.serviceAccount, err => {
	// 	if (err != null) { console.error(err); }
	// 	if (done != null) { done(err == null); }
	// });
}

function verify() { if (db === null) { connect(); } }

module.exports = {
	connect,
	get logs() { return db.ref(section.LOGS); },
	get tasks() { return db.ref(section.TASKS); },
	get TIMESTAMP() { return firebase.database.ServerValue.TIMESTAMP; }
};