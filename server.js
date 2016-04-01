'use strict';

// Node Express application

const L = require('./lib');
const express = require('express');
const mode = process.env['NODE_ENV'];
const path = require('path');
const port = process.env['PORT'] || 3000;
const root = { root: path.join(__dirname, './dist') };

L.app = express();
L.app.use(require('./lib/middleware/json-response'));
L.app.use(express.static(__dirname + '/dist'));
L.app.use((req, res) => { res.sendFile('app.html', root) });

console.info("Starting Legislative Review service in %s mode on port %s", mode, port);

L.app.listen(port);