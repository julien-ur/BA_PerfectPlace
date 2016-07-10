(function(window) {
	'use strict';

	function CanvasTileRenderer(category, distance, distanceReversed, tileSize, tileCache) {
		this.category = category;
		this.distance = distance;
		this.distanceReversed = distanceReversed;
		this.tileSize = tileSize;

		this.pendingTileRequests = [];
		this.tileCache = tileCache;
		this.updatingCache = false;
		this.maxAttempts = 3;

		this.zoomAdjustment = Math.log(this.tileSize / 256) / Math.log(2);
		GlobalMapTiles.setTileSize(tileSize);
	}

	CanvasTileRenderer.prototype.updateSettings = function (category, distance, distanceReversed) {
		this.category = category;
		this.distance = distance;
		this.distanceReversed = distanceReversed;
	};

	CanvasTileRenderer.prototype.drawTile = function(rawCanvas, tilePoint, zoom, mapBounds, mapCenter, attempt) {
		var cachedCanvasTile = this.tileCache.getTile(tilePoint.x, tilePoint.y, zoom);
		console.log("chached", !!cachedCanvasTile, "z", zoom, "x", tilePoint.x, "y", tilePoint.y, "attempt", (attempt) ? attempt : 0);

		if (cachedCanvasTile) {
			console.time('draw final');
			var ctx = rawCanvas.getContext('2d');
			ctx.drawImage(cachedCanvasTile, 0, 0);
			console.timeEnd('draw final');

			this.tileCache.removeTile(tilePoint.x, tilePoint.y, zoom);

		} else {
			this.pendingTileRequests.push({
				rawCanvas: rawCanvas,
				point: tilePoint,
				zoom: zoom,
				mapBounds: mapBounds,
				mapCenter: mapCenter,
				attempt: (attempt) ? attempt : 0
			});

			if (!this.updatingCache) {
				var that = this;
				this._generateAndCacheTilesForViewport(zoom - this.zoomAdjustment, mapBounds, mapCenter, function() {
					that._handlePendingTileRequests();
				})
			}
		}
	};
	
	CanvasTileRenderer.prototype._generateAndCacheTilesForViewport = function(zoom, mapBounds, mapCenter, callback) {
		this.updatingCache = true;
		
		var bvb = this._getBufferedViepwortBounds(zoom, mapBounds, mapCenter);
	    var requiredTilesInfo = GlobalMapTiles.GetTiles(zoom, [bvb.minLat, bvb.minLon], [bvb.maxLat, bvb.maxLon]);
	    console.log(requiredTilesInfo);

	   	var that = this;
		console.time('fetch tiles');
		that._fetchAndDrawTilesForBufferedViewport(zoom, requiredTilesInfo, function() {
			console.timeEnd('fetch tiles');

			console.time('create viewportCanvas');
			var viewportCanvas = that._createViewportCanvas(zoom, requiredTilesInfo);
			console.timeEnd('create viewportCanvas');

			console.time('calc filterSize');
			var filterSize = that._convertDistanceToPixels(zoom, mapCenter);
			console.timeEnd('calc filterSize');

			console.time('blur viewport');
			// that._blurCanvas(viewportCanvas, filterSize);
			console.timeEnd('blur viewport');

			console.time('slice viewport');
			that._sliceViewportCanvasIntoTilesAndSaveToCache(viewportCanvas, zoom + that.zoomAdjustment, requiredTilesInfo, function() {
				console.timeEnd('slice viewport');

				console.time('_handlePendingTileRequests');
				that.updatingCache = false;
				callback();
				console.timeEnd('_handlePendingTileRequests');
			});
		});
	};

	
	CanvasTileRenderer.prototype._getBufferedViepwortBounds = function(zoom, mapBounds, mapCenter) {
		var actMetersPerPixel = GlobalMapTiles.LatToRes(zoom, mapCenter.lat),
			minBufferDist = actMetersPerPixel * 10,
			bufferDistance = Math.max(this.distance, minBufferDist),

			upperLeft = GlobalMapTiles.LatLonToMeters(mapBounds.getNorth(), mapBounds.getWest()),
			bottomRight = GlobalMapTiles.LatLonToMeters(mapBounds.getSouth(), mapBounds.getEast()),
		
			north = GlobalMapTiles.MetersToLatLon(upperLeft[0], upperLeft[1]+bufferDistance)[0],
			west = GlobalMapTiles.MetersToLatLon(upperLeft[0]-bufferDistance, upperLeft[1])[1],
			south = GlobalMapTiles.MetersToLatLon(bottomRight[0], bottomRight[1]-bufferDistance)[0],
			east = GlobalMapTiles.MetersToLatLon(bottomRight[0]+bufferDistance, bottomRight[1])[1],

			bbox = {
				minLat: south,
				minLon: west,
				maxLat: north,
				maxLon: east
			};

		return bbox;
	};

	CanvasTileRenderer.prototype._fetchAndDrawTilesForBufferedViewport = function(zoom, requiredTilesInfo, callback) {
		var tileCount = requiredTilesInfo.rows * requiredTilesInfo.cols;
		var counter = 1;

		for(var y = requiredTilesInfo.maxY; y >= requiredTilesInfo.minY; y--) {
			for(var x = requiredTilesInfo.minX; x <= requiredTilesInfo.maxX; x++) {

				this._fetchAndDrawTile(x, y, zoom, requiredTilesInfo.minX, requiredTilesInfo.minY, 0, function(){
					console.log(counter, tileCount);
					if (tileCount <= counter++) callback();
				});
			}
		}
	};

	CanvasTileRenderer.prototype._fetchAndDrawTile = function(x, y, zoom, minX, minY, attempt, callback) {
		var url = "http://localhost:8000/tiles/" + this.category + "/" + zoom + "/" + x + "/" + y + "/tile.json";

		$.ajax({
			url: url,
			context: this
		}).done(function(tileString, textStatus, jqXHR) {

			try {
				this._convertAndDrawTile(tileString, x, y, zoom, minX, minY);
			} catch (e) {
				console.log(e);
			}

			callback();

		}).fail(function(jqXHR) {
			console.log(jqXHR);

			// if(attempt++ >= 2) {
				var canvasTile = $('<canvas/>').get(0);
				canvasTile.height = this.tileSize;
				canvasTile.width = this.tileSize;

				var ctx = canvasTile.getContext('2d');
				ctx.fillStyle = 'red';
				ctx.fillRect(0, 0, canvasTile.width, canvasTile.height);

				this.tileCache.saveTile(canvasTile, x, y, zoom);

				callback();
			// }
			// else this._fetchAndDrawTile(x, y, zoom, minX, minY, attempt, callback);
		})
	};

	CanvasTileRenderer.prototype._convertAndDrawTile = function(tileString, x, y, zoom, minX, minY) {
		var tileData = JSON.parse(tileString);
		tileData = this._convertToGeoJSONStandard(tileData);

		console.time('buffer tiles');
		tileData = this._bufferFeaturePolygons(tileData);
		console.timeEnd('buffer tiles');

		this._drawTileOnCanvasAndSaveInCache(tileData, x, y, zoom, minX, minY);
	};

	CanvasTileRenderer.prototype._convertToGeoJSONStandard = function(tile) {
		var features = tile.features;
		var convertedFeatures = [];

		for (var i = 0; i < features.length; i++) {
		    var feature = features[i];

		    var type;
		    var coords;

		    switch (feature.type) {
		    	case 1:
		    		type = 'Point';
		    		coords = feature.geometry[0];
		    		break;

		    	case 2:
		    		type = 'LineString';
		    		coords = feature.geometry[0];
		    		break;

		    	case 3:
		    		type = 'Polygon';
					for (var j = 0; j < feature.geometry.length; j++) {
						if (feature.geometry[j].length == 3) {
							feature.geometry[j].push(feature.geometry[j][2]);
						} else if (feature.geometry[j].length == 2) {
							feature.geometry[j].push(feature.geometry[j][0]);
							feature.geometry[j].push(feature.geometry[j][0]);
						}
					}
		    		coords = feature.geometry;
		    		break;
		    }

		    feature = {
			    "type": "Feature",
			    "properties": {},
			    "geometry": {
			      "type": type,
			      "coordinates": coords
			  	}
		    };

		    convertedFeatures.push(feature);
		}

		var ftColl = {
			"type": "FeatureCollection",
			"features": convertedFeatures
		};

		return ftColl;
	};

	CanvasTileRenderer.prototype._bufferFeaturePolygons = function(tileData) {
		if(this.distance > 0) {
			var unit = 'meters';
			return turfBuffer(tileData, this.distance, unit);
		} else {
			return tileData;
		}
	};

	CanvasTileRenderer.prototype._drawTileOnCanvasAndSaveInCache = function(tileData, x, y, zoom, minX, minY) {
		var canvasTile = $('<canvas/>').get(0);
			canvasTile.height = this.tileSize;
			canvasTile.width = this.tileSize;

		var ctx = canvasTile.getContext('2d');
			ctx.fillStyle = 'black';
			ctx.fillRect(0, 0, canvasTile.width, canvasTile.height);

			ctx.fillStyle = 'white';
			ctx.strokeStyle = 'white';

		var col = (x - minX) + 1;
		var row = (y - minY) + 1;
		var z2 = (1 << zoom);
		console.log(col, row, x, y, zoom);

        var features = (tileData.features) ? tileData.features : tileData ;
		if (!features)  console.log(tileData);

        for (var featureNum = 0; featureNum < features.length; featureNum++) {
	    	var feature = features[featureNum],
				geom = feature.geometry,
				type = geom.type;

			ctx.beginPath();

			for (var i = 0; i < geom.coordinates.length; i++) {
				var coords = geom.coordinates;

		        if (type === 'Point') {
		        	coords = this._convertCoords(coords, minX, minY, z2);
					ctx.arc(coords[0], coords[1], 2, 0, 2*Math.PI);
		            continue;
		        }

		        if (type === 'Polygon') {
		        	coords = coords[i];
		        }

		        for (var j = 0; j < coords.length; j++) {
	        	    var p = coords[j];
	        	    p = this._convertCoords(p, x, y, z2);
					if (j) ctx.lineTo(p[0], p[1]);
					else ctx.moveTo(p[0], p[1]);
	        	}
		    }

			if (type === 'Polygon' || type === 'Point') ctx.fill('evenodd');

			ctx.stroke();
		}

		this.tileCache.saveTile(canvasTile, x, y, zoom);
	};

	CanvasTileRenderer.prototype._convertCoords = function(p, tx, ty, z2) {

		var sin = Math.sin((p[1] * Math.PI) / 180),
    	    x = (p[0] / 360) + 0.5,
    	    y = 0.5 - (0.25 * Math.log((1 + sin) / (1 - sin))) / Math.PI;

    	    y = y < -1 ? -1 :
    	        y > 1 ? 1 : y;

    		x = Math.round(this.tileSize * (x * z2 - tx));
    		y = Math.round(this.tileSize * (y * z2 - ty));

	    return [x, y];
	};

	CanvasTileRenderer.prototype._createViewportCanvas = function (zoom, requiredTilesInfo) {
		var tileSize = this.tileSize;
		var viewportCanvas = $('<canvas/>').get(0);
			viewportCanvas.height = requiredTilesInfo.rows * tileSize;
			viewportCanvas.width = requiredTilesInfo.cols * tileSize;
		var viewportCtx = viewportCanvas.getContext("2d");

		for(var y = requiredTilesInfo.maxY; y >= requiredTilesInfo.minY; y--) {
			for (var x = requiredTilesInfo.minX; x <= requiredTilesInfo.maxX; x++) {

				var col = (x - requiredTilesInfo.minX);
				var row = (y - requiredTilesInfo.minY);

				var canvasTile = this.tileCache.getTile(x, y, zoom);
				if (canvasTile) viewportCtx.drawImage(canvasTile, col * tileSize, row * tileSize);
				else console.log(x, y, zoom);
			}
		}
		return viewportCanvas;
	};

	CanvasTileRenderer.prototype._convertDistanceToPixels = function(zoom, mapCenter) {
		var viewportCenterInMeters = GlobalMapTiles.LatLonToMeters(mapCenter.lat, mapCenter.lng);
		var mx = viewportCenterInMeters[0];
		var my = viewportCenterInMeters[1];

		var pixelsNorth = GlobalMapTiles.MetersToPixels(mx, my - this.distance/2, zoom);
		var pixelsSouth = GlobalMapTiles.MetersToPixels(mx, my + this.distance/2, zoom);
		var pixelDistance = pixelsSouth[1] - pixelsNorth[1];
		// console.log(pixelDistance);

		// var actMetersPerPixel = GlobalMapTiles.LatToRes(zoom, mapCenter.lat);
		// var pixelDistance = 1/actMetersPerPixel * this.distance;
		// console.log(pixelDistance);

		return pixelDistance;
	};

	CanvasTileRenderer.prototype._blurCanvas = function(viewportCanvas, size) {
		var ctx = viewportCanvas.getContext("2d");
		var imgData = ctx.getImageData(0, 0, viewportCanvas.width, viewportCanvas.height);

		var redChannel = [];

		for (var i = 0; i < imgData.data.length; i+=4) {
			redChannel.push(imgData.data[i]);
		}

		var blurredRedChannel = [];

		console.time('fastgaussblur');
		FastGaussBlur.apply(redChannel, blurredRedChannel, viewportCanvas.width, viewportCanvas.height, size);
		console.timeEnd('fastgaussblur');

		for (var i = 0; i < imgData.data.length; i+=4) {
			var colorValue = blurredRedChannel[i/4];
			imgData.data[i] = colorValue;
			imgData.data[i+1] = colorValue;
			imgData.data[i+2] = colorValue;
		}

		ctx.putImageData(imgData, 0, 0);
	};

	CanvasTileRenderer.prototype._sliceViewportCanvasIntoTilesAndSaveToCache = function(viewportCanvas, zoom, requiredTilesInfo, callback) {

		var tileSize = this.tileSize;
		for (var row = 0; row < requiredTilesInfo.rows; row++) {
	    	for (var col = 0; col < requiredTilesInfo.cols; col++) {

			    var canvasTile = $('<canvas/>').get(0);
			    canvasTile.height = tileSize;
			    canvasTile.width = tileSize;

			    var ctx = canvasTile.getContext('2d');
			    ctx.drawImage(viewportCanvas, col*tileSize, row*tileSize, tileSize, tileSize, 0, 0, tileSize, tileSize);

				this.tileCache.saveTile(canvasTile, requiredTilesInfo.minX + col, requiredTilesInfo.minY + row,  zoom);
			}
		}
		// this.tileCache.saveTile(this.viewportCanvas, requiredTilesInfo.minX, requiredTilesInfo.minY, zoom);

		callback();
	};

	CanvasTileRenderer.prototype._handlePendingTileRequests = function() {
		var pendingTileRequests = Object.create(this.pendingTileRequests);
		this.pendingTileRequests = [];

		for (var i = 0; i < pendingTileRequests.length; i++) {
			var tileRequest = pendingTileRequests[i];

			if(tileRequest.attempt >= this.maxAttempts) continue;
			this.drawTile(tileRequest.rawCanvas, tileRequest.point, tileRequest.zoom, tileRequest.mapBounds, tileRequest.mapCenter, tileRequest.attempt+1);
		}
	};

	window.PerfectPlace = window.PerfectPlace || {};
	window.PerfectPlace.CanvasTileRenderer = CanvasTileRenderer;

}(window));