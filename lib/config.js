'use strict';

module.exports = {
	db: {
		databaseURL: 'https://legislative-review.firebaseio.com/',
		authDomain: 'legislative-review.firebaseapp.com',
		//authDomain: 'admin.idahovalues.local',
		apiKey: 'AIzaSyAUfO5GxhPK0dTn6TEJvP2vOhZogwTT_i0',
		serviceAccount: {
			projectId: "firebase-legislative-review",
			clientEmail: null,
			privateKey: null
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
