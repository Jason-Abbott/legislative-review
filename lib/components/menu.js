'use strict';

const G = require('../');
const React = require('react');
const Icon = require('./icon');

module.exports = class extends React.Component {
	render() {
		return (
			renderItems(this.props['data'], this.state.show)
		)
	}
};

function renderItems(items, visibleMenu) {
	let root = (visibleMenu !== undefined);
	let underline = (root) ? <div className="underline"></div> : null;
	return (
		<ul className={(root) ? 'menu' : 'sub-menu'}>{
			items.map((item, i) => {
				if (root) {
					if (show == i) {
						return (
							<li key={item.title}>
								{item.title}
								<Icon name="angle-down"/>
								{underline}
								{renderItems(item.items)}
							</li>
						)
					} else {
						return (
							<li onClick={onClick} key={item.title}>
								{item.title}
								<Icon name="angle-down"/>
								{underline}
							</li>
						);
					}
				} else {
					return <li key={item.title}>{item.title}</li>
				}
			}
		)}
		</ul>
	)
}

function onClick(name) {
	G.emit(G.action.SHOW_MENU, name);
}