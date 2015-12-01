'use strict';

	var polygonListCollection = {};
	var categories = require("./categories.js");

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