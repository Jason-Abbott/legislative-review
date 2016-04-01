'use strict';

// Flux actions are the methods that process dispatched messages
//
// Simple actions may be inline, anonymous methods in a store rather than
// containerized in modules

const L = require('../index');

// standard action for a JSON response
exports.handleResponse = (response, type, defaultData) => {
	if (defaultData === undefined) { defaultData = null; }
	
	let data = (response.ok) ? response.body : defaultData;
	let status = (response.ok) ? L.status.OKAY : L.status.ERROR;

	L.emit(type, status, data);
};