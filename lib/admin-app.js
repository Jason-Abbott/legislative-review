'use strict';

// entry point for React management web client

const { db, constants: { site } } = require('./');
const store = require('./stores/user-state');
const React = require('react');
const ReactDOM = require('react-dom');
const { Footer, Router, Login } = require('./components/');

class AdminApp extends React.Component {
   constructor(props) {
      super(props);
      this.state = store.state;
	   console.log(store);
   }

   componentDidMount() {
      store.subscribe(this.onChange.bind(this));
      if (!this.state.signedIn) { db.handleLoginResult(); }
   }
   componentWillUnmount() { store.remove(this.onChange); }
   onChange() { this.setState(store.state); }

   render() {
      const view = this.state.signedIn ? <Router site={site.ADMIN}/> : <Login/>;
      return <div>{view}<Footer/></div>;
   }
}

ReactDOM.render(<AdminApp />, document.getElementById('react-root'));
