var map;

window.onload = function() {

	// create a map in the "map" div, set the view to a given place and zoom
	map = L.map('map').setView([49.017222, 12.096944], 14);

	// add MapQuest tile layer, must give proper OpenStreetMap attribution according to MapQuest terms
	L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png', {
		subdomains: '1234',
		attribution: '&copy; <a href="http://info.mapquest.com/terms-of-use/">MapQuest</a> | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map);

	map.on('click', onMapClick);
};

function onMapClick(e) {
	var bounds = map.getBounds();
	var bbox = bounds.getWest() + "," + bounds.getSouth() + "," + bounds.getEast() + "," + bounds.getNorth();
	var url = "http://overpass-api.de/api/map?bbox=" + bbox;

	var socket = io.connect('http://localhost');
	socket.emit('generateMap', url);
}




