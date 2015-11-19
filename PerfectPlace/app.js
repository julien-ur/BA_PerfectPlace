'use strict';

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var $ = require('jquery');
var strict = true; // set to false for html-mode
var saxStream = require("sax").createStream(strict);
var categories = require("./server/js/categories.js");
var socket;

server.listen(80);

app.use(express.static('public'));
app.use(express.static('node_modules'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
	socket.on('generateMap', function (url) {
		console.log("clicked");

		var http = require('http');
		var mapDataXML = '';

		var req = http.request(url, function(res) {
	  		res.pipe(saxStream);
		});

		req.on('error', function(e) {
			console.log('problem with request: ' + e.message);
		});

		req.end();
	});
});

app.listen(8000);


var actualNodeID;
var nodeList = {};
var refIDList = [];
var polygon;

saxStream.on("opentag", function (el) {

	if (el.name === "node")
	{
		actualNodeID = el.attributes.id
		
		var coords = {
			lat: el.attributes.lat,
			lon: el.attributes.lon
		}

		nodeList[actualNodeID] = { coords: coords };
	}

	else if (el.name === "way")
	{
		refIDList = [];
	}

	else if (el.name === "nd")
	{
		refIDList.push(el.attributes.ref);
	}

	else if (el.name === "tag")
	{
		for (var category in categories)
		{
			for (var subCategory in categories[category])
			{
				for(var tagNum = 0; tagNum < categories[category][subCategory].length; tagNum++)
				{
					if (el.attributes.v === categories[category][subCategory][tagNum])
					{
						polygon = null;
						polygon = require('./server/js/polygon.js');
						polygon.setCategory(el.attributes.v);
						console.log(polygon.getPolygonInfo());

						if (actualNodeID != -1)
						{
							polygon.addCoords(nodeList[actualNodeID].coords);
							actualNodeID = -1;
							
						}

						else if (refIDList || refIDList.length != 0)
						{
							for(var i = 0; i < refIDList.length; i++)
							{
								var coords = nodeList[refIDList[i]].coords;
								polygon.addCoords(coords);
							}

							refIDList = [];
						}

						
					}
				}
			}
		}
	}

});

saxStream.on("closetag", function (tagName) {
	if (tagName === "node")
	{
		actualNodeID = -1;
	}

	else if (tagName === "way")
	{
		refIDList = [];
	}

});

saxStream.on("end", function () {
	
});



// function parseMapDataXml(mapDataXML) {
	
// 	var bars = mapDataXML.querySelectorAll("[v=bar]");
	
// 	console.log(bars);

// 	var barsJson = [];

// 	for (var i = 0; i < bars.length; i++)
// 	{
// 		var barEl = bars[i].parentNode;
		
// 		if (barEl.tagName == "node") 
// 		{ 
// 			var barInfo = 
// 	    	{
// 	    		"type": "Point",
// 	    		"coordinates": [barEl.getAttribute('lon'), barEl.getAttribute('lat')]
// 	    	}
// 		}
    	
//     	barsJson.push(barInfo);
//     	console.log(barInfo);
// 	}

// 	// var barIcon = L.icon({
// 	// 	iconUrl: 'resources/img/bar.png',
// 	// 	iconSize: [25, 25]
// 	// });

// 	// var barsLayer = L.geoJson(barsJson, {
		
// 	// 	pointToLayer: function (feature, latlng) {
// 	// 		return L.marker(latlng, {icon: barIcon});
// 	// 	}
// 	// }).addTo(map);

// 	// console.log(barsLayer);
// }