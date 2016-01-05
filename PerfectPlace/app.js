'use strict';

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var mapnik = require('mapnik');

var osmParser = require('./server/js/utils/osm-parser.js');
var GeoJSON = require('geojson');

// register fonts and datasource plugins
mapnik.register_default_fonts();
mapnik.register_default_input_plugins();

var ioSocket;

server.listen(80);

app.use(express.static('public'));
app.use(express.static('node_modules'));

io.on('connection', function (socket) {
	ioSocket = socket;

	socket.on('parseOSMFile', function (mapBounds) {
		console.log(mapBounds);
		var bbox = [mapBounds.west, mapBounds.south, mapBounds.east, mapBounds.north];

		// parseOSMFileLocalAndBuildMap(bbox);
		parseOSMFileFromServerAndBuildMap(bbox);
	});
});

function parseOSMFileFromServerAndBuildMap(bbox) {
	var url = "http://overpass-api.de/api/map?bbox=" + bbox.toString();

	var http = require('http');
	var mapDataXML = '';

	var req = http.request(url, function(res) {
		createGeojsonAndBuildMap(res, bbox);
  		res.pipe(fs.createWriteStream("./server/data/actual.xml"));
	});

	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});

	req.end();
}

function parseOSMFileLocalAndBuildMap (bbox) {
	var readStream = fs.createReadStream("./server/data/osm_regensburg_small.xml");
	createGeojsonAndBuildMap(readStream, bbox);
}

function createGeojsonAndBuildMap (fileStream, bbox) {
	osmParser.parseFileStream(fileStream, function (geoObjectCollection) {
		var geoData = geoObjectCollection.getGeoDataForCategory('water');

		GeoJSON.parse(geoData, { Point: 'point', LineString: 'line', Polygon: 'polygon', bbox: bbox }, function(geojson) {
			var geojsonString = JSON.stringify(geojson, null, "\t");
			var formattedGeojsonString = geojsonString.replace(/\"(\d+\.?\d*)\"/g, "$1");
			
			fs.writeFile("./server/data/test.geojson", formattedGeojsonString, function (err) {
				if (err) console.log(err);
				else buildMap();
			});
		});	
	});
}

app.listen(8000);


function buildMap () {
	

	var map = new mapnik.Map(800, 450);
	map.load('./server/data/test.xml', function(err,map) {
	    if (err) throw err;
	    map.zoomAll();
	    var im = new mapnik.Image(800, 450);
	    map.render(im, function(err,im) {
	      if (err) throw err;
	      im.encode('png', function(err,buffer) {
	          if (err) throw err;
	          fs.writeFile('map.png',buffer, function(err) {
	              if (err) throw err;
	              console.log('saved map image to map.png');
	          });
	      });
	    });
	});
}