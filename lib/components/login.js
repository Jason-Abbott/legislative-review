'use strict';

const { authProvider: p } = require('../');
const React = require('react');
const action = require('../actions/user-actions');

module.exports = () => (
   <div className="login">
      <h1>Sign in to continue</h1>
	   <ul>
         <li onClick={action.login(p.GOOGLE)}>Google</li>
	      <li onClick={action.login(p.FACEBOOK)}>Facebook</li>
	      <li onClick={action.login(p.TWITTER)}>Twitter</li>
		</ul>
   </div>
);
