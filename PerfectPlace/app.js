'use strict';

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
// var mapnik = require('mapnik');
var GeoJSON = require('geojson');
var geojsonvt = require('geojson-vt');
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
var vtServer = require('./server/js/utils/vt-server.js');

// // register fonts and datasource plugins
// mapnik.register_default_fonts();
// mapnik.register_default_input_plugins();

// show an array of tile coordinates created so far
//console.log(features); // [{z: 0, x: 0, y: 0}, ...]

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

// var vtile = require('tilestrata-vtile');
// var vtileraster = require('tilestrata-vtile-raster');

// var common = {
//     xml: '/path/to/map.xml',
//     tileSize: 256,
//     metatile: 1,
//     bufferSize: 128
// };

// server.layer('mylayer')
//     .route('t.pbf').use(vtile(common))
//     .route('t.png').use(vtileraster(common, {
//         tilesource: ['mylayer', 't.pbf']
//     }));

for (var category in categories) {
	for (var subCategory in categories[category]) {
// var subCategory = "water";
		strata.layer(subCategory)
		    .route('tile.json')
		        //.use(disk.cache({dir: './server/data/geo-objects/' + subCategory }))
		        .use(vtServer(subCategory))
		    .route('tile.png')
		        .use(strataMapnik({
		            xml: mapnikXMLTemplate({category: subCategory}),
		            tileSize: 256,
		            scale: 1
		        }));
	}
}

// start accepting requests
app.use(tilestrata.middleware({
    server: strata,
    prefix: '/tiles'
}));


server.listen(80);

server.on('listening', function(){
    console.log('server is running!');
});

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
		// 		var bbox = geoObjectCollection.getBoundingBox();
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
				//var bbox = geoObjectCollection.getBoundingBox();
				//generateTileCache(bbox);
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
	    	var boundaryTiles = globalmaptiles.GetTileList(zoom, [bbox.minlat, bbox.minlon], [bbox.maxlat, bbox.maxlon]);
    		
    		var tmin = boundaryTiles[0];
    	    var tmax = boundaryTiles[1];

    		for(var y = tmax[1]; y <= tmin[1]; y++) {
    			for(var x = tmin[0]; x <= tmax[0]; x++) {
	        		
	        		renderTile(source, x, y, zoom, category);
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