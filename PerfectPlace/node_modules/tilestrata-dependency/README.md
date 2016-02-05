# tilestrata-dependency
[![NPM version](http://img.shields.io/npm/v/tilestrata-dependency.svg?style=flat)](https://www.npmjs.org/package/tilestrata-dependency)
[![Build Status](https://travis-ci.org/naturalatlas/tilestrata-dependency.svg)](https://travis-ci.org/naturalatlas/tilestrata-dependency)
[![Coverage Status](http://img.shields.io/coveralls/naturalatlas/tilestrata-dependency/master.svg?style=flat)](https://coveralls.io/r/naturalatlas/tilestrata-dependency)

A [TileStrata](https://github.com/naturalatlas/tilestrata) plugin for loading another layer tile as a source, which is particularly useful for cases when you want to be able to serve a rendered result in multiple formats.

```sh
$ npm install tilestrata-dependency --save
```

### Sample Usage

```js
var dependency = require('tilestrata-dependency');

server.layer('mylayer').route('tile.png')
	.use(/* provider */);

server.layer('mylayer').route('tile.jpg')
    .use(dependency('mylayer', 'tile.png'))
    .use(/* transform */)
```

## Contributing

Before submitting pull requests, please update the [tests](test) and make sure they all pass.

```sh
$ npm test
```

## License

Copyright &copy; 2014-2015 [Natural Atlas, Inc.](https://github.com/naturalatlas) & [Contributors](https://github.com/naturalatlas/tilestrata-dependency/graphs/contributors)

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at: http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
