'use strict';

// Flux actions are the methods that process dispatched messages
//
// Simple actions may be inline, anonymous methods in a store rather than
// containerized in modules

const Ϟ = require('../');

// standard action for a JSON response
exports.handleResponse = (response, type, defaultData) => {
	if (defaultData === undefined) { defaultData = null; }
	
	let data = (response.ok) ? response.body : defaultData;
	let status = (response.ok) ? Ϟ.status.OKAY : Ϟ.status.ERROR;

	Ϟ.emit(type, status, data);
};
