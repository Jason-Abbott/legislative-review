'use strict';

// flux state store for users
// kind of a catch-all since most all state is user-driven

const { session, constants, db, subscribe, is, copy } = require('../');
const flux = require('../stores/flux-store');
const sessionKey = 'user';
const store = copy(flux, {
	initial: {
		id: null,
		token: null,
		refreshToken: null,
		view: constants.view.HOME,
		menu: null,
		notifications: [],
		signedIn: false,
		fullName: null,
		photoURL: null,
		provider: null
	},
	get state() {
		if (!is.value(this.__state)) {
			this.__state = session.item(sessionKey);
			if (!is.value(this.__state)) { this.__state = copy(this.initial); }
		}
		return this.__state;
	},
	handler(type, data) {
      const a = constants.action;
		switch (type) {
			case a.CHANGE_VIEW:
				this.state.view = data.view;
				this.emit();
				break;
         case a.LOGIN:
            db.login(data);
            break;
			case a.LOGOUT:
            this.reset();
            this.emit();
				break;
         case a.LOGIN_RESPONSE:
            if (data !== null && data.user !== null) {
	            this.state = copy(this.state, {
                  id: data.user.uid,
	               signedIn: true,
                  fullName: data.user.displayName,
                  photoURL: data.user.photoURL,
                  token: data.credential.idToken,
                  refreshToken: data.user.refreshToken,
                  provider: data.credential.provider
	            });
            } else {
               this.reset();
            }
            session.save(sessionKey, this.state);
            this.emit();
            break;
		}
	}
});

module.exports = subscribe(store);
