'use strict';

var categories = require("../models/categories.js");

module.exports = function () {

	var values = {
		boundingBox: {},
		geoObjectCollection: {}
	};

	for (var category in categories) {
		for (var subCategory in categories[category]) {
			values.geoObjectCollection[subCategory] = [];
		}
	}

	var functions = {
		setBoundingBox: setBoundingBox,
		addObject: addObject,
		getBoundingBox: getBoundingBox,
		getGeoDataForCategory: getGeoDataForCategory
	};

	function setBoundingBox(bbox) {
		values.boundingBox = bbox;
	}

	function addObject(category, shape, coordData) {
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

	function getBoundingBox() {
		return values.boundingBox;
	}

	function getGeoDataForCategory(category) {
		return values.geoObjectCollection[category];
	}

	return functions;
}