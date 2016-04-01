'use strict';

const L = require('./');
const React = require('react');
// const store = require('./state');
class View extends React.Component {
	constructor(props) {
		super(props);
		this.token = null;
		this.type = null;
	}

	//componentDidMount() { this.token = store.subscribe(this.onLoad); }
	//componentWillUnmount() { store.unsubsribe(this.token); }

	// onLoad(e) {
	// 	this.setState(store.current());
	// }

	render() {
		return <div>Waypoints</div>;
	}
}

module.exports = View;