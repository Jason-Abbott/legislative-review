'use strict';

const G = require('../../');
const http = require('superagent');

module.exports = {
	login(accountName, password) {
		if (G.is.empty(accountName) || G.is.empty(password)) {
			// short-circuit the server call if credentials are invalid
			G.emit(G.action.LOGIN_RESPONSE, G.status.INCORRECT);
		} else {
			G.emit(G.action.LOGIN, { username: accountName, password: password });
			http
				.post('/user/' + accountName + '/login/')
				.send({ password: password })
				.set('Accept', 'application/json')
				.end(loginResponse);
		}
	},

	logout() { G.emit(G.action.LOGOUT); },

	load(accountName) {
		G.emit(G.action.USER_REQUEST);
		http
			.get(G.config.api.url + 'user/' + accountName)
			.set('Accept', 'application/json')
			.end((err, res) => {
				//this.respond(response, G.action.LOAD_EMPLOYEE_RESPONSE);
			});
	}
};

function loginResponse(error, response) {
	var status = G.status.ERROR;
	var data = null;

	if (response.ok) {
		if (response.body === false) {
			status = G.status.INCORRECT;
		} else {
			status = G.status.OKAY;
			data = {
				accountName: response.body['accountName'],
				fullName: response.body['name'],
				token: response.body['jwt']
			}
		}
	} else if (response.status == 406) {
		// account expired
		status = G.status.EXPIRED;
	} else if (response.status == 404 || response.status == 401) {
		// invalid username will create a non-existent path
		status = G.status.INCORRECT;
	}

	G.emit(G.action.LOGIN_RESPONSE, status, data);
}