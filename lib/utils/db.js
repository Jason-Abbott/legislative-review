'use strict';

// https://firebase.google.com/support/guides/firebase-web#import_your_project_to_the_firebase_console_numbered

const Ϟ = require('../');
const firebase = require('firebase');
const section = {
	LOGS: 'log',
	TASKS: 'tasks'
};

let db = null;

function connect() {
	firebase.initializeApp(Ϟ.config.db);
	db = firebase.database();
}

module.exports = {
	connect,
	get logs() { return db.ref(section.LOGS); },
	get tasks() { return db.ref(section.TASKS); },
	get TIMESTAMP() { return firebase.database.ServerValue.TIMESTAMP; }
};
