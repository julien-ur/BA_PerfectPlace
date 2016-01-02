'use strict';

var GeoJSON = require('geojson');

module.exports = function (geoObjectCollection, callback) {
	var geoObjectList = geoObjectCollection.getListForCategory('water');
	var geoData = [];
	
	for (var polyNum = 0; polyNum < geoObjectList.length; polyNum++) {
		var geoObj = geoObjectList[polyNum];
		var shape = geoObj.getShape();
		var category = geoObj.getCategory();
		var coordData = geoObj.getCoordData();

		addObjectToGeoData(shape, category, coordData);
	}

	function addObjectToGeoData (shape, category, coordData) {
		if (shape === 'point') {
			geoData.push({
				coords: coordData,
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

	GeoJSON.parse(geoData, {'Point': 'coords', 'LineString': 'line', 'Polygon': 'polygon'}, function(geojson) {
		var geojsonString = JSON.stringify(geojson, null, "\t");
		var formattedGeojsonString = geojsonString.replace(/\"(\d+\.?\d*)\"/g, "$1");
		callback(formattedGeojsonString);
	});
}