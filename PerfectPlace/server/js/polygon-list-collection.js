'use strict';

	var polygonListCollection = {};
	var categories = require("./categories.js");
	var polygon = require('./polygon.js');
	var fs = require("fs");

	for (var category in categories) {
		for (var subCategory in categories[category]) {
			polygonListCollection[subCategory] = [];
		}
	}

	exports.addPolygon = function(polygon) {
		polygonListCollection[polygon.getCategory()].push(polygon);
	}

	exports.getPolygonList = function(category) {
		return polygonListCollection[category];
	}

	exports.getAll = function () {
		return polygonListCollection;
	}

	exports.exportToJSON = function (path) {
		fs.writeFile(path, JSON.stringify(polygonListCollection, null, "\t"), function (err) {
			if (err) {
				console.log(err);
			} else {
				console.log("PolygonListCollection exported to " + path);
			}
		});
	}

	exports.importFromJSON = function (path, callbackFunct) {
		fs.readFile(path, 'utf8', function (err, data) {
		  if (err) { console.log(err); }

		  var importedJSON = JSON.parse(data);

		  for (var listName in  importedJSON) {
	  		for (var polygonIndex in importedJSON[listName]) {

	  			var importedPolygon = importedJSON[listName][polygonIndex];
				var polygonObj = polygon();
				polygonObj.setShape(importedPolygon.shape);
				polygonObj.setCategory(importedPolygon.category);
				polygonObj.setCoordList(importedPolygon.coordList);
				exports.addPolygon(polygonObj);
	  		}
		  }
		  callbackFunct();
		});
	}