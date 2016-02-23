'use strict';

var Categories =  {

	SHOPPING : {
		supermarket : ["supermarket"],
		bakery : ["bakery"],
		butcher : ["butcher"],
		mall : ["mall"],
		kiosk : ["kiosk"]
	},

	NATURE : {
		park : ["park", "recreation_ground", "village_green"],
		wood : ["wood", "forrest"],
		countryside : ["farmland", "meadow", "reservoir", "nature reserve", "farm"],
		water : ["river", "riverbank", "fairway", "water", "coastline", "bay", "stream", "canal", "drain", "ditch"]
	},

	TRAFFIC : {
		bus : ["bus_stop", "bus_station"],
		train : ["train_station"],
		motorway : ["motorway"],
		subway : ["subway_entrance"],
		tram: ["tram_stop"]
	},

	EDUCATION : {
		kindergarten : ["kindergarten"],
		school : ["school"],
		university : ["university"]
	},

	SPORTS : {
		swimming : ["swimming_pool", "water_park"],
		fitness: ["gym", "sports_centre"],
		tennis : ["tennis"],
		soccer: ["soccer"],
		boxing: ["boxing"],
		dancing: ["dance"]
	},

	GASTRONOMY : {
		restaurant : ["restaurant"],
		cafe : ["cafe"],
		pub : ["pub"]
	},

	MEDICINE : {
		doctor : ["doctors"],
		hospital : ["hospital"],
		pharmacy : ["pharmacy"]
	},

	CHILDREN : {
		playground : ["playground"],
		livingstreet : ["living_street"]
	}
};

// Compatability for Node and Client
// Source: http://stackoverflow.com/a/23750731/4218628
(function(window) {

	if(typeof module === 'object' && module && typeof module.exports === "object") {
		module.exports = Categories;
	} else {
		window.Categories = Categories
	}

})(this);