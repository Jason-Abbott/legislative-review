'use strict';

// G strings

module.exports = {
	event: {
		CHANGE: 'change-event'
	},

	view: {
		BILL: 'bill',
		HOME: 'home',
		PRIVACY: 'privacy'
	},

	action: {
		CHANGE_VIEW: 'change-view',
		SHOW_MENU: 'show-menu',
		HIDE_MENU: 'hide-menu',
		LOGOUT: 'logout',
		LOGIN: 'login',
		LOGIN_RESPONSE: 'login-response',
		USER_REQUEST: 'user-request',
		USER_RESPONSE: 'user-response'
	},

	source: {
		VIEW: 'source-view',
		SERVER: 'source-server'
	},

	status: {
		OKAY: 'status-okay',
		INVALID: 'status-invalid',
		INCORRECT: 'status-incorrect',
		ERROR: 'status-error',
		NONE: 'status-none',
		PENDING: 'status-pending',
		EXPIRED: 'status-expired',
		DISABLED: 'status-disabled'
	}
};