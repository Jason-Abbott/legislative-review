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
	if (filename.indexOf('node_modules') === -1) {
		let compiled = babel.transformFileSync(filename, options).code;
		module._compile(compiled, filename);
		return module;
	} else {
		let x = original(module, filename);
		return x;
	}
};