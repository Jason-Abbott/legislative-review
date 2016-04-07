'use strict';

// entry point for React web client

const L = require('./index');
const React = require('react');
const ReactDOM = require('react-dom');
const Header = require('./components/header');
const Footer = require('./components/footer');
const Router = require('./components/router');
const App = props => (
	<div>
		<Header/>
		<Router/>
		<Footer/>
	</div>
);

ReactDOM.render(<App />, document.getElementById('react-root'));