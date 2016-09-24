(function (window) {
	'use strict';

	function CanvasTileRenderer(category, distance, distanceReversed, tileCache) {
		this.category = category;
		this.distance = distance;
		this.distanceReversed = distanceReversed;
		
		this.actViewportInfo = {};
		this.pendingTileRequests = [];
		this.tileCache = tileCache;
		this.updatingCache = false;
	}

	CanvasTileRenderer.prototype.updateSettings = function (category, distance, distanceReversed) {
		this.category = category;
		this.distance = distance;
		this.distanceReversed = distanceReversed;
	}

	CanvasTileRenderer.prototype.drawTile = function(rawCanvas, tilePoint, zoom, mapBounds, mapCenter) {
	    console.log(zoom);
		var cachedCanvasTile = this.tileCache.getTile(tilePoint.x, tilePoint.y, zoom);

		if(cachedCanvasTile) {
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
				mapCenter: mapCenter
			});

			if (!this.updatingCache) {
				this.actViewportInfo.zoom = zoom;
				this.actViewportInfo.mapBounds = mapBounds;
				this.actViewportInfo.mapCenter = mapCenter;

				this._generateAndCacheTilesForActualViewport()
			}
		}
	}

	CanvasTileRenderer.prototype._generateAndCacheTilesForActualViewport = function() {
		this.updatingCache = true;

		var bvb = this._getBufferedViepwortBounds(this.distance);
	    var tiles = GlobalMapTiles.GetTileList(this.actViewportInfo.zoom, [bvb.minLat, bvb.minLon], [bvb.maxLat, bvb.maxLon]);

	    this.actViewportInfo.rows = tiles.length;
	    this.actViewportInfo.cols = tiles[0].length;
	    this.actViewportInfo.minXTilePoint = tiles[0][0][0];
	   	this.actViewportInfo.minYTilePoint = tiles[0][0][1];

	   	var that = this;

		that._generateCanvasForActualViewport(tiles, function(canvas) {
			var filterSize = that._convertDistanceToPixels(that.distance);
            console.time("dilate");
			that._dilateViewportCanvas(canvas, 10);
            console.timeEnd("dilate");
            that._blurViewportCanvas(canvas, filterSize);
			that._sliceViewportCanvasIntoTilesAndSaveToCache(canvas, function() {
				that.updatingCache = false;
				that._handlePendingTileRequests();
			});
		});
	};

	CanvasTileRenderer.prototype._getBufferedViepwortBounds = function(bufferDistance) {
		var actZoom = this.actViewportInfo.zoom;
		var pyramidLevelWidth = Math.pow(2, actZoom) * 256;
		var actTileWidthInMeters = GlobalMapTiles.PixelsToMeters(pyramidLevelWidth/2 + 256, pyramidLevelWidth/2 + 256, actZoom)[0];

		bufferDistance = Math.max(bufferDistance, actTileWidthInMeters);

		var mapBounds = this.actViewportInfo.mapBounds;
		var mUpperLeft = GlobalMapTiles.LatLonToMeters(mapBounds.getNorth(), mapBounds.getWest());
		var mBottomRight = GlobalMapTiles.LatLonToMeters(mapBounds.getSouth(), mapBounds.getEast());

		var north = GlobalMapTiles.MetersToLatLon(mUpperLeft[0], mUpperLeft[1]+bufferDistance)[0];
		var west = GlobalMapTiles.MetersToLatLon(mUpperLeft[0]-bufferDistance, mUpperLeft[1])[1];

		var south = GlobalMapTiles.MetersToLatLon(mBottomRight[0], mBottomRight[1]-bufferDistance)[0];
		var east = GlobalMapTiles.MetersToLatLon(mBottomRight[0]+bufferDistance, mBottomRight[1])[1];

		var bbox = {
			minLat: south,
			minLon: west,
			maxLat: north,
			maxLon: east
		}
		return bbox;
	};

	CanvasTileRenderer.prototype._generateCanvasForActualViewport = function(tiles, callback) {
		var canvas = $('<canvas/>').get(0);
		canvas.height = this.actViewportInfo.rows * 256;
	    canvas.width = this.actViewportInfo.cols * 256;
	    var ctx = canvas.getContext('2d');

	    var numOfTiles = this.actViewportInfo.rows * this.actViewportInfo.cols;
	    var tilesLoaded = 0;
	  
	    for (var row = 0; row < this.actViewportInfo.rows; row++) {
	    	for (var col = 0; col < this.actViewportInfo.cols; col++) {
		    	var tile = tiles[row][col];

		    	var tileImg = new Image(256, 256);

		    	tileImg.src = "http://localhost:8000/tiles/" + this.category + "/" + this.actViewportInfo.zoom + "/" + tile[0] + "/" + tile[1] + "/tile.png";
		    	tileImg.myData = { row: row, col: col };

		    	tileImg.onload = function(){
	    			ctx.drawImage(this, this.myData.col * 256, this.myData.row * 256);
	    			tilesLoaded++
	    			if (tilesLoaded >= numOfTiles) callback(canvas);
	  			}
	  		}
		}
	};

	CanvasTileRenderer.prototype._convertDistanceToPixels = function(distance) {
		var viewportCenterInMeters = GlobalMapTiles.LatLonToMeters(this.actViewportInfo.mapCenter.lat, this.actViewportInfo.mapCenter.lng);
		var mx = viewportCenterInMeters[0];
		var my = viewportCenterInMeters[1];

		var pixelsNorth = GlobalMapTiles.MetersToPixels(mx, my - distance/2, this.actViewportInfo.zoom);
		var pixelsSouth = GlobalMapTiles.MetersToPixels(mx, my + distance/2, this.actViewportInfo.zoom);
		var pixelDistance = pixelsSouth[1] - pixelsNorth[1];

		return pixelDistance;
	}

	CanvasTileRenderer.prototype._dilateViewportCanvas = function(canvas, dilateSize) {
		var ctx = canvas.getContext("2d");
		var filterImg = new FILTER.Image(canvas);
		var dilate = new FILTER.StatisticalFilter().dilate(dilateSize);

		filterImg.apply(dilate, function() {
			ctx.drawImage(filterImg.toImage(FILTER.FORMAT.IMAGE), 0, 0);
		});
	}

	CanvasTileRenderer.prototype._blurViewportCanvas = function(canvas, blurSize) {
		var ctx = canvas.getContext("2d");
		var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

		var redChannel = [];

		for (var i = 0; i < imgData.data.length; i+=4) {
			redChannel.push(imgData.data[i]);
		}

		var blurredRedChannel = [];

		FastGaussBlur.apply(redChannel, blurredRedChannel, canvas.width, canvas.height, blurSize);

		for (var i = 0; i < imgData.data.length; i+=4) {
			var colorValue = blurredRedChannel[i/4];
			imgData.data[i] = colorValue;
			imgData.data[i+1] = colorValue;
			imgData.data[i+2] = colorValue;
		}

		ctx.putImageData(imgData, 0, 0);
	};

	CanvasTileRenderer.prototype._sliceViewportCanvasIntoTilesAndSaveToCache = function(viewportCanvas, callback) {

		for (var row = 1; row < this.actViewportInfo.rows-1; row++) {
	    	for (var col = 1; col < this.actViewportInfo.cols-1; col++) {

			    var canvasTile = $('<canvas/>').get(0);
			    canvasTile.height = 256;
			    canvasTile.width = 256;

			    var ctx = canvasTile.getContext('2d');
			    ctx.drawImage(viewportCanvas, col*256, row*256, 256, 256, 0, 0, 256, 256);

			    var zoom = this.actViewportInfo.zoom;
			    var minX = this.actViewportInfo.minXTilePoint;
			    var minY = this.actViewportInfo.minYTilePoint;

				this.tileCache.saveTile(canvasTile, minX + col, minY + row, zoom);
			}
		}

		callback();
	};

	CanvasTileRenderer.prototype._handlePendingTileRequests = function() {
		var pendingTileRequests = Object.create(this.pendingTileRequests);
		this.pendingTileRequests = [];

		for (var i = 0; i < pendingTileRequests.length; i++) {
			var tileRequest = pendingTileRequests[i];

			this.drawTile(tileRequest.rawCanvas, tileRequest.point, tileRequest.zoom, tileRequest.mapBounds, tileRequest.mapCenter);
		}
	};

	window.PerfectPlace = window.PerfectPlace || {};
	window.PerfectPlace.CanvasTileRenderer = CanvasTileRenderer;

}(window));