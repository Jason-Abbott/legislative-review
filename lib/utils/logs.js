'use strict';

const config = require('./../config');
const Firebase = require('firebase');
const db = new Firebase(config.db.url + 'log');
const level = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

function save(level, msg) {
	
}