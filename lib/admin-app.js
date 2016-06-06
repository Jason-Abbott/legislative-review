'use strict';

// entry point for React management web client

const Ϟ = require('./');
const React = require('react');
const ReactDOM = require('react-dom');
const { Footer, Router, Login } = require('./components/');
const store = Ϟ.store.user;

class AdminApp extends React.Component {
   constructor(props) {
      super(props);
      this.state = store.state;
   }

   componentDidMount() {
      store.subscribe(this.onChange.bind(this));
      if (!this.state.signedIn) { Ϟ.db.handleLoginResult(); }
   }
   componentWillUnmount() { store.remove(this.onChange); }
   onChange() { this.setState(store.state); }
   
   render() {
      const view = this.state.signedIn ? <Router site={Ϟ.constant.site.ADMIN}/> : <Login/>;
      return <div>{view}<Footer/></div>;
   }
}

ReactDOM.render(<AdminApp />, document.getElementById('react-root'));
