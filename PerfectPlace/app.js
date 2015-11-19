'use strict';

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var saxStream = require("sax").createStream(true);
var categories = require("./server/js/categories.js");
var polygon = require('./server/js/polygon.js');
var polygonListCollection = require('./server/js/polygon-list-collection.js')

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
	  		res.pipe(saxStream).pipe(fs.createWriteStream("test.xml"));
		});

		req.on('error', function(e) {
			console.log('problem with request: ' + e.message);
		});

		req.end();
	});
});

app.listen(8000);


var nodeList = {};
var actualNodeID = null;
var wayNodeIDList = null;

saxStream.on("opentag", function (tag) {

	if (tag.name === "node")
	{
		saveNewNode(tag.attributes);
	}

	else if (tag.name === "way")
	{
		wayNodeIDList = [];
	}

	else if (tag.name === "nd")
	{
		wayNodeIDList.push(tag.attributes.ref);
	}

	else if (tag.name === "tag")
	{
		var subCategory = getSubCategoryName(tag.attributes.v)

		if (subCategory)
		{
			if (actualNodeID !== null)
			{
				saveNodePolygon(subCategory);
			}

			else if (wayNodeIDList !== null)
			{
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

	function getSubCategoryName (tagName) {
		for (var category in categories)
		{
			for (var subCategory in categories[category])
			{
				for (var tagNum = 0; tagNum < categories[category][subCategory].length; tagNum++)
				{
					if (tagName === categories[category][subCategory][tagNum])
					{
						return subCategory;
					}
				}
			}
		}
		return null;
	}

	function saveNodePolygon (subCategory)
	{
		addNewPolygonToCollection(subCategory, [nodeList[actualNodeID].coords]);
		actualNodeID = null;
	}

	function saveWayPolygon (subCategory)
	{
		var coordList = [];

		for(var i = 0; i < wayNodeIDList.length; i++)
		{
			coordList.push(nodeList[wayNodeIDList[i]].coords);
		}

		addNewPolygonToCollection(subCategory, coordList);

		wayNodeIDList = null;
	}

	function addNewPolygonToCollection (subCategory, coordList) {
		var polygonObj = polygon();

		polygonObj.setCategory(subCategory);
		polygonObj.addCoordList(coordList);

		polygonListCollection.addPolygon(polygonObj);
	}
});

saxStream.on("closetag", function (tagName) {
	if (tagName === "node")
	{
		actualNodeID = null;
	}

	else if (tagName === "way")
	{
		wayNodeIDList = null;
	}
});

saxStream.on("end", function () {

	for (var category in categories)
	{
		for (var subCategory in categories[category])
		{
			var polygonList = polygonListCollection.getPolygonList(subCategory);
			
			for(var i = 0; i < polygonList.length; i++)
			{
				console.log(polygonList[i].getPolygonInfo());
			}
		}
	}
});