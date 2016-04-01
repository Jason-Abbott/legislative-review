'use strict';

const React = require('react');

module.exports = (text, title) => {
	let titleBar = (title !== undefined) ? <h1>{{ title }}</h1> : null;

	return (
		<div className="modal">
			{{titleBar}}
			<div className="body">{{text}}</div>
			<footer className="modal">
				<button onClick={onClose}>Close</button>
			</footer>
		</div>
	);
};

function onClose() {
	alert('close');
}

