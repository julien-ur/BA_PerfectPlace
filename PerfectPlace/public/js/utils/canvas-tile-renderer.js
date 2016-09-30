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
		// console.log("chached", !!cachedCanvasTile, "z", zoom, "x", tilePoint.x, "y", tilePoint.y, "attempt", (attempt) ? attempt : 0);

		if (cachedCanvasTile) {

			var ctx = rawCanvas.getContext('2d');
			ctx.drawImage(cachedCanvasTile, 0, 0);
			this.tileCache.removeTile(tilePoint.x, tilePoint.y, zoom);

		} else {

			// $(rawCanvas).attr('id', tilePoint.x + '-' + tilePoint.y);

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
				this._generateAndCacheTilesForViewport(zoom - this.zoomAdjustment, mapBounds, mapCenter, function(requiredTilesInfo) {
					that._handlePendingTileRequests();
				})
			}
		}
	};
	
	CanvasTileRenderer.prototype._generateAndCacheTilesForViewport = function(zoom, mapBounds, mapCenter, callback) {
		this.updatingCache = true;

		var unbufferedTilesInfo = GlobalMapTiles.GetTiles(zoom, [mapBounds.getSouth(), mapBounds.getWest()], [mapBounds.getNorth(), mapBounds.getEast()]);
        var bvb = this._getBufferedViewportBounds(zoom, unbufferedTilesInfo);
		// console.log("bbox", bvb);
	    var requiredTilesInfo = GlobalMapTiles.GetTiles(zoom, [bvb.minLat, bvb.minLon], [bvb.maxLat, bvb.maxLon]);
		console.log(requiredTilesInfo);

	   	var that = this;
		console.time('fetch tiles');
		that._fetchTilesAndGenerateFeautureColl(zoom, requiredTilesInfo, function(featureCollection) {
			console.timeEnd('fetch tiles');

			console.time('buffer tiles');
			var bufferedFtColl = that._bufferFeaturePolygons(featureCollection);
			console.timeEnd('buffer tiles');

			console.time('draw Canvas');
			var viewportCanvas = that._getDrawnViewportCanvas(bufferedFtColl, zoom, requiredTilesInfo);
			console.timeEnd('draw Canvas');

			if($('#blur-filter-checkbox').is(':checked')) {
				console.time('calc filterSize');
				var filterSize = that._convertDistanceToPixels(zoom, mapCenter, mapBounds);
				console.timeEnd('calc filterSize');

				console.time('blur viewport');
				that._blurCanvas(viewportCanvas, filterSize/3);
				console.timeEnd('blur viewport');
			}

			console.time('slice viewport');
			that._sliceViewportCanvasIntoTilesAndSaveToCache(viewportCanvas, zoom + that.zoomAdjustment, requiredTilesInfo, unbufferedTilesInfo, function() {
				console.timeEnd('slice viewport');

				console.time('handlePendingTileRequests');
				that.updatingCache = false;
				callback(requiredTilesInfo);
				console.timeEnd('handlePendingTileRequests');
			});
		});
	};

	CanvasTileRenderer.prototype._getBufferedViewportBounds = function(zoom, unbufferedTilesInfo) {
		var bufferDistance = this.distance + 10,
			tileSize = this.tileSize;

		// Convert Google Address Index to TMS (flipped y)
		var minY = (1 << zoom) - unbufferedTilesInfo.minY - 1,
			maxY = (1 << zoom) - unbufferedTilesInfo.maxY - 1;

		var upperLeft = GlobalMapTiles.PixelsToMeters( unbufferedTilesInfo.minX * tileSize, (minY + 1) * tileSize , zoom ),
			bottomRight = GlobalMapTiles.PixelsToMeters( (unbufferedTilesInfo.maxX + 1) * tileSize, maxY * tileSize + 1, zoom );

		var northWest = GlobalMapTiles.MetersToLatLon( upperLeft[0], upperLeft[1] ),
			southEast = GlobalMapTiles.MetersToLatLon( bottomRight[0], bottomRight[1] );

		var bbox = [southEast[0], northWest[1], northWest[0], southEast[1]];
		var poly = turf.bboxPolygon(bbox);
		var bufferedPoly = turf.buffer(poly, this.distance, 'meters');
		var bufferedBbox = turf.bbox(bufferedPoly);

		return {
			minLat: bufferedBbox[0],
			minLon: bufferedBbox[1],
			maxLat: bufferedBbox[2],
			maxLon: bufferedBbox[3]
		};

		// console.log("turf bbox", bufferedBbox);

		var northWest = GlobalMapTiles.MetersToLatLon( upperLeft[0] - bufferDistance, upperLeft[1] + bufferDistance ),
			southEast = GlobalMapTiles.MetersToLatLon( bottomRight[0] + bufferDistance, bottomRight[1] - bufferDistance );

		return {
			minLat: southEast[0],
			minLon: northWest[1],
			maxLat: northWest[0],
			maxLon: southEast[1]
		};
	};

	CanvasTileRenderer.prototype._fetchTilesAndGenerateFeautureColl = function(zoom, requiredTilesInfo, callback) {
		var tileCount = requiredTilesInfo.rows * requiredTilesInfo.cols;
		var counter = 1;
		var viewportFeatures = [];

		for(var y = requiredTilesInfo.maxY; y >= requiredTilesInfo.minY; y--) {
			for(var x = requiredTilesInfo.minX; x <= requiredTilesInfo.maxX; x++) {

				this._fetchAndConvertTile(x, y, zoom, requiredTilesInfo.minX, requiredTilesInfo.minY, 0, function(features){

					viewportFeatures = viewportFeatures.concat(features);
					// console.log(counter, tileCount);
					if (tileCount <= counter++) {

						var ftColl = {
							"type": "FeatureCollection",
							"features": viewportFeatures
						};

						callback(ftColl);
					}
				});
			}
		}
	};

	CanvasTileRenderer.prototype._fetchAndConvertTile = function(x, y, zoom, minX, minY, attempt, callback) {
		var url = "http://localhost:8080/tiles/" + this.category + "/" + zoom + "/" + x + "/" + y + "/tile.json";

		$.ajax({
			url: url,
			context: this
		}).done(function(tileString, textStatus, jqXHR) {

			var features = [];

			try {
				var tileData = JSON.parse(tileString);
				features = this._convertToGeoJSONStandard(tileData);
			} catch (e) {
				console.log(e);
			}

			callback(features);

		}).fail(function(jqXHR) {
			// console.log(jqXHR);
			callback([]);
		})
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

		return convertedFeatures;
	};

	CanvasTileRenderer.prototype._bufferFeaturePolygons = function(ftColl) {
		// console.log(JSON.stringify(ftColl));
		if(this.distance > 0) {
			var unit = 'meters';
			return turfBuffer(ftColl, this.distance, unit);
		} else {
			return ftColl;
		}
	};

	CanvasTileRenderer.prototype._getDrawnViewportCanvas = function(ftColl, zoom, requiredTilesInfo) {
		var tileSize = this.tileSize;
		var viewportCanvas = $('<canvas/>').get(0);
			viewportCanvas.height = requiredTilesInfo.rows * tileSize;
			viewportCanvas.width = requiredTilesInfo.cols * tileSize;

		var ctx = viewportCanvas.getContext('2d');
			ctx.fillStyle = 'black';
			ctx.fillRect(0, 0, viewportCanvas.width, viewportCanvas.height);

			ctx.fillStyle = 'white';
			ctx.strokeStyle = 'white';

		var z2 = (1 << zoom);

        var features = (ftColl.features) ? ftColl.features : ftColl ;
		// if (!features)  console.log(ftColl);

        for (var featureNum = 0; featureNum < features.length; featureNum++) {

	    	var feature = features[featureNum];
			var geom = feature.geometry;
			var type = geom.type;


			ctx.beginPath();

			for (var i = 0; i < geom.coordinates.length; i++) {
				var coords = geom.coordinates;

		        if (type === 'Point') {
		        	coords = this._convertCoords(coords, requiredTilesInfo.minX, requiredTilesInfo.minY, z2);
					ctx.arc(coords[0], coords[1], 2, 0, 2*Math.PI);
		            continue;
		        }

		        if (type === 'Polygon') {
		        	coords = coords[i];
		        }

		        for (var j = 0; j < coords.length; j++) {
	        	    var p = coords[j];
	        	    p = this._convertCoords(p, requiredTilesInfo.minX, requiredTilesInfo.minY, z2);
					if (j) ctx.lineTo(p[0], p[1]);
					else ctx.moveTo(p[0], p[1]);
	        	}
		    }

			if (type === 'Polygon' || type === 'Point') ctx.fill('evenodd');

			ctx.stroke();
		}

		return viewportCanvas;
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

	CanvasTileRenderer.prototype._convertDistanceToPixels = function(zoom, mapCenter) {
		var actMetersPerPixel = GlobalMapTiles.LatToRes(zoom, mapCenter.lat);
		return 1/actMetersPerPixel * this.distance;
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

	CanvasTileRenderer.prototype._sliceViewportCanvasIntoTilesAndSaveToCache = function(viewportCanvas, zoom, requiredTilesInfo, unbufferedTilesInfo, callback) {
		var tileSize = this.tileSize,
			startRow = unbufferedTilesInfo.minY - requiredTilesInfo.minY,
			endRowDiff = requiredTilesInfo.maxY - unbufferedTilesInfo.maxY,
			startCol = unbufferedTilesInfo.minX - requiredTilesInfo.minX,
			endColDiff = requiredTilesInfo.maxX - unbufferedTilesInfo.maxX;

		// console.log('Diffs', 'minY', startRow, 'maxY', endRowDiff, 'minX', startCol, 'maxX', endColDiff);

		for (var row = startRow; row < requiredTilesInfo.rows - endRowDiff; row++) {
	    	for (var col = startCol; col < requiredTilesInfo.cols - endColDiff; col++) {

			    var canvasTile = $('<canvas/>').get(0);
			    canvasTile.height = tileSize;
			    canvasTile.width = tileSize;

			    var ctx = canvasTile.getContext('2d');
			    ctx.drawImage(viewportCanvas, col*tileSize, row*tileSize, tileSize, tileSize, 0, 0, tileSize, tileSize);

				this.tileCache.saveTile(canvasTile, requiredTilesInfo.minX + col, requiredTilesInfo.minY + row,  zoom);
			}
		}

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