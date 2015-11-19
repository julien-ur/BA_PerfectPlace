'use strict';
	
	var refIDs = [];
	var category = "";

	exports.addRefID =  function (id) {
		refIDs.push(id);
	},

	exports.setCategory = function (cat) {
		category = cat;
	},

	exports.getRefIDs = function () {
		return refIDs;
	}