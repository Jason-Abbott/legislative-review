'use strict';

// display view matching current URL path

const { route } = require('../');
const { Component } = require('react');
const store = require('../stores/user-state');

module.exports = class extends Component {
	constructor(props) {
		super(props);
		this.token = null;
      route.site = this.props["site"];
   }

	componentDidMount() { this.token = store.subscribe(this.onChange.bind(this)); }
	componentWillUnmount() { store.ignore(this.token); }

	onChange(e) {
		console.log('router onChange', store.state);
		this.setState(store.state);
	}

	render() {
		console.log(route);

		// var ref = new Firebase("https://legislative-review.firebaseio.com/");
		// console.log(ref.getAuth());
		// // ref.authWithOAuthPopup("facebook", function(error, authData) {
		// 	if (error) {
		// 		console.log("Login Failed!", error);
		// 	} else {
		// 		console.log("Authenticated successfully with payload:", authData);
		// 		L.session.save('uid', authData.uid);
		// 	}
		// });

		let main = route.match(window.location.pathname);
		return new main();
	}
};