'use strict';

const node = module;
const babel = require('babel-core');
const fs = require('fs');
const original = require.extensions['.js'];
// http://babeljs.io/docs/usage/options/
const options = {
	plugins: ['syntax-jsx','transform-react-jsx'],
	babelrc: false
};

// borrowed from https://github.com/babel/babel-jest/blob/master/index.js
require.extensions['.js'] = function(module, filename) {
	if (notIn(filename, ['node_modules','tasks'])) {
		let compiled = babel.transformFileSync(filename, options).code;
		module._compile(compiled, filename);
		return module;
	} else {
		return original(module, filename);
	}
};

function notIn(filename, folders) {
	return folders.find(f => filename.indexOf('/' + f + '/') >= 0) === undefined;
}