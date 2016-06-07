'use strict';

const { flux, constants: { action } } = require('../');
const React = require('react');
const Button = require('./button');
const Icon = require('./icon');
const store = require('../stores/user-state');

module.exports = class extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         active: false,
         user: store.load()
      }
   }
   componentDidMount() { store.subscribe(this.onChange.bind(this)); }
   componentWillUnmount() { store.remove(this.onChange); }
   onChange() { this.setState({ user: store.state }); }

   toggle() { this.setState({ active: !this.state.active }); }
   logout() {
      this.setState({ active: false });
      flux.emit(action.LOGOUT);
   }

	render() {
      if (this.state.user.signedIn) {
         const menu = (this.state.active)
            ? (<nav>
                  <h4>{this.state.user.fullName}</h4>
                  <Button onClick={this.logout.bind(this)} icon="close" title="Logout"/>
               </nav>)
            : null;

         return (
            <div id="account-menu">
               <img onClick={this.toggle.bind(this)} src={this.state.user.photoURL}/>
               {menu}
            </div>
         )
      } else {
         return <Icon className="signed-out" name="user"/>;
      }
	}
};