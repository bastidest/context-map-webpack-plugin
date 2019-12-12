# context-map-webpack-plugin

> Webpack plugin to map dynamic (thirdparty) dependencies to a static context map.


## Install

```bash
npm install -D context-map-webpack-plugin
```

## Why do I need it / What does it do?

### The Problem

Some (thirdparty) code requires other files with expressions that
cannot be resolved by webpack at compile-time. Webpack tries to
generate a regular expression that determines which files to include
in the webpack bundle. In more complex expressions, webpack is unable
to determine which files to include, thus an empty context map will be
created.

A dynamic import that cannot be resolved might look like this:

```js
// ...
var FILES = UglifyJS.FILES = [
    "../lib/utils.js",
    "../lib/ast.js",
    "../lib/parse.js",
    "../lib/transform.js",
    "../lib/scope.js",
    "../lib/output.js",
    "../lib/compress.js",
    "../lib/sourcemap.js",
    "../lib/mozilla-ast.js",
    "../lib/propmangle.js",
    "./exports.js",
].map(function(file){
    return require.resolve(file);
});
// ...
```

Your webpack build will probably have this `Critical dependency` warning:

```
WARNING in ./node_modules/uglify-js/tools/node.js 24:11-32
Critical dependency: the request of a dependency is an expression
 @ ./node_modules/pug-filters/lib/run-filter.js
 @ ./node_modules/pug-filters/index.js
 @ ./node_modules/pug/lib/index.js
 @ ./src/server/PugHandler.ts
 @ ./src/server/Router.ts
 @ ./src/server/index.ts
 @ multi ./src/server/index.ts webpack/hot/poll?1000
```

This will result in a bundle output that looks like this:

```
// ...
***/ "./node_modules/uglify-js/tools sync recursive":
/*!*******************************************!*\
  !*** ./node_modules/uglify-js/tools sync ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function webpackEmptyContext(req) {\n\tvar e = new Error(\"Cannot find module '\" + req + \"'\");\n\te.code = 'MODULE_NOT_FOUND';\n\tthrow e;\n}
// ...
```

This empty context will lead to runtime errors:

```
node ./dist/server/main.js
undefined:4
	throw e;
	^

Error: Cannot find module '../lib/utils.js'
    at Function.webpackEmptyContext [as resolve] (eval at ./node_modules/uglify-js/tools sync recursive (<project_dir>/dist/server/main.js:5371:1), <anonymous>:2:10)
// ...
```

### The Solution

Create a static context map in compile-time in order to include all
required dependencies. You are required to investigate all possible
runtime values of the required argument where the error originates
from. These values have to be passed as the `staticImports` argument
in the plugin constructor.


### Alternatives

If you use webpack for the backend, you can exclude the required files
from the webpack bundle and depend on node_mdules by using
[webpack-node-externals](https://www.npmjs.com/package/webpack-node-externals).


## Usage

In your webpack configuration:

```js
const ContextMapPlugin = require('context-map-webpack-plugin');

module.exports = {
  // ...
  plugins: [
    new ContextMapPlugin(contextPath, staticImports)
  ],
  // ...
};
```

## Parameters

### `contextPath`

- Type: `String`
- Default: `undefined`

Specify the directory in which to create/overwrite the context map.


### `staticImports`

- Type: `Array[String]`
- Default: `undefined`

Static imports that will be written to the context map (and bundled with webpack at compile-time).


## Example (uglify-js)
```js
  // ...
  plugins: [
    new ContextMapPlugin('node_modules/uglify-js/tools', [
      '../lib/utils.js',
      '../lib/ast.js',
      '../lib/parse.js',
      '../lib/transform.js',
      '../lib/scope.js',
      '../lib/output.js',
      '../lib/compress.js',
      '../lib/sourcemap.js',
      '../lib/mozilla-ast.js',
      '../lib/propmangle.js',
      './exports.js',
    ])
  ],
  // ...
```

## License

[MIT](./LICENSE)
