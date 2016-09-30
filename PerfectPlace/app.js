'use strict';

// LOAD REQUIRED MODULES
var express = require('express');
var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);

var _ = require('underscore');
var fs = require('fs');
var mkdirp = require('mkdirp');

var config = require('./public/js/config.js');
var categories = require('./server/js/categories.js');
var osmParser = require('./server/js/utils/osm-parser.js');
var GeoJSON = require('geojson');

var tilestrata = require('tilestrata');
var vtServer = require('./server/js/utils/vt-server.js');
// var disk = require('tilestrata-disk');

// MAKE FOLDERS ACCESSIBLE TO CLIENT
app.use(express.static('node_modules'));
app.use(express.static('public'));
app.use(express.static('server'));

var strata = tilestrata();
var providerList = {};
startTileServer();


// open socket connection, used to initiate geojson files generation process
io.on('connection', function (socket) {
	socket.on('updateOSMData', function (actualViewportBBox) {
		console.log(actualViewportBBox);
		var bbox = [actualViewportBBox.west, actualViewportBBox.south, actualViewportBBox.east, actualViewportBBox.north];

		parseOSMFileFromServer(bbox, socket);

		// var readStream = fs.createReadStream("./server/data/osm_regensburg_small.xml");

		// osmParser.parseFileStream(readStream, function (geoObjectCollection) {
		// 	generateGeoJsonFiles(geoObjectCollection, function() {
		// 		var bbox = geoObjectCollection.getBoundingBox();
		// 		generateTileCache(bbox);
		// 	});
		// });
	});
});


function parseOSMFileFromServer(bbox, socket) {
	var url = "http://overpass-api.de/api/map?bbox=" + bbox.toString();

	var http = require('http');

	var req = http.request(url, function(res) {
		res.pipe(fs.createWriteStream("./server/data/actual.xml"));
		console.log("OSM Data requested..");
		
		osmParser.parseFileStream(res, function (geoObjectCollection) {
			console.log("GeoObjectCollection generated..")
			generateGeoJsonFiles(geoObjectCollection, function() {
				//var bbox = geoObjectCollection.getBoundingBox();
				//generateTileCache(bbox);
				socket.emit('dataUpdated');
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

    // reinitiate tile index in the provider plugins for the tile server
	for (var key in providerList){
		providerList[key].init();
	}

	callback();
}

server.listen(80, function() {
	console.log("SocketIO connection ready");
});

app.listen(8000, function() {
	console.log("WebApp online on port 8000");
});


function startTileServer() {

    // setup TileProvider Plugin for each category
    for (var category in categories) {
        for (var subCategory in categories[category]) {

            var providerPlugin = vtServer(subCategory);
            providerList[subCategory] = providerPlugin;

            // var subCategory = "water";
            strata.layer(subCategory)
                .route('tile.json')
                //.use(disk.cache({dir: './server/data/geo-objects/' + subCategory }))
                .use(providerPlugin)
        }
    }
    // create new express app for tile server
    var app2 = express();

    app2.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app2.use(tilestrata.middleware({
        server: strata,
        prefix: '/tiles'
    }));

    app2.listen(8080, function() {
        console.log("TileServer online on port 8080");
    });
}