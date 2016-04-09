'use strict';

// server tasks

const idaho = require('./idaho');
const tasks = [
	// idaho.houseMembers,
	// idaho.senateMembers,
	// idaho.houseCommittees,
	// idaho.senateCommittees,
	idaho.bills
];

module.exports = {
	start() {
		console.log('Starting %d tasks', tasks.length);
		tasks.forEach(t => { t.start(); });
	}
};