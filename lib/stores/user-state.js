'use strict';

// flux state store for users
// kind of a catch-all since most all state is user-driven

const { session, constants, db, flux, is, copy } = require('../');
const baseStore = require('../stores/flux-store');
const sessionKey = 'user';
const store = copy(baseStore, {
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
	load(force = false) {
      if (force || !is.value(this.state)) {
         this.state = session.item(sessionKey);
         if (!is.value(this.state)) { this.reset(); }
      }
      return this.state;
	},
	handler(type, data) {
      const a = constants.action;
		switch (type) {
			case a.CHANGE_VIEW:
				this.state.view = data.view;
				this.changed();
				break;
         case a.LOGIN:
            db.login(data);
            break;
			case a.LOGOUT:
            this.reset();
            session.remove(sessionKey);
            this.changed();
				break;
         case a.LOGIN_RESPONSE:
            if (data !== null && data.user !== null) {
	            this.update({
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
            this.changed();
            break;
		}
	}
});

module.exports = flux.subscribe(store);