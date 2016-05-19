'use strict';

const db = require('./db');
const level = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

function debug(msg) { save(level.DEBUG, msg); }
function info(msg) { save(level.INFO, msg); }
function warn(msg) { save(level.WARN, msg); }
function error(errOrMsg, msg = null) {
	save(level.ERROR, msg);
}

function save(level, message, stack = null) {
	db.logs.push({ at: db.TIMESTAMP, level, message, stack });
	console.log(message);
}

module.exports = { debug, info, warn, error };