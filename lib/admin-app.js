'use strict';

// entry point for React management web client

const c = require('./constants');
const auth = require('./utils/auth');
const React = require('react');
const ReactDOM = require('react-dom');
const { Footer, Router, Login } = require('./components/');

const view = firebase.auth().currentUser != null ? <Router site={c.site.ADMIN}/> : <Login/>;
const App = props => (<div>{view}<Footer/></div>);

ReactDOM.render(<App />, document.getElementById('react-root'));

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