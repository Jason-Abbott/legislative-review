'use strict';

// entry point for React management web client

const c = require('./constants');
const firebase = require('firebase');
const authProvider = new firebase.auth.GoogleAuthProvider();
const config = require('./config');
const React = require('react');
const ReactDOM = require('react-dom');
const Footer = require('./components/footer');
const Router = require('./components/router');
const App = props => (
	<div>
		<Router site={c.site.ADMIN}/>
		<Footer/>
	</div>
);

firebase.initializeApp(config.db);
firebase.auth().signInWithRedirect(authProvider).then(function(result) {
   console.log(result);

   // This gives you a Google Access Token. You can use it to access the Google API.
   var token = result.credential.accessToken;
   // The signed-in user info.
   var user = result.user;

}).catch(function(error) {
   console.error(error);
});


ReactDOM.render(<App />, document.getElementById('react-root'));