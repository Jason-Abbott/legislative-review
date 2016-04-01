'use strict';

const L = require('../index');
const React = require('react');
const Menu = require('./menu');
const Notification = require('./notification');
const AccountMenu = require('./account-menu');

module.exports = class extends React.Component {
	constructor() {
		super();
		this.state = {
			activeMenu: null
		}
	}

	componentDidMount() {
		this.token = L.state.user.onChange(()=> {
			this.setState({
				activeMenu: 'Company'
			})
		})
	}

	componentWillUnmount() {
		L.state.user.ignore(this.token);
	}

	render() {
		return (
			<nav className="top-nav">
				<a href="/" className="logo"></a>
				<Menu data={this.props['menu']} show={this.state.activeMenu}/>
				<Notification/>
				<AccountMenu/>
			</nav>
		);
	}
};