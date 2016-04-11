'use strict';

// Task prototype
// Values are in milliseconds

module.exports = {
	timer: 0,
	startDelay: 0,
	repeat: false,
	repeatTimes: 0,
	repeatDelay: 0,
	repeatUntil: null,
	count: 0,
	lastRun: null,

	// convert to milliseconds
	minutes(m) { return m * 60 * 1000; },
	seconds(s) { return s * 1000; },

	start() {
		function queue() {
			this.run();
			this.count++;
			this.lastRun = new Date();
			if (this.repeat && this.repeatTimes > this.count && this.repeatDelay > 0 &&
				(this.repeatUntil == null || (new Date()) < this.repeatUntil)) {

				this.timer = setTimeout(queue, this.repeatDelay);
			}
		}
		if (this.startDelay > 0) {
			this.timer = setTimeout(queue.bind(this), this.startDelay);
		} else {
			queue.call(this);
		}
	},

	stop() {
		//if (this.timer) { }
	},

	run() {}
};