'use-strict';

var map;
var socket;

var actZoom;
var actRows; var actCols; 
var actMinTileX; var actMinTileY;
var updatingCache = false;

var rawTileImageCache = {};
var pendingTilesCache = {};
var pendingTiles = [];
var pendingTileCanvasList = {};

var paramsList = {};


window.onload = function() {

	// create a map in the "map" div, set the view to a given place and zoom
	map = L.map('map').setView([49.017222, 12.096944], 14);
	
	// add MapQuest tile layer, must give proper OpenStreetMap attribution according to MapQuest terms
	L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png', {
		maxZoom: config.MAP_MAX_ZOOM,
		subdomains: '1234',
		attribution: '&copy; <a href="http://info.mapquest.com/terms-of-use/">MapQuest</a> | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map);

	// L.tileLayer('http://localhost:8000/maps/water/{z}/{x}/{y}/tile.png', {
	// 	maxZoom: config.MAP_MAX_ZOOM
	// }).addTo(map);

	var canvasTileLayer = L.tileLayer.canvas();
	canvasTileLayer.drawTile = function(canvas, tilePoint, zoom) {
	    drawTileFromCache(canvas, tilePoint, zoom);
	}

	canvasTileLayer.addTo(map);
	$(canvasTileLayer.getContainer()).css({
		"mix-blend-mode": "multiply",
		"opacity": 0.5
	});

	var categoryDropDownMenuHTML = "";
	var first = true;

	for (var category in Categories) {
		if (first) {
			categoryDropDownMenuHTML += '<li class="dropdown-header">' + category + '</li>';
			first = false;
		} else {
			categoryDropDownMenuHTML += '<li role="separator" class="divider"></li>' + '\n' + '<li class="dropdown-header">' + category + '</li>';
		}
		
		for (var subCategory in Categories[category]) {
			categoryDropDownMenuHTML += '<li><a class="dropdown-menu-entry" href="#">' + subCategory.capitalize() + ' </a></li>';
		}
	}

	$('#app-container').click(function(event) {
		var clickedEl = $(event.target);

		if(clickedEl.is("#add-parameter-button")) {
			var parameterSettingsPanel = render('parameter-settings-panel', {
				selectedCategory: "Park",
				categoryDropdownMenu: categoryDropDownMenuHTML,
				distanceInputValue: "500",
				selectedDistanceUnit: "m",
				selectedImportance: "Default",
				selectedDistanceAppedix: "Maximal .. away"
			});

			$('#app-container').append(parameterSettingsPanel);
		}

		else if (clickedEl.is("#add-btn")) {

			$('#parameter-settings-panel').remove();

			var actParamID = "param-" + paramsList.length;

			newParameterButton = render('parameter-button', {
				id: actParamID,
				name: "New Category",
				distance: ""
			});

			$('#app-container').append(newParameterButton);
		}

		else if (clickedEl.is("#cancle-btn")) {
			$('#parameter-settings-panel').remove();
		}

		else if (clickedEl.hasClass('param-btn')) {
			var parameterSettingsPanel = render('parameter-settings-panel', {
				selectedCategory: "Park",
				categoryDropdownMenu: categoryDropDownMenuHTML,
				distanceInputValue: "500",
				selectedDistanceUnit: "m",
				selectedImportance: "Default",
				selectedDistanceAppedix: "Maximal .. away"
			});

			$(parameterSettingsPanel).insertAfter($('#' + clickedEl.attr('id')));
			$('#' + clickedEl.attr('id')).remove();
		}

		else if (clickedEl.hasClass('dropdown-menu-entry')) {
			var selectedDropdownMenu = $(clickedEl.closest('ul'));
			var selectedValue = clickedEl.html();

			if(selectedDropdownMenu.is('#category-dropdown-menu')){
				$('#category-dropdown-btn').contents().first().replaceWith(selectedValue);
			} 

			else if(selectedDropdownMenu.is('#distance-unit-dropdown-menu')){
				$('#distance-unit-dropdown-btn').contents().first().replaceWith(selectedValue);
			} 

			else if(selectedDropdownMenu.is('#importance-dropdown-menu')){
				$('#importance-dropdown-btn').contents().first().replaceWith(selectedValue);
			} 

			else if(selectedDropdownMenu.is('#distance-appendix-dropdown-menu')){
				$('#distance-appendix-dropdown-btn').contents().first().replaceWith(selectedValue);
			}
		}
	});


	// var canvasTileLayer = L.tileLayer.canvas();
	// canvasTileLayer.drawTile = function(canvas, tilePoint, zoom) {

	//     var ctx = canvas.getContext('2d');
	//     ctx.drawImage(pendingTilesCache[tilePoint.x][tilePoint.y], 0, 0);

	//     var url = "http://localhost:8000/maps/water/" + zoom + "/" + tilePoint.x + "/" + tilePoint.y + "/tile.png";

	//     FILTER.HTMLImageLoader.load(url, function(img) {
	//     	ctx.drawImage(img.toImage(FILTER.FORMAT.IMAGE), 0, 0);

 //    		var dilate = new FILTER.StatisticalFilter().dilate(10);

 //    		img.apply(dilate, function () {

 //    			var blur = new FILTER.ConvolutionMatrixFilter().fastGauss();

 //    			img.apply(blur, function () {
 //    				ctx.drawImage(img.toImage(FILTER.FORMAT.IMAGE), 0, 0);
 //    			});
 //    		});
	//     });
	// }

	// canvasTileLayer.addTo(map);

	socket = io.connect('http://localhost');
	socket.on('test', function () {

	});

	$("#server-precache").on('click', parseOSMFile);
};

