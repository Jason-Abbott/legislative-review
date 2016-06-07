'use strict';

// display view matching current URL path

const { routes } = require('../');
const store = require('../stores/user-state');
const { Component } = require('react');

module.exports = class extends Component {
	constructor(props) {
		super(props);
		this.state = { view: store.load().view };
      routes.site = this.props["site"];
   }

	componentDidMount() { store.subscribe(this.onChange.bind(this)); }
	componentWillUnmount() { store.remove(this.onChange); }

	onChange() {
		console.log('router onChange', store.state);
		this.setState({ view: store.state.view });
	}

	render() {
		console.log("rendering routes", routes);
		const main = routes.match(window.location.pathname);
		return new main();
	}
};
