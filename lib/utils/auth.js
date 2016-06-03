'use strict';

const firebase = require('firebase');
const config = require('../config');

firebase.initializeApp(config.db);

function done() {
   return false;
}

module.exports = { done };
