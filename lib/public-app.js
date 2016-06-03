'use strict';

// entry point for React web client

const React = require('react');
const ReactDOM = require('react-dom');
const { Header, Footer, Router } = require('./components/');
const App = props => (
	<div>
		<Header/>
		<Router/>
		<Footer/>
	</div>
);

ReactDOM.render(<App />, document.getElementById('react-root'));