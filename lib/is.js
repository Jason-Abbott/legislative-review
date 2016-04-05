'use strict';

exports.value = x => (x !== undefined && x !== null);
exports.defined = (object, field) => typeof(object[field]) !== 'undefined';
exports.empty = x => !exports.value(x) || x === '';
exports.array = x => exports.value(x) && x instanceof Array;