'use strict';

// https://firebase.google.com/support/guides/firebase-web#import_your_project_to_the_firebase_console_numbered

const { constants, config, flux } = require('../');
const firebase = require('firebase');
const section = {
	LOGS: 'log',
	TASKS: 'tasks'
};
let initialized = false;
let db = null;

function initialize() {
   if (!initialized) {
      firebase.initializeApp(config.db);
      db = firebase.database();
      initialized = true;
   }
}

function login(providerID) {
   initialize();
   firebase.auth().signInWithRedirect(makeLoginProvider(providerID));
}

function makeLoginProvider(providerID) {
   const p = constants.authProvider;
   switch (providerID) {
      // see https://github.com/firebase/quickstart-js/blob/master/auth/google-redirect.html
      case p.GOOGLE: return new firebase.auth.GoogleAuthProvider();
      case p.TWITTER: return new firebase.auth.GoogleAuthProvider();
      case p.FACEBOOK: return new firebase.auth.GoogleAuthProvider();
   }
}

function handleLoginResult() {
   initialize();
   firebase.auth().getRedirectResult()
      .then(result => {
         if (result != null && result.user !== null) {
            flux.emit(constants.action.LOGIN_RESPONSE, result);
         }
      })
      .catch(err => { console.error(err); });
}

module.exports = {
   login,
   handleLoginResult,
	connect: initialize,
	get logs() { return db.ref(section.LOGS); },
	get tasks() { return db.ref(section.TASKS); },
	get TIMESTAMP() { return firebase.database.ServerValue.TIMESTAMP; }
};
