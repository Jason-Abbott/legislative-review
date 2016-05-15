'use strict';

// server tasks

const log = require('../utils/logs');
const idaho = require('./idaho');
const tasks = [
	idaho.houseMembers
	// idaho.senateMembers,
	// idaho.houseCommittees,
	// idaho.senateCommittees,
	//idaho.billList
];

module.exports = {
	start() {
		log.info('Starting ' + tasks.length + ' tasks');
		tasks.forEach(t => { t.start(); });
	}
};