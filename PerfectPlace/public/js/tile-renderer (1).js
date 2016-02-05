'use-strict';

var map;
var socket;

var actRows; var actCols;
var minTileX; var minTileY; var maxTileX; var maxTileY;
var tileCache = {};

window.onload = function() {

	// create a map in the "map" div, set the view to a given place and zoom
	map = L.map('map').setView([49.017222, 12.096944], 14);
	
	// add MapQuest tile layer, must give proper OpenStreetMap attribution according to MapQuest terms
	L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png', {
		maxZoom: 18,
		subdomains: '1234',
		attribution: '&copy; <a href="http://info.mapquest.com/terms-of-use/">MapQuest</a> | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map);

	// L.tileLayer('http://localhost:8000/maps/water/{z}/{x}/{y}/tile.png', {
	// 	maxZoom: config.MAP_MAX_ZOOM
	// }).addTo(map);
	
	generateViewportImage(function(canvas) {

		sliceImageIntoTilesAndSaveToCache(canvas);
		console.log(tileCache);
	});

	
	// var canvasTiles = L.tileLayer.canvas();
	// canvasTiles.drawTile = function(canvas, tilePoint, zoom) {

	//     var ctx = canvas.getContext('2d');
	//     ctx.drawImage(tileCache[tilePoint.x][tilePoint.y], 0, 0);

	    // var url = "http://localhost:8000/maps/water/" + zoom + "/" + tilePoint.x + "/" + tilePoint.y + "/tile.png";

	    // FILTER.HTMLImageLoader.load(url, function(img) {
	    // 	ctx.drawImage(img.toImage(FILTER.FORMAT.IMAGE), 0, 0);

    	// 	var dilate = new FILTER.StatisticalFilter().dilate(10);

    	// 	img.apply(dilate, function () {

    	// 		var blur = new FILTER.ConvolutionMatrixFilter().fastGauss();

    	// 		img.apply(blur, function () {
    	// 			ctx.drawImage(img.toImage(FILTER.FORMAT.IMAGE), 0, 0);
    	// 		});
    	// 	});
	    // });
	// }

	// canvasTiles.addTo(map);

	socket = io.connect('http://localhost');
	socket.on('test', function () {

	});

	map.on('click', onMapClick);
};

function onMapClick(e) {
	var actMapBounds = map.getBounds();
	var bbox = {
		west: actMapBounds.getWest(),
		south: actMapBounds.getSouth(),
		east: actMapBounds.getEast(),
		north: actMapBounds.getNorth()
	}
	socket.emit('parseOSMFile', bbox);
};

function getBufferedVieportBounds(bufferDistance) {
	var mapBounds = map.getBounds();

	var mUpperLeft = globalmaptiles.LatLonToMeters(mapBounds.getNorth(), mapBounds.getWest());
	var mBottomRight = globalmaptiles.LatLonToMeters(mapBounds.getSouth(), mapBounds.getEast());

	var north = globalmaptiles.MetersToLatLon(mUpperLeft[0], mUpperLeft[1]+bufferDistance)[0];
	var west = globalmaptiles.MetersToLatLon(mUpperLeft[0]-bufferDistance, mUpperLeft[1])[1];

	var south = globalmaptiles.MetersToLatLon(mBottomRight[0], mBottomRight[1]-bufferDistance)[0];
	var east = globalmaptiles.MetersToLatLon(mBottomRight[0]+bufferDistance, mBottomRight[1])[1];

	var bbox = {
		minLat: south,
		minLon: west,
		maxLat: north,
		maxLon: east
	}
	return bbox;
}

function generateViewportImage(callback) {
	var bufferedBounds = getBufferedVieportBounds(500);
	var actZoom = map.getZoom();
    var tiles = globalmaptiles.GetTileList(actZoom, [bufferedBounds.minLat, bufferedBounds.minLon], [bufferedBounds.maxLat, bufferedBounds.maxLon]);
    
    actRows = tiles.length;
    actCols = tiles[0].length;

    minTileX = tiles[0][0][0];
    minTileY = tiles[0][0][1];
    maxTileX = tiles[actRows-1][actCols-1][0];
    maxTileY = tiles[actRows-1][actCols-1][1];

    var numOfTiles = actRows * actCols;

	var canvas = $('<canvas/>').get(0);
	canvas.height = actRows * 256;
    canvas.width = actCols * 256;
    var ctx = canvas.getContext('2d');

    var tilesLoaded = 0;

    for (var row = 0; row < actRows; row++) {
    	for (var col = 0; col < actCols; col++) {
	    	var tile = tiles[row][col];

	    	var tileImg = new Image(256, 256);
	    	tileImg.src = "http://localhost:8000/maps/water/" + actZoom + "/" + tile[0] + "/" + tile[1] + "/tile.png";
	    	tileImg.myData = { row: row, col: col}

	    	tileImg.onload = function(){
    			tilesLoaded ++
    			ctx.drawImage(this, this.myData.col * 256, this.myData.row * 256);
    			if (tilesLoaded >= numOfTiles) {

    				callback(canvas);
    				//$('body').append(canvas); 
    			}
  			}
  		}
	}
}

function sliceImageIntoTilesAndSaveToCache(viewPortCanvas) {
	for (var row = 0; row < actRows; row++) {
    	for (var col = 0; col < actCols; col++) {
    		var sliceCanvas = $('<canvas/>').get(0);
			sliceCanvas.height = 256;
		    sliceCanvas.width = 256;
		    var ctx = sliceCanvas.getContext('2d');
		    ctx.drawImage(viewPortCanvas, col*256, row*256, 256, 256, 0, 0, 256, 256);

		    if (tileCache[minTileY+row] === undefined) tileCache[minTileY+row] = {}
		    tileCache[minTileY+row][minTileX+col] = sliceCanvas;
			
			$('body').append(sliceCanvas);
		}
	}

	var canvasTiles = L.tileLayer.canvas();
	canvasTiles.drawTile = function(canvas, tilePoint, zoom) {
	    
	    var ctx = canvas.getContext('2d');
	    var cachedCanvas = tileCache[tilePoint.y][tilePoint.x];
	    ctx.drawImage(cachedCanvas, 0, 0);
	}
	canvasTiles.addTo(map);
}






