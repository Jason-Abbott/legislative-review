'use strict';

// Flux style actions

const G = require('../../index');

module.exports = {
	listWaypoints: ()=> ({ type: G.action.WAYPOINT_REQUEST }),
	listTracks: ()=> ({ type: G.action.TRACK_REQUEST }),
	sort: (field, direction) => ({
		type: G.action.SORT_ITEMS,
		field: field,
		direction: direction
	})
};
