var tilestrata = require('tilestrata');
var TileServer = tilestrata.TileServer;
var TileRequest = tilestrata.TileRequest;
var dependency = require('../index.js');
var assert = require('chai').assert;

describe('Provider Implementation "dependency"', function() {
	it('should set "name"', function() {
		assert.equal(dependency('basemap', 'tile.txt').name, 'basemap/tile.txt');
	});
	describe('serve()', function() {
		it('should attach statusCode property to errors', function(done) {
			var server = new TileServer();
			var provider = dependency('basemap', 'tile.txt');
			var req = TileRequest.parse('/basemap/3/2/1/tile.txt', {'x-tilestrata-skipcache':'1','x-random':'1'}, 'HEAD');
			provider.serve(server, req, function(err, buffer, headers) {
				assert.instanceOf(err, Error);
				assert.equal(err.statusCode, 404);
				done();
			});
		}),
		it('should fetch and return dependency', function(done) {
			var server = new TileServer();
			server.layer('basemap').route('tile.txt').use({
				serve: function(server, req, callback) {
					assert.equal(req.method, 'GET');
					assert.deepEqual(req.headers, {'x-tilestrata-skipcache':'basemap/tile.txt'});
					callback(null, new Buffer('Test dependency', 'utf8'), {'X-Test': 'header'});
				}
			});

			var provider = dependency('basemap', 'tile.txt');
			var req = TileRequest.parse('/layer/3/2/1/tile.txt', {'x-tilestrata-skipcache':'basemap/tile.txt','x-random':'1'}, 'HEAD');
			provider.serve(server, req, function(err, buffer, headers) {
				assert.isFalse(!!err);
				assert.instanceOf(buffer, Buffer);
				assert.equal(buffer.toString('utf8'), 'Test dependency');
				assert.equal(headers['X-Test'], 'header');
				done();
			});
		});
	});
});
