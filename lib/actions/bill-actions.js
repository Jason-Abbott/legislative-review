'use strict';

const Ϟ = require('../index');

module.exports = {
	add(accountName, password) {
		if (Ϟ.is.empty(accountName) || Ϟ.is.empty(password)) {
			// short-circuit the server call if credentials are invalid
			Ϟ.emit(Ϟ.action.LOGIN_RESPONSE, Ϟ.status.INCORRECT);
		} else {
			Ϟ.emit(Ϟ.action.LOGIN, { username: accountName, password: password });
			
		}
	}
};

function loginResponse(error, response) {
	var status = Ϟ.status.ERROR;
	var data = null;

	if (response.ok) {
		if (response.body === false) {
			status = Ϟ.status.INCORRECT;
		} else {
			status = Ϟ.status.OKAY;
			data = {
				accountName: response.body['accountName'],
				fullName: response.body['name'],
				token: response.body['jwt']
			}
		}
	} else if (response.status == 406) {
		// account expired
		status = Ϟ.status.EXPIRED;
	} else if (response.status == 404 || response.status == 401) {
		// invalid username will create a non-existent path
		status = Ϟ.status.INCORRECT;
	}

	Ϟ.emit(Ϟ.action.LOGIN_RESPONSE, status, data);
}
