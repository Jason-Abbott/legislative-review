'use strict';

const L = require('../index');
const fire = require('firebase');

module.exports = {
	add(accountName, password) {
		if (L.is.empty(accountName) || L.is.empty(password)) {
			// short-circuit the server call if credentials are invalid
			L.emit(L.action.LOGIN_RESPONSE, L.status.INCORRECT);
		} else {
			L.emit(L.action.LOGIN, { username: accountName, password: password });
			
		}
	}
};

function loginResponse(error, response) {
	var status = L.status.ERROR;
	var data = null;

	if (response.ok) {
		if (response.body === false) {
			status = L.status.INCORRECT;
		} else {
			status = L.status.OKAY;
			data = {
				accountName: response.body['accountName'],
				fullName: response.body['name'],
				token: response.body['jwt']
			}
		}
	} else if (response.status == 406) {
		// account expired
		status = L.status.EXPIRED;
	} else if (response.status == 404 || response.status == 401) {
		// invalid username will create a non-existent path
		status = L.status.INCORRECT;
	}

	L.emit(L.action.LOGIN_RESPONSE, status, data);
}