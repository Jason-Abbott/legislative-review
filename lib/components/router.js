'use strict';

// display view matching current URL path

const { routes } = require('../');
const store = require('../stores/user-state');
const { Component } = require('react');

module.exports = class extends Component {
	constructor(props) {
		super(props);
		this.token = null;
      routes.site = this.props["site"];
   }

	componentDidMount() { store.subscribe(this.onChange.bind(this)); }
	componentWillUnmount() { store.remove(this.onChange); }

	onChange(e) {
		console.log('router onChange', store.state);
		this.setState(store.state);
	}

	render() {
		console.log(routes);

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

		let main = routes.match(window.location.pathname);
		return new main();
	}
};
