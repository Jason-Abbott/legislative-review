'use strict';

// entry point for React management web client

const L = require('./index');
const React = require('react');
const ReactDOM = require('react-dom');
const Footer = require('./components/footer');
const Router = require('./components/router');
const App = props => (
	<div>
		<Router site="admin"/>
		<Footer/>
	</div>
);

ReactDOM.render(<App />, document.getElementById('react-root'));