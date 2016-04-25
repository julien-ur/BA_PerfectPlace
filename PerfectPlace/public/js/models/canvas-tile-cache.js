(function (window) {
	'use strict';

	function CanvasTileCache() {
		this.cache = {};
	}

	CanvasTileCache.prototype.saveTile = function(tile, x, y, zoom) {
		if (this.cache[zoom] === undefined) this.cache[zoom] = {};
		if (this.cache[zoom][y] === undefined) this.cache[zoom][y] = {};
		
		this.cache[zoom][y][x] = tile;
	};

	CanvasTileCache.prototype.getTile = function(x, y, zoom) {
		if(this.cache[zoom] && this.cache[zoom][y]) {
			return this.cache[zoom][y][x];
		}
		return undefined;
	};

	CanvasTileCache.prototype.removeTile = function(x, y, zoom) {
		if(this.cache[zoom] && this.cache[zoom][y]) {
			delete this.cache[zoom][y][x];
		}
	};

	window.PerfectPlace = window.PerfectPlace || {};
	window.PerfectPlace.CanvasTileCache = CanvasTileCache;

}(window));