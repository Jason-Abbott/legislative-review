'use strict';

// safe interaction with browser storage

const ok = (typeof(Storage) !== 'undefined');

module.exports = {
	save(key, value) {
		if (ok) { sessionStorage.setItem(key, JSON.stringify(value)); }
	},

	remove(key) {
		if (ok) { sessionStorage.removeItem(key); }
	},

	item(key) {
		return (ok) ? JSON.parse(sessionStorage.getItem(key)) : null;
	}
};

