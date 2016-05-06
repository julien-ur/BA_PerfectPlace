(function (window) {
	'use strict';

	function CanvasTileRenderer(category, distance, distanceReversed, tileSize, tileCache) {
		this.category = category;
		this.distance = distance;
		this.distanceReversed = distanceReversed;
		this.tileSize = tileSize;

		this.actViewportInfo = {};
		this.pendingTileRequests = [];
		this.tileCache = tileCache;
		this.updatingCache = false;
		this.maxAttempts = 3;
	}

	CanvasTileRenderer.prototype.updateSettings = function (category, distance, distanceReversed) {
		this.category = category;
		this.distance = distance;
		this.distanceReversed = distanceReversed;
	};

	CanvasTileRenderer.prototype.drawTile = function(rawCanvas, tilePoint, zoom, mapBounds, mapCenter, attempt) {
		var cachedCanvasTile = this.tileCache.getTile(tilePoint.x, tilePoint.y, zoom);
		console.log(!!cachedCanvasTile, zoom, tilePoint.x, tilePoint.y, attempt);

		if (cachedCanvasTile) {
			var ctx = rawCanvas.getContext('2d');
			ctx.globalCompositeOperation = "multiply";
			ctx.drawImage(cachedCanvasTile, 0, 0);
			this.tileCache.removeTile(tilePoint.x, tilePoint.y, zoom);

		} else {
			this.pendingTileRequests.push({
				rawCanvas: rawCanvas,
				point: tilePoint,
				zoom: zoom,
				mapBounds: mapBounds,
				mapCenter: mapCenter,
				attempt: attempt
			});

			if (!this.updatingCache) {
				this._generateAndCacheTilesForViewport(zoom - 4, mapBounds, mapCenter)
			}
		}
	};
	
	CanvasTileRenderer.prototype._generateAndCacheTilesForViewport = function(zoom, mapBounds, mapCenter) {
		this.updatingCache = true;
		
		var bvb = this._getBufferedViepwortBounds(zoom, mapBounds, mapCenter);
	    var tiles = GlobalMapTiles.GetTiles(zoom, [bvb.minLat, bvb.minLon], [bvb.maxLat, bvb.maxLon]);
	    console.log(tiles);

    	this.viewportCanvas = $('<canvas/>').get(0);
    	this.viewportCanvas.height = tiles.rows * this.tileSize;
        this.viewportCanvas.width = tiles.cols * this.tileSize;

	   	var that = this;
		that._fetchTilesAndDrawOnViewportCanvas(zoom, tiles, function() {
			var filterSize = that._convertDistanceToPixels(zoom, mapCenter);
			// that._dilateViewportCanvas(filterSize);
			// that._blurViewportCanvas(filterSize);
			that._sliceViewportCanvasIntoTilesAndSaveToCache(zoom+4, tiles, function() {
				that.updatingCache = false;
				that._handlePendingTileRequests();
			});
		});
	};

	CanvasTileRenderer.prototype._getBufferedViepwortBounds = function(zoom, mapBounds, mapCenter) {
		var actMetersPerPixel = GlobalMapTiles.LatToRes(zoom, mapCenter.lat);
		var minBufferDist = actMetersPerPixel * 10;
		var bufferDistance = Math.max(this.distance, minBufferDist);

		var upperLeft = GlobalMapTiles.LatLonToMeters(mapBounds.getNorth(), mapBounds.getWest());
		var bottomRight = GlobalMapTiles.LatLonToMeters(mapBounds.getSouth(), mapBounds.getEast());
		
		var north = GlobalMapTiles.MetersToLatLon(upperLeft[0], upperLeft[1]+bufferDistance)[0];
		var west = GlobalMapTiles.MetersToLatLon(upperLeft[0]-bufferDistance, upperLeft[1])[1];
		var south = GlobalMapTiles.MetersToLatLon(bottomRight[0], bottomRight[1]-bufferDistance)[0];
		var east = GlobalMapTiles.MetersToLatLon(bottomRight[0]+bufferDistance, bottomRight[1])[1];

		var bbox = {
			minLat: south,
			minLon: west,
			maxLat: north,
			maxLon: east
		};

		return bbox;
	};

	CanvasTileRenderer.prototype._convertDistanceToPixels = function(zoom, mapCenter) {
		var viewportCenterInMeters = GlobalMapTiles.LatLonToMeters(mapCenter.lat, mapCenter.lng);
		var mx = viewportCenterInMeters[0];
		var my = viewportCenterInMeters[1];

		var pixelsNorth = GlobalMapTiles.MetersToPixels(mx, my - this.distance/2, zoom);
		var pixelsSouth = GlobalMapTiles.MetersToPixels(mx, my + this.distance/2, zoom);
		var pixelDistance = pixelsSouth[1] - pixelsNorth[1];
		console.log(pixelDistance);

		var actMetersPerPixel = GlobalMapTiles.LatToRes(zoom, mapCenter.lat);
		var pixelDistance = 1/actMetersPerPixel * this.distance;
		console.log(pixelDistance);

		return pixelDistance;
	};

	CanvasTileRenderer.prototype._fetchTilesAndDrawOnViewportCanvas = function(zoom, tiles, callback) {
	    this.tilesData = [];
	    this.tileCount = tiles.rows * tiles.cols;
	    this.counter = 0;
	    console.log("tiles: " + this.tileCount);

		for(var y = tiles.minY; y <= tiles.maxY; y++) {
			for(var x = tiles.minX; x <= tiles.maxX; x++) {

		    	console.log(zoom,x,y);

	   			var url = "http://localhost:8000/tiles/" + this.category + "/" + zoom + "/" + x + "/" + y + "/tile.json";

		    	$.ajax({
		    		url: url,
		    		context: this
		    	}).done(function(tileString, textStatus, jqXHR) {

					try {
						var tileData = JSON.parse(tileString); 
						tileData = this._convertTile(tileData);
						this.tilesData = this.tilesData.concat(tileData);
						console.log("success");

						this.counter ++;
						if (this.counter == this.tileCount) {
							this.tilesData = {
							   "type":"FeatureCollection",
							   "features":[
							      {
							         "type":"Feature",
							         "properties":{

							         },
							         "geometry":{
							            "type":"Point",
							            "coordinates":[
							               12.1990440,
							               49.0541620
							            ]
							         }
							      },
							      {
							         "type":"Feature",
							         "properties":{

							         },
							         "geometry":{
							            "type":"LineString",
							            "coordinates":[
							               [
							                  12.0791176,
							                  49.0257231
							               ],
							               [
							                  12.0808752,
							                  49.0245425
							               ],
							               [
							                  12.0836616,
							                  49.0234743
							               ],
							               [
							                  12.0865090,
							                  49.0228229
							               ],
							               [
							                  12.1018699,
							                  49.0209784
							               ]
							            ]
							         }
							      }
							   ]
							}
							var tilesData = this._bufferFeaturePolygons(this.tilesData);
							this._drawTileOnViewportCanvas(tilesData, tiles, zoom);
						}
					}
					catch (e) { console.log(e); }

		    	}).fail(function(jqXHR) {
		    		console.log(jqXHR);
		    	});
	    	}
  		}
		callback();
	};

	CanvasTileRenderer.prototype._convertTile = function(tile) {
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

	CanvasTileRenderer.prototype._bufferFeaturePolygons = function(tilesData, distance) {
		var ftColl = {
		  "type": "FeatureCollection",
		  "features": tilesData
		};
		// console.log(JSON.stringify(ftColl).replace(/\"(\d+\.?\d*)\"/g, "$1"));
		console.log(tilesData);

	    var unit = 'meters';
	    var buffered = turf.buffer(tilesData, 20, unit);
	    console.log(buffered);
	    return buffered;
	};

	CanvasTileRenderer.prototype._drawTileOnViewportCanvas = function(tilesData, tiles, zoom) {
		var ctx = this.viewportCanvas.getContext('2d');
		ctx.strokeStyle = 'black';
		ctx.fillStyle = 'rgba(0,0,0,0.9)';
	    ctx.beginPath();

		var z2 = (1 << zoom);
	    var features = tilesData.features;

	    for (var i = 0; i < features.length; i++) {
	    	var feature = features[i];

		    for (var j = 0; j < feature.geometry.coordinates.length; j++) {
		        var geom = feature.geometry.coordinates;
		        var type = geom.type;

		        if (type === 'Point') {
		        	geom = this._convertCoords(geom, z2)
		            ctx.arc(geom[0] + this.tileSize, geom[1] + this.tileSize, 2, 0, 2*Math.PI);
		            continue;
		        }

		        if (type === 'Polygon') {
		        	geom = geom[j];
		        }

		        for (var k = 0; k < geom.length; k++) {
	        	    var p = geom[k];
	        	    p = this._convertCoords(p, z2);

	        	    if (k) ctx.lineTo(p[0] + this.tileSize, p[1] + this.tileSize);
	        	    else ctx.moveTo(p[0] + this.tileSize, p[1] + this.tileSize);
	        	}
		    }

		    if (type === 'Polygon' || type === 'Point') ctx.fill('evenodd');
		    
		    ctx.stroke();
		}
	};

	CanvasTileRenderer.prototype._convertCoords = function(p, minX, minY, z2) {
    	var sin = Math.sin((p[1] * Math.PI) / 180),
    	    x = (p[0] / 360) + 0.5,
    	    y = 0.5 - (0.25 * Math.log((1 + sin) / (1 - sin))) / Math.PI;

    	    y = y < -1 ? -1 :
    	        y > 1 ? 1 : y;

    		x = Math.round(4096 * (x * z2 - minX));
    		y = Math.round(4096 * (y * z2 - minY));

	    return [x, y];
	};

	CanvasTileRenderer.prototype._dilateViewportCanvas = function(size) {
		var ctx = this.viewportCanvas.getContext("2d");
		var filterImg = new FILTER.Image(this.viewportCanvas);
		var dilate = new FILTER.StatisticalFilter().dilate(size);

		filterImg.apply(dilate, function() {
			ctx.drawImage(filterImg.toImage(FILTER.FORMAT.IMAGE), 0, 0);
		});
	};

	CanvasTileRenderer.prototype._blurViewportCanvas = function(size) {
		var ctx = this.viewportCanvas.getContext("2d");
		var imgData = ctx.getImageData(0, 0, this.viewportCanvas.width, this.viewportCanvas.height);

		var redChannel = [];

		for (var i = 0; i < imgData.data.length; i+=4) {
			redChannel.push(imgData.data[i]);
		}

		var blurredRedChannel = [];

		FastGaussBlur.apply(redChannel, blurredRedChannel, this.viewportCanvas.width, this.viewportCanvas.height, size);

		for (var i = 0; i < imgData.data.length; i+=4) {
			var colorValue = blurredRedChannel[i/4];
			imgData.data[i] = colorValue;
			imgData.data[i+1] = colorValue;
			imgData.data[i+2] = colorValue;
		}

		ctx.putImageData(imgData, 0, 0);
	};

	CanvasTileRenderer.prototype._sliceViewportCanvasIntoTilesAndSaveToCache = function(zoom, tiles, callback) {
		var tileSize = this.tileSize;

		for (var row = 0; row < tiles.rows; row++) {
	    	for (var col = 0; col < tiles.cols; col++) {

			    var canvasTile = $('<canvas/>').get(0);
			    canvasTile.height = tileSize;
			    canvasTile.width = tileSize;

			    var ctx = canvasTile.getContext('2d');
			    ctx.drawImage(this.viewportCanvas, col*tileSize, row*tileSize, tileSize, tileSize, 0, 0, tileSize, tileSize);

				this.tileCache.saveTile(canvasTile, tiles.minX + col, tiles.minY + row,  zoom);
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