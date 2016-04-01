'use strict';

// entry point for React web client

const gaia = require('./');
const React = require('react');
const ReactDOM = require('react-dom');
const NavBar = require('./components/navbar');
const Footer = require('./components/footer');
const Router = require('./components/router');

// sugar
gaia.dispatcher = require('./flux/dispatcher');
gaia.session = require('./session');

const GaiaApp = props => (
	<div>
		<NavBar menu={require('./sections/menu.json')}/>
		<Router/>
		<Footer/>
	</div>
);

ReactDOM.render(<GaiaApp />, document.getElementById('react-root'));