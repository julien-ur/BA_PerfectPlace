'use strict';

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var osmParser = require('./server/js/utils/osm-parser.js');
var geojsonConverter = require('./server/js/utils/geojson-converter');

var ioSocket;
var mapBounds;

var mapnik = require('mapnik');
var mapnikify = require('geojson-mapnikify');

// register fonts and datasource plugins
mapnik.register_default_fonts();
mapnik.register_default_input_plugins();


// var geojson = JSON.parse(fs.readFileSync("./server/data/test.geojson"));

// mapnikify(geojson, true, function (err, xml) {
// 	var path = "./server/data/mapnik.xml";
// 	fs.writeFile(path, xml, function (err) {
// 		if (err) {
// 			console.log(err);
// 		} else {
// 			// buildMap();
// 		}
// 	});
// });


server.listen(80);

app.use(express.static('public'));
app.use(express.static('node_modules'));

io.on('connection', function (socket) {
	ioSocket = socket;

	socket.on('parseOSMFile', function (bbox) {
		console.log(bbox);
		mapBounds = bbox;

		// parseOSMFileLocalAndBuildMap();
		parseOSMFileFromServerAndBuildMap();
	});
});

function parseOSMFileFromServerAndBuildMap() {
	var bboxString = mapBounds.west + "," + mapBounds.south + "," + mapBounds.east + "," + mapBounds.north;
	var url = "http://overpass-api.de/api/map?bbox=" + bboxString;

	var http = require('http');
	var mapDataXML = '';

	var req = http.request(url, function(res) {
		createGeojsonAndBuildMap(res);
  		res.pipe(fs.createWriteStream("./server/data/actual.xml"));
	});

	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});

	req.end();
}

function parseOSMFileLocalAndBuildMap () {
	var readStream = fs.createReadStream(ptha);
	createGeojsonAndBuildMap(readStream);
}

function createGeojsonAndBuildMap (fileStream) {
	osmParser.parseFileStream(fileStream, function (geoObjects) {
		geojsonConverter(geoObjects, function (geojsonString) {
			fs.writeFile("./server/data/test.geojson", geojsonString, function (err) {
				if (err) console.log(err);
				else buildMap();
			});
		});
	});
}

app.listen(8000);


function buildMap () {
	var map = new mapnik.Map(800, 450);
	map.load('./server/data/mapnik.xml', function(err,map) {
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