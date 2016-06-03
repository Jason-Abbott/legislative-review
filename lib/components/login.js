'use strict';

const React = require('react');
const firebase = require('firebase');
const config = require('../config');

//firebase.initializeApp(config.db);

// see https://github.com/firebase/quickstart-js/blob/master/auth/google-redirect.html
function googleLogin() {
   const provider = new firebase.auth.GoogleAuthProvider();
   firebase.auth().signInWithRedirect(provider);
}

module.exports = () => (
   <div className="login">
      <h1>Sign in to continue</h1>
      <a onClick={googleLogin}>Google</a>
   </div>
);
