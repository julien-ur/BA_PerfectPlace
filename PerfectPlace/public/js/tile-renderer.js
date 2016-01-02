'use-strict';

var map;
var socket;

window.onload = function() {

	// create a map in the "map" div, set the view to a given place and zoom
	map = L.map('map').setView([49.017222, 12.096944], 14);

	// add MapQuest tile layer, must give proper OpenStreetMap attribution according to MapQuest terms
	L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png', {
		subdomains: '1234',
		attribution: '&copy; <a href="http://info.mapquest.com/terms-of-use/">MapQuest</a> | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map);

	socket = io.connect('http://localhost');

	socket.on('imageCreated', function (geojsonFeatures) {
		// var imageUrl = 'http://localhost:8000/data/dest.png',
		//     imageBounds = [[bbox.south, bbox.west], [bbox.north, bbox.east]];

		// L.imageOverlay(imageUrl, imageBounds).addTo(map);
		console.log('added');

		L.geoJson(geojsonFeatures, {
			onEachFeature: function (feature, layer) {
				console.log(feature);
				console.log(layer);
			}
		}).addTo(map);
	});

	map.on('click', onMapClick);
};

function onMapClick(e) {
	var bounds = map.getBounds();
	var bbox = {
		west: bounds.getWest(),
		south: bounds.getSouth(),
		east: bounds.getEast(),
		north: bounds.getNorth()
	}
	socket.emit('parseOSMFile', bbox);
};






