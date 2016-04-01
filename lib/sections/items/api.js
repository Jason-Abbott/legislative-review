'use strict';

const G = require('../../');

exports.list = itemType => {
	// execute [itemType]-list.sql from /db folder
	return (req, res) => {
		G.db[itemType + '-list']([1, null], (err, matches) => {
			if (err === null) {
				res.sendJson(matches.map(m => {
					m.name = m.name.replace('/^\n+', '');
					return m;
				}));
			} else {
				console.error(err);
				res.sendJson(err);
			}
		});
	} 
};