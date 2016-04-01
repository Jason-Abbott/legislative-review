'use strict';

const React = require('react');
const Grid = (rows) => (
	<table>
		<tr>
			<td>Test</td>
		</tr>
	{rows.map(r =>
		<tr>
			<td>{{r}}</td>
		</tr>
	)}
	</table>
);

Grid.propTypes = {
	rows: React.PropTypes.array.isRequired
};

module.exports = Grid;
