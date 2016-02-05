module.exports = function(layer, filename) {
	return {
		name: layer + '/' + filename,
		serve: function(server, req, callback) {
			var mock = req.clone();
			mock.method = 'GET';
			mock.layer = layer;
			mock.filename = filename;
			mock.headers = {};
			if (req.headers['x-tilestrata-skipcache']) {
				mock.headers['x-tilestrata-skipcache'] = req.headers['x-tilestrata-skipcache'];
			}

			server.serve(mock, false, function(status, buffer, headers) {
				if (status === 200) {
					// don't propagate the cache-hit header (because technically
					// this provider is serving a "new" tile)
					if (headers) delete headers['X-TileStrata-CacheHit'];

					callback(null, buffer, headers);
				} else {
					var message = 'Tile unavailable (status ' + status + ')';
					if (buffer.length < 1024) message = buffer.toString('utf8');
					var err = new Error(message);
					err.statusCode = status;
					callback(err);
				}
			});
		}
	};
};
