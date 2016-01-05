'use strict';

var categories = require("../models/categories.js");

module.exports = function () {

	var values = {
		geoObjectCollection: {},
		boundingBoxCoords: {}
	};

	for (var category in categories) {
		for (var subCategory in categories[category]) {
			values.geoObjectCollection[subCategory] = [];
		}
	}

	var functions = {
		addObject: addObject,
		getGeoDataForCategory: getGeoDataForCategory
	};

	function setBoundingBox (bbox) {
		values.boundingBoxCoords = bbox;
	}

	function addObject (category, shape, coordData) {
		var geoData = values.geoObjectCollection[category];

		if (shape === 'point') {
			geoData.push({
				point: coordData,
				category: category
			});
		} else if (shape === 'line') {
			geoData.push({
				line: coordData,
				category: category
			});
		} else if (shape === 'polygon') {
			geoData.push({
				polygon: coordData,
				category: category
			});
		}
	}

	function getGeoDataForCategory (category) {
		return values.geoObjectCollection[category];
	}

	return functions;
}