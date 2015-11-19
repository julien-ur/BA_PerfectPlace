'use strict';
	
	var id = 0;
	var coords = {};

	exports.setID = function (id) {
		id = id;
	}

	exports.setCoords =  function (lat, lon) {
		coords = {
			lat: lat,
			lon: lon
		};
	},

	exports.getID = function () {
		return id;
	},

	exports.getCoords = function () {
		return coords;
	}