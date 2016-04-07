'use strict';

// server tasks

const idaho = require('./idaho');
const tasks = [
	idaho.house
];

module.exports = {
	start() {
		console.log('Starting %d tasks', tasks.length);
		tasks.forEach(t => { t.start(); });
	}
};