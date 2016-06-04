'use strict';

// entry point for React management web client

const Ϟ = require('./');
const React = require('react');
const ReactDOM = require('react-dom');
const { Footer, Router, Login } = require('./components/');
const view = Ϟ.store.user.signedIn ? <Router site={Ϟ.c.site.ADMIN}/> : <Login/>;
const App = () => <div>{view}<Footer/></div>;

if (!Ϟ.store.user.signedIn) { Ϟ.action.user.checkLoginResult(); }

ReactDOM.render(<App />, document.getElementById('react-root'));
