'use strict';

// Flux actions are the methods that process dispatched messages
//
// Simple actions may be inline, anonymous methods in a store rather than
// containerized in modules

const G = require('../');

// standard action for a JSON response
exports.handleResponse = (response, type, defaultData) => {
	if (defaultData === undefined) { defaultData = null; }
	
	let data = (response.ok) ? response.body : defaultData;
	let status = (response.ok) ? G.status.OKAY : G.status.ERROR;

	G.emit(type, status, data);
};