function parseOSMFile(e) {
	var mapBounds = map.getBounds();
	var bbox = {
		west: mapBounds.getWest(),
		south: mapBounds.getSouth(),
		east: mapBounds.getEast(),
		north: mapBounds.getNorth()
	}
	socket.emit('parseOSMFile', bbox);
};

function drawTileFromCache(canvas, tilePoint, zoom) {
	var ctx = canvas.getContext('2d');
	var cachedCanvas;

	if(pendingTilesCache[zoom] && pendingTilesCache[zoom][tilePoint.y] && (cachedCanvas = pendingTilesCache[zoom][tilePoint.y][tilePoint.x])) {
		ctx.globalCompositeOperation = "multiply";
		ctx.drawImage(cachedCanvas, 0, 0);
	} else {

		if (pendingTileCanvasList[zoom] === undefined) pendingTileCanvasList[zoom] = {};
		if (pendingTileCanvasList[zoom][tilePoint.x] === undefined) pendingTileCanvasList[zoom][tilePoint.x] = {};

		if(pendingTileCanvasList[zoom][tilePoint.x][tilePoint.y] === undefined) {
			pendingTileCanvasList[zoom][tilePoint.x][tilePoint.y] = canvas;
			pendingTiles.push({
				point: tilePoint,
				zoom: zoom
			});
		}

		if (!updatingCache) {
			updateFinalTileCache(function() {
				updatingCache = false;
				
				for (var i = 0; i < pendingTiles.length; i++) {
					var tile = pendingTiles[i];
					var canvas = pendingTileCanvasList[tile.zoom][tile.point.x][tile.point.y];
					drawTileFromCache(canvas, tile.point, tile.zoom);
				}

				pendingTiles = [];
				pendingTileCanvasList = {};
				pendingTilesCache = {};
			});
		}
	}
}

function updateFinalTileCache(callback) {
	updatingCache = true;
	var bufferedBounds = getBufferedVieportBounds(500);
	actZoom = map.getZoom();
    var tiles = globalmaptiles.GetTileList(actZoom, [bufferedBounds.minLat, bufferedBounds.minLon], [bufferedBounds.maxLat, bufferedBounds.maxLon]);

    actRows = tiles.length;
    actCols = tiles[0].length;

    actMinTileX = tiles[0][0][0];
    actMinTileY = tiles[0][0][1];

	generateViewportCanvas(tiles, actZoom, callback, function(canvas, finalCallback) {
		blurViewportCanvas(canvas, 20);
		sliceViewportCanvasIntoTilesAndSaveToCache(canvas);

		finalCallback();
	});
}

