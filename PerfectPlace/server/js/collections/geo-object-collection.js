'use strict';

var categories = require("../categories.js");

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
		addObject: addObject,
		setBoundingBox: setBoundingBox,
		getBoundingBox: getBoundingBox,
		getGeoDataForCategory: getGeoDataForCategory
	};

	function addObject(category, shape, coordData) {
		var geoData = values.geoObjectCollection[category];

		if (shape === 'point') {
			geoData.push({
				point: coordData
			});
		} else if (shape === 'line') {
			geoData.push({
				line: coordData
			});
		} else if (shape === 'polygon') {
			geoData.push({
				polygon: coordData
			});
		}
	}

	function setBoundingBox(bbox) {
		values.boundingBox = bbox;
	}

	function getBoundingBox() {
		return values.boundingBox;
	}

	function getGeoDataForCategory(category) {
		return values.geoObjectCollection[category];
	}

	return functions;
}