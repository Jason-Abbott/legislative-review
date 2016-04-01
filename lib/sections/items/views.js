'use strict';

const G = require('../../');
const React = require('react');
const Grid = require('../../components/grid');
const store = require('./state');
class itemView extends React.Component {
	constructor(props) {
		super(props);
		this.token = null;
		this.type = null;
	}

	componentDidMount() { this.token = store.subscribe(this.onLoad); }
	componentWillUnmount() { store.unsubsribe(this.token); }

	renderGrid() {
		return new Grid();
	}

	onLoad(e) {
		this.setState(store.current());
	}
}

exports.waypoints = class extends itemView {
	constructor(props) {
		super(props);
		this.type = G.type.WAYPOINT;
	}

	render() {
		return <div>Waypoints</div>;
	}
};

exports.routes = class extends itemView {
	constructor(props) {
		super(props);
		this.type = G.type.WAYPOINT;
	}

	render() {
		return <div>Routes</div>;
	}
};