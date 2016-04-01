'use strict';

// Node Express middleware

module.exports = (req, res, next) => {
	res.sendJson = o => {
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(o));
	};
	next();
};