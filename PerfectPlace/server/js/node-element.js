'use strict';
	
	var coords = [];
	var category = "";

	exports.setCoords =  function (lat, lon) {
		coords = [lat, lon];
	},

	exports.setCategory = function (cat) {
		category = cat;
	},

	exports.getNodeInfo = function () {
		return {
			category: category,
			coords: coords
		};
	}