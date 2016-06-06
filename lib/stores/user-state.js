'use strict';

// flux state store for users
// kind of a catch-all since most all state is user-driven

const Ϟ = require('../');
const initial = {
   id: null,
   token: null,
   refreshToken: null,
   view: Ϟ.constant.view.HOME,
   menu: null,
   notifications: [],
   signedIn: false,
   fullName: null,
   photoURL: null,
   provider: null
};
const store = Object.assign({}, Ϟ.store.proto, {
	state: initial,
	handler(type, data) {
      const a = Ϟ.constant.action;
		switch (type) {
			case a.CHANGE_VIEW:
				this.state.view = data.view;
				this.emit();
				break;
         case a.LOGIN:
            Ϟ.db.login(data);
            break;
			case a.LOGOUT:
            this.state = initial;
            this.emit();
				break;
         case a.LOGIN_RESPONSE:
            if (data !== null && data.user !== null) {
               this.state.id = data.user.uid;
               this.state.fullName = data.user.displayName;
               this.state.photoURL = data.user.photoURL;
               this.state.token = data.credential.idToken;
               this.state.refreshToken = data.user.refreshToken;
               this.state.provider = data.credential.provider; // i.e. "google.com"
            } else {
               this.state = initial;
            }
            Ϟ.session.save('user', this.state);
            this.emit();
            break;
		}
	}
});

module.exports = Ϟ.subscribe(store);
