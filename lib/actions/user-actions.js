'use strict';

const Ϟ = require('../');
const firebase = require('firebase');

function login(providerID) {
	switch (providerID) {
		// see https://github.com/firebase/quickstart-js/blob/master/auth/google-redirect.html
		case Ϟ.constant.authProvider.GOOGLE: providerLogin(new firebase.auth.GoogleAuthProvider()); break;
		case Ϟ.authProvider.TWITTER: providerLogin(new firebase.auth.GoogleAuthProvider()); break;
		case Ϟ.authProvider.FACEBOOK: providerLogin(new firebase.auth.GoogleAuthProvider()); break;
	}
}

function providerLogin(provider) { firebase.auth().signInWithRedirect(provider); }
function logout() { Ϟ.emit(Ϟ.action.LOGOUT); }
function checkLoginResult() {
	firebase.auth().getRedirectResult().then(result => {
		console.log(result);

		if (result.credential) {
			// This gives you a Google Access Token. You can use it to access the Google API.
			//var token = result.credential.accessToken;
			// [START_EXCLUDE]
			//document.getElementById('quickstart-oauthtoken').textContent = token;
		} else {
		}
		// The signed-in user info.
		var user = result.user;
	}).catch(function(error) {
		console.error(error);
	});
}

module.exports = { login, logout, checkLoginResult };
