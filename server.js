'use strict';

// Node Express application

require('dotenv').config();

const G = require('./lib');
const express = require('express');
const massive = require('massive');
const mode = process.env['NODE_ENV'];
const port = process.env['PORT'] | 3000;

console.info('Connecting to PostgreSQL');

massive.connect({ connectionString: G.config.db.connectionString }, (err, db) => {
	// database structure is parsed so the callback takes a moment
	if (err === null) {
		G.db = db;
	} else {
		console.error(err);
	}

	G.app = express();
	G.app.use(require('./lib/middleware/json-response'));
	G.app.use(express.static(__dirname + '/dist'));

	// initialize routes
	require('./lib/sections/api-routes');
	console.info("Starting JSON-Services in %s mode on port %s", mode, port);
	G.app.listen(port);
});