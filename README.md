# Setup

1. Install current node.js
2. Run `npm install` from the project folder

### Project Structure
 * __db__: JSON resources
 * __dist__: Distribution folder for web assets (default for [Browserify](http://browserify.org/))
 * __lib__: Isomorphic Javscript library run under [Node.js](https://nodejs.org/en/) on the server and minified to `/dist/app.js` for the browser
    * __components__: React components
    * __flux__: Simple implementation of the [Flux](https://facebook.github.io/flux/docs/overview.html) data flow pattern
    * __middleware__: Node [Express](http://expressjs.com/) middleware
    * __views__: Routing, views and endpoints
 * __node_modules__: [npm](https://www.npmjs.com/) installed module dependencies defined in `/package.json`
 * __src__: source for web assets other than Javascript
 * __test__: [Mocha](http://mochajs.org/) tests

# Design and Layout

Plain HTML page parts may be defined and edited within the `/dist/partials` folder. This simplifies
management and reduces the application package size. To include `/dist/partials/privacy.html` in
the `Something` component, for example, do 

```javascript
const React = require('react');
const Static = require('../components/static');

class Something extends React.Component {
    render() {
        return <div><Static name="privacy"/></div>;
    }
}
```


### Fonts

Fonts may be specified, downloaded, inlined and minifed with [webfont-dl](https://github.com/mmastrac/webfont-dl).
An npm script called `build:font` is defined in `package.json` for this purpose. The script builds a .css file that
will then be incorporated into the main site CSS with the `build:css` npm script.

# Development
### Node
`node server.js` from the project folder

### React
`npm run watch` to package .js and .less while editing

Components that constitute an entire view (typically all the space between header and footer) extend
React.Component in order to use the `*componentDid*` lifecycle methods to load and
persist state. Child components should not manage their own state and therefore can
be plain Javascript objects.

### Prefer
 * Plain Javascript without magic (unnecessary abstrations)
 * Readability
 * Complete test coverage
 * Functional style
 * Isomorphism
 * Native formats to transpiling