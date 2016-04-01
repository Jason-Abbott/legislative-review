'use strict';

const L = require('../../index');
const http = require('superagent');

module.exports = {
	login(accountName, password) {
		if (L.is.empty(accountName) || L.is.empty(password)) {
			// short-circuit the server call if credentials are invalid
			L.emit(L.action.LOGIN_RESPONSE, L.status.INCORRECT);
		} else {
			L.emit(L.action.LOGIN, { username: accountName, password: password });
			http
				.post('/user/' + accountName + '/login/')
				.send({ password: password })
				.set('Accept', 'application/json')
				.end(loginResponse);
		}
	},

	logout() { L.emit(L.action.LOGOUT); },

	load(accountName) {
		L.emit(L.action.USER_REQUEST);
		http
			.get(L.config.api.url + 'user/' + accountName)
			.set('Accept', 'application/json')
			.end((err, res) => {
				//this.respond(response, G.action.LOAD_EMPLOYEE_RESPONSE);
			});
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