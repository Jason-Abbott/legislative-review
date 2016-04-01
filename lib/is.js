'use strict';

module.exports = {
	value: x => (x !== undefined && x !== null),
	defined: (object, field) => typeof(object[field]) !== 'undefined',
	empty: x => !this.value(x) || x === '',
	array: x => this.value(x) && x instanceof Array
};