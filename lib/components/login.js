'use strict';

const Ϟ = require('../');
const React = require('react');
const p = Ϟ.constant.authProvider;
const login = provider => () => Ϟ.emit(Ϟ.constant.action.LOGIN, provider);

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