function getBufferedVieportBounds(bufferDistance) {
	var zoom = map.getZoom();
	var pyramidLevelWidth = Math.pow(2, zoom) * 256;
	var actTileWidthInMeters = globalmaptiles.PixelsToMeters(pyramidLevelWidth/2 + 256, pyramidLevelWidth/2 + 256, zoom)[0];

	bufferDistance = Math.max(bufferDistance, actTileWidthInMeters);

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

function generateViewportCanvas(tiles, actZoom, finalCallback, callback) {
	var canvas = $('<canvas/>').get(0);
	canvas.height = actRows * 256;
    canvas.width = actCols * 256;
    var ctx = canvas.getContext('2d');

    var numOfTiles = actRows * actCols;
    var tilesLoaded = 0;
  
    for (var row = 0; row < actRows; row++) {
    	for (var col = 0; col < actCols; col++) {
	    	var tile = tiles[row][col];

	    	var tileImg = new Image(256, 256);

	    	tileImg.src = "http://localhost:8000/maps/park/" + actZoom + "/" + tile[0] + "/" + tile[1] + "/tile.png";
	    	tileImg.myData = { row: row, col: col}

	    	tileImg.onload = function(){
	    		// if (rawTileImageCache[actMinTileY+this.myData.row] === undefined) rawTileImageCache[actMinTileY+this.myData.row] = {};
	    		// rawTileImageCache[actMinTileY+this.myData.col][actMinTileX+this.myData.col] = this;

    			ctx.drawImage(this, this.myData.col * 256, this.myData.row * 256);

    			tilesLoaded++
    			if (tilesLoaded >= numOfTiles) callback(canvas, finalCallback);
  			}
  		}
	}
}

function blurViewportCanvas(canvas, blurSize) {
	var ctx = canvas.getContext("2d");
	var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

	var redChannel = [];

	for (var i = 0; i < imgData.data.length; i+=4) {
		redChannel.push(imgData.data[i]);
	}

	var blurredRedChannel = [];

	var blurFilter = new FastGaussBlur();
	blurFilter.apply(redChannel, blurredRedChannel, canvas.width, canvas.height, blurSize);

	for (var i = 0; i < imgData.data.length; i+=4) {
		var colorValue = blurredRedChannel[i/4];
		imgData.data[i] = colorValue;
		imgData.data[i+1] = colorValue;
		imgData.data[i+2] = colorValue;
	}

	ctx.putImageData(imgData, 0, 0);
}

function sliceViewportCanvasIntoTilesAndSaveToCache(canvas, callback) {
	for (var row = 1; row < actRows-1; row++) {
    	for (var col = 1; col < actCols-1; col++) {

		    if (pendingTilesCache[actZoom] === undefined) pendingTilesCache[actZoom] = {};
		    if (pendingTilesCache[actZoom][actMinTileY+row] === undefined) pendingTilesCache[actZoom][actMinTileY+row] = {};
		    
		    if (!pendingTilesCache[actZoom][actMinTileY+row][actMinTileX+col]) {

			    var sliceCanvas = $('<canvas/>').get(0);
				sliceCanvas.height = 256;
			    sliceCanvas.width = 256;
			    var ctx = sliceCanvas.getContext('2d');
			    ctx.drawImage(canvas, col*256, row*256, 256, 256, 0, 0, 256, 256);

				pendingTilesCache[actZoom][actMinTileY+row][actMinTileX+col] = sliceCanvas;
			}
			//$('body').append(sliceCanvas);
		}
	}
}

// Source: http://stackoverflow.com/a/10136935
function render(tmpl_name, tmpl_data) {
	if(!tmpl_data) {
		tmpl_data = {};
	}

    if (!render.tmpl_cache) { 
        render.tmpl_cache = {};
    }

    if (!render.tmpl_cache[tmpl_name]) {
        var tmpl_dir = '/templates';
        var tmpl_url = tmpl_dir + '/' + tmpl_name + '.html';

        var tmpl_string;
        $.ajax({
            url: tmpl_url,
            method: 'GET',
            async: false,
            success: function(data) {
                tmpl_string = data;
            }
        });

        render.tmpl_cache[tmpl_name] = _.template(tmpl_string);
    }
    return render.tmpl_cache[tmpl_name](tmpl_data);
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}