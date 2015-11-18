'use strict';

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var $ = require('jquery');
var strict = true; // set to false for html-mode
var saxStream = require("sax").createStream(strict);
var categories = require("./server/js/categories.js");

//console.log(require("./server/js/node-element.js"));

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
			// res.on('data', function (chunk) {
			//     mapDataXML += chunk;
			// });

			// res.on('end', function() {
			//     parseMapDataXml(mapDataXML);
			// });

	  		res.pipe(saxStream);
		});

		req.on('error', function(e) {
			console.log('problem with request: ' + e.message);
		});

		req.end();
	});
});

var pointList;
var wayList;
var node;
var way;

saxStream.on("opentag", function (el) {

	if (el.name === "node")
	{
		node = el;
		node = require("./server/js/node-element.js");
		node.setCoords(el.attributes.lat, el.attributes.lon);
	}

	else if (el.name === "way")
	{

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
						node.setCategory(el.attributes.v);
						return;
					}
				}
			}
		}
	}

});

saxStream.on("closetag", function (tagName) {

	if(tagName === "node")
	{
		console.log(node.getNodeInfo());
	}

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

app.listen(8000);

