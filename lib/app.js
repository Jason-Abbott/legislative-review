'use strict';

// entry point for React web client

const L = require('./');
const React = require('react');
const ReactDOM = require('react-dom');
const Header = require('./components/header');
const Footer = require('./components/footer');
const Router = require('./components/router');

// sugar
L.dispatcher = require('./flux/dispatcher');
L.session = require('./session');

const LegislativeReviewApp = props => (
	<div>
		<Header/>
		<Router/>
		<Footer/>
	</div>
);

ReactDOM.render(<LegislativeReviewApp />, document.getElementById('react-root'));