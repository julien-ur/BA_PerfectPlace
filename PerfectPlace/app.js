'use strict';

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var saxStream = require("sax").createStream(true);
var categories = require("./server/js/categories.js");
var polygon = require('./server/js/polygon.js');
var polygonListCollection = require('./server/js/polygon-list-collection.js');
var svg = require('./server/js/mini-svg');
var svg2png = require('svg2png');

var ioSocket;
var mapBounds;

server.listen(80);

app.use(express.static('public'));
app.use(express.static('node_modules'));

io.on('connection', function (socket) {
	ioSocket = socket;
});

ioSocket.on('generateMap', function (bbox) {
	generateMap();
});

ioSocket.on('importPolygonListCollection', function (bbox) {
	importPolygonListCollection();
});

function generateMap (bbox) {
	mapBounds = bbox;
	
	var bboxString = mapBounds.west + "," + mapBounds.south + "," + mapBounds.east + "," + mapBounds.north;
	var url = "http://overpass-api.de/api/map?bbox=" + bboxString;

	var http = require('http');
	var mapDataXML = '';

	var req = http.request(url, function(res) {
  		res.pipe(saxStream).pipe(fs.createWriteStream("./server/data/actual.xml"));
	});

	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});

	req.end();
}

app.listen(8000);


var nodeList = {};
var actualNodeID = null;
var wayNodeIDList = null;

saxStream.on("opentag", function (tag) {

	if (tag.name === "node") {
		saveNewNode(tag.attributes);
	}
	else if (tag.name === "way") {
		wayNodeIDList = [];
	}
	else if (tag.name === "nd") {
		wayNodeIDList.push(tag.attributes.ref);
	}
	else if (tag.name === "tag") {
		var subCategory = getSubCategoryName(tag.attributes.v)

		if (subCategory) {
			if (actualNodeID !== null) {
				saveNodePolygon(subCategory);
			}
			else if (wayNodeIDList !== null) {
				saveWayPolygon(subCategory);
			}
		}
	}

	function saveNewNode (attributes) {
		actualNodeID = attributes.id
		var coords = {
			lat: attributes.lat,
			lon: attributes.lon
		}
		nodeList[actualNodeID] = { coords: coords };
	}

	function getSubCategoryName (tagValue) {
		for (var category in categories) {
			for (var subCategory in categories[category]) {
				for (var tagNum = 0; tagNum < categories[category][subCategory].length; tagNum++) {
					if (tagValue === categories[category][subCategory][tagNum]) {
						return subCategory;
					}
				}
			}
		}
		return null;
	}

	function saveNodePolygon (subCategory) {
		addNewPolygonToCollection(subCategory, [nodeList[actualNodeID].coords]);
		actualNodeID = null;
	}

	function saveWayPolygon (subCategory) {
		var coordList = [];
		for(var i = 0; i < wayNodeIDList.length; i++) {
			coordList.push(nodeList[wayNodeIDList[i]].coords);
		}

		addNewPolygonToCollection(subCategory, coordList);
		wayNodeIDList = null;
	}

	function addNewPolygonToCollection (subCategory, coordList) {
		var polygonObj = polygon();
		polygonObj.setCategory(subCategory);
		polygonObj.setCoordList(coordList);
		polygonObj.setShape(computePolygonShape(coordList));
		polygonListCollection.addPolygon(polygonObj);
	}

	function computePolygonShape (coordList) {
		var shape = "";

		if (!coordList || coordList.length == 0) {
			shape = "no shape";
		} else if (coordList.length == 1) {
			shape = "circle";
		} else {
			if (coordList[0] != coordList[coordList.length-1]) {
				shape = "line";
			} else {
				shape = "area";
			}
		}
		return shape;
	}
});

saxStream.on("closetag", function (tagName) {
	if (tagName === "node") {
		actualNodeID = null;
	} 
	else if (tagName === "way") {
		wayNodeIDList = null;
	}
});

saxStream.on("end", function () {
	var jsonPath = "./server/data/polygon-list-collection-export.json";
	// polygonListCollection.exportToJSON(jsonPath);
	polygonListCollection.importFromJSON(jsonPath, drawPolygonsToMap)
	// drawPolygonsToMap();
});

function drawPolygonsToMap () {
	var mapWidthInPixel = 800;
	var mapHeightInPixel = 450;

	var mapWidthInDegrees = mapBounds.east - mapBounds.west;
	var mapHeightInDegrees = mapBounds.north - mapBounds.south;

	var pixelPerLonDegree = mapWidthInPixel / mapWidthInDegrees;
	var pixelPerLatDegree = mapHeightInPixel / mapHeightInDegrees;

	var testLayer = svg(mapWidthInPixel, mapHeightInPixel);
	var polygonList = polygonListCollection.getPolygonList('park');

	for (var polyNum = 0; polyNum < polygonList.length; polyNum++) {
		var coordList = polygonList[polyNum].getCoordList();
		var polyPoints = [];

		for (var coordNum = 0; coordNum < coordList.length; coordNum++) {

			var xPosInDegrees = coordList[coordNum].lon - mapBounds.west;
			var yPosInDegrees = mapBounds.north - coordList[coordNum].lat;

			polyPoints.push([xPosInDegrees * pixelPerLonDegree, yPosInDegrees * pixelPerLatDegree])
		}

		var shape = polygonList[polyNum].getShape();
		var randomColor = '#' + ('00000'+(Math.random()*(1<<24)|0).toString(16)).slice(-6);

		if (shape === 'circle') {
			testLayer.addCircle(polyPoints[0][0], polyPoints[0][1], 4, randomColor);
		} else if (shape === 'line') {
			testLayer.addPolyline(polyPoints, randomColor, 3);
		} else if (shape === 'area') {
			testLayer.addPolygon(polyPoints, randomColor, 0);
		}
	}

	testLayer.draw();
	testLayer.writeFile('./server/data/test.svg');

	var png;
	svg2png("./server/data/test.svg", "./public/data/dest.png", function (err) {
	    if(err) { 
	    	console.log(err);
	    } else {
			ioSocket.emit('imageCreated', mapBounds);
	    	console.log('done');
	    }
	});
}