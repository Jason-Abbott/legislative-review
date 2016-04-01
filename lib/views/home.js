'use strict';

const L = require('./');
const React = require('react');
const Firebase = require('firebase');
const BillList = require('../components/bill-list');
const BlogList = require('../components/blog-list');
class View extends React.Component {
	constructor(props) {
		super(props);
		// this.token = null;
		// this.type = null;
	}

	//componentDidMount() { this.token = store.subscribe(this.onLoad); }
	//componentWillUnmount() { store.unsubsribe(this.token); }

	// onLoad(e) {
	// 	this.setState(store.current());
	// }

	render() {

		var ref = new Firebase("https://legislative-review.firebaseio.com/");
		ref.authWithOAuthPopup("facebook", function(error, authData) {
			if (error) {
				console.log("Login Failed!", error);
			} else {
				console.log("Authenticated successfully with payload:", authData);
				L.session.save('uid', authData.uid);
			}
		});

		return (
			<div>
				<div className="hero"></div>
				<BlogList/>
				<BillList/>
			</div>
		);
	}
}

module.exports = View;

// 540012654262-t1pdmufkm8o25p0g20tp2jdg2uo2t6ci.apps.googleusercontent.com
// secret
// nDt4NzJ71zzDXuqwmk6v3gsA