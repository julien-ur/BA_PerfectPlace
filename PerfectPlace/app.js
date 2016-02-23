'use strict';

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
// var mapnik = require('mapnik');
var GeoJSON = require('geojson');
// var geojsonvt = require('geojson-vt');
// var Vector = require('tilelive-vector');
var mkdirp = require('mkdirp');
var tileliveMapnik = require('tilelive-mapnik');
var _ = require('underscore');

var config = require('./public/js/config.js');
var osmParser = require('./server/js/utils/osm-parser.js');
var categories = require('./server/js/models/categories.js');
var globalmaptiles = require('./server/vendor/globalmaptiles.js');

var mapnikXML = fs.readFileSync("./server/data/mapnik.xml", 'utf-8');
var mapnikXMLTemplate = _.template(mapnikXML);

// // register fonts and datasource plugins
// mapnik.register_default_fonts();
// mapnik.register_default_input_plugins();

// var geoJSON = JSON.parse(fs.readFileSync("./server/data/test.geojson"));

// // build an initial index of tiles
// var tileIndex = geojsonvt(geoJSON);
// //console.log(tileIndex);
// // request a particular tile
// var features = tileIndex.getTile(13, 4371, 2812).features;

// // show an array of tile coordinates created so far
// //console.log(features); // [{z: 0, x: 0, y: 0}, ...]

// var geojsonString = JSON.stringify(features, null, "\t");

// fs.writeFile("./server/data/test-vector-tile.mvt", geojsonString, function (err) {
// 	if (err) console.log(err);
// });

// var vectorTile = Uri.parse("./server/data/test-vector-tile.mvt");

// new Vector(geojsonString, function(obj) {
// 	console.log(obj);
// });

// var formattedGeojsonString = geojsonString.replace(/\"(\d+\.?\d*)\"/g, "$1");


var tilestrata = require('tilestrata');
var disk = require('tilestrata-disk');
var strataMapnik = require('tilestrata-mapnik');
var dependency = require('tilestrata-dependency');
var strata = tilestrata();

// for (var category in categories) {
// 	for (var subCategory in categories[category]) {

var subCategory = "park";

		strata.layer(subCategory)
		    .route('tile.png')
		        .use(disk.cache({dir: './server/data/geo-objects/' + subCategory }))
		        .use(strataMapnik({
		            xml: mapnikXMLTemplate({category: subCategory}),
		            tileSize: 256,
		            scale: 1
		        }))
// 	}
// }

// start accepting requests
app.use(tilestrata.middleware({
    server: strata,
    prefix: '/maps'
}));


server.listen(80);

app.use(express.static('node_modules'));
app.use(express.static('public'));
app.use(express.static('server'));

io.on('connection', function (socket) {
	socket.on('parseOSMFile', function (actualViewportBBox) {
		console.log(actualViewportBBox);
		var bbox = [actualViewportBBox.west, actualViewportBBox.south, actualViewportBBox.east, actualViewportBBox.north];

		parseOSMFileFromServer(bbox);

		// var readStream = fs.createReadStream("./server/data/osm_regensburg_small.xml");

		// osmParser.parseFileStream(readStream, function (geoObjectCollection) {
		// 	generateGeoJsonFiles(geoObjectCollection, function() {
		//		var bbox = geoObjectCollection.getBoundingBox();
		// 		generateTileCache(bbox);
		// 	});
		// });
	});
});

function parseOSMFileFromServer(bbox) {
	var url = "http://overpass-api.de/api/map?bbox=" + bbox.toString();

	var http = require('http');
	var mapDataXML = '';

	var req = http.request(url, function(res) {
		res.pipe(fs.createWriteStream("./server/data/actual.xml"));
		console.log("OSM Data requested..");
		
		osmParser.parseFileStream(res, function (geoObjectCollection) {
			console.log("GeoObjectCollection generated..")
			generateGeoJsonFiles(geoObjectCollection, function() {
				var bbox = geoObjectCollection.getBoundingBox();
				generateTileCache(bbox);
			});
		});
	});

	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});

	req.end();
}


function generateGeoJsonFiles(geoObjectCollection, callback) {
	var bbox = geoObjectCollection.getBoundingBox();

	for (var category in categories) {
		for (var subCategory in categories[category]) {

			var geoData = geoObjectCollection.getGeoDataForCategory(subCategory);

			GeoJSON.parse(geoData, { Point: 'point', LineString: 'line', Polygon: 'polygon', bbox: bbox }, function(geojson) {
				var geojsonString = JSON.stringify(geojson, null, "\t");
				var formattedGeojsonString = geojsonString.replace(/\"(\d+\.?\d*)\"/g, "$1");
				
				fs.writeFileSync("./server/data/geojson/" + subCategory + ".geojson", formattedGeojsonString);
			});
		}
	}
	console.log("GeoJSON files generated..");
	callback();
}

function generateTileCache(bbox) {
	console.log(bbox);

	var options = {
		interactivity: false,
		metatile: 8,
		resolution: 4,
		bufferSize: 128,
		tileSize: 256,
		scale: 1
	};
	
	for (var category in categories) {
		for (var subCategory in categories[category]) {
			createTiles(subCategory, options, bbox);
		}
	}
}

function createTiles(category, options, bbox) {
	var uri = {query: options};
	uri.xml = mapnikXMLTemplate({category: category});

	new tileliveMapnik(uri, function(err, source) {
	    if (err) throw err;

	    for (var zoom = config.OVERLAY_MIN_ZOOM; zoom <= config.MAP_MAX_ZOOM; zoom++) {
	    	var tiles = globalmaptiles.GetTileList(zoom, [bbox.minlat, bbox.minlon], [bbox.maxlat, bbox.maxlon]);

	        for (var row = 0; row < tiles.length; row++) {
	        	for (var col = 0; col < tiles[0].length; col++) {
	        		
	        		var tile = tiles[row][col];
	        		renderTile(source, tile[0], tile[1], zoom, category);
	    		}
	    	}
	    }
	    console.log("Tiles generated for " + category);
	});
}

function renderTile(source, x, y, z, category) {
    source.getTile(z, x, y, function(err, tile, headers) {
    	var path = 'server/data/geo-objects/' + category + '/' + z + '/' + x + '/' + y + '/';

    	mkdirp(path, function (err) {
		    if (err) console.error(err);
		    else fs.writeFileSync(path + '/tile.png', tile);
		});
    });
}

app.listen(8000);