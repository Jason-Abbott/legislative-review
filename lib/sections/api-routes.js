'use strict';

// Node Express routing

const G = require('./../index');
const Router = require('express').Router;
const path = require('path');
const root = { root: path.join(__dirname, '../../dist') };

G.app.use(/^\/(api\/objects|item)/, itemRoutes());
G.app.get('/api/team', (req, res) => { res.sendJson(require('../../db/team.json')) });
// display web application for all other routes
G.app.use((req, res) => { res.sendFile('app.html', root) });

function itemRoutes() {
	let r = Router();
	let c = require('./items/api');

	r.get(/\/(paged\/)?waypoints/, c.list(G.type.WAYPOINT));

	return r;
}

function userRoutes() {
	// let r = Router();
	// let c = require('./user/controller');
	//
	// r.get(/\/(paged\/)?waypoints/, c.list(G.type.WAYPOINT));
	//
	// return r;
}