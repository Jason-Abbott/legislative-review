'use strict';

module.exports = {
	db: {
		user: process.env['DATABASE_USER'],
		password: process.env['DATABASE_PASSWORD'],
		host: process.env['DATABASE_HOST'],
		name: process.env['DATABASE_NAME'],

		get connectionString() {
			return `postgres://${this.user}:${this.password}@${this.host}/${this.name}`
		}
	},

	api: {
		url: '/',
		key: null
	},

	partials: {
		url: '/partials/'
	}
};
