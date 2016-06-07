'use strict';

// display static server content
// https://facebook.github.io/react/tips/dangerously-set-inner-html.html

const { config, is } = require('../');
const cache = {};
const React = require('react');
const http = require('superagent');
class Static extends React.Component {
	constructor(props) {
		super(props);
		// pattern required by dangerouslySetInnerHTML
		let html = { __html: '' };

		this.fileName = this.props['name'];
		this.useCache = this.props['cache'];
		this.cacheHit = false;

		if (this.useCache && is.defined(cache, this.fileName)) {
			html = cache[this.fileName];
			this.cacheHit = true;
		}
		this.state = { content: html };
	}

	componentDidMount() {
		if (this.cacheHit) { return; }
		// load content from server if not already cached
		http
			.get(config.partials.url + this.fileName + '.html')
			.end((err, res) => {
				if (err === null) {
					let html = { __html: res.text };
					this.setState({ content: html });
					if (this.useCache) { cache[this.fileName] = html; }
				}
			});
	}

	render() {
		return <div dangerouslySetInnerHTML={this.state.content}></div>
	}
}

Static.defaultProps = { name: null, cache: true };

module.exports = Static;
