'use strict';

const node = module;
const babel = require('babel-core');
const fs = require('fs');
const original = require.extensions['.js'];
const skip = /(\/node_modules\/|\/tasks\/|\/utils\/)/;
// http://babeljs.io/docs/usage/options/
const options = {
	plugins: ['syntax-jsx','transform-react-jsx'],
	babelrc: false
};

// borrowed from https://github.com/babel/babel-jest/blob/master/index.js
require.extensions['.js'] = function(module, filename) {
	if (skip.test(filename)) {
		return original(module, filename);
	} else {
		let compiled = babel.transformFileSync(filename, options).code;
		module._compile(compiled, filename);
		return module;
	}
};