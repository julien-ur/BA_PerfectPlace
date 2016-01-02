'use strict';

var categories = require("../models/categories.js");

module.exports = function () {

	var values = {
		geoObjectCollection: {}
	};

	for (var category in categories) {
		for (var subCategory in categories[category]) {
			values.geoObjectCollection[subCategory] = [];
		}
	}

	var functions = {
		add: add,
		getListForCategory: getListForCategory
	};

	function add (geoObj) {
		var category = geoObj.getCategory();
		values.geoObjectCollection[category].push(geoObj);
	}

	function getListForCategory (category) {
		return values.geoObjectCollection[category];
	}

	return functions;
}