'use strict';

const { constants, flux } = require('../');
const React = require('react');
const p = constants.authProvider;
const login = provider => () => flux.emit(constants.action.LOGIN, provider);

module.exports = () => (
   <div className="login">
      <h1>Sign in to continue</h1>
	   <ul>
         <li onClick={login(p.GOOGLE)}>Google</li>
	      <li onClick={login(p.FACEBOOK)}>Facebook</li>
	      <li onClick={login(p.TWITTER)}>Twitter</li>
		</ul>
   </div>
);
