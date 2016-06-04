'use strict';

module.exports = {
	event: {
		CHANGE: 'change-event'
	},

	view: {
		BILL: 'bill',
		HOME: 'publicHome',
		ABOUT: 'about',
		FINANCES: 'finances',
		PRIVACY: 'privacy'
	},

	permission: {
		ADD_BILL: 'add-bill'
	},
	
	site: {
      PUBLIC: 'public',
      ADMIN: 'admin'
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

	authProvider: {
		GOOGLE: 0,
		TWITTER: 1,
		FACEBOOK: 2,
		GITHUB: 3
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
