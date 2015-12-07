'use strict';

module.exports = function () {

	var polygon = {
		shape: "",
		category: "",
		coordList: []
	};

	var functions = {
		setShape: setShape,
		setCategory: setCategory,
		setCoordList: setCoordList,
		getShape: getShape,
		getCategory: getCategory,
		getCoordList: getCoordList,
		toJSON: toJSON
	};

	function setShape (shape) {
		polygon.shape = shape;
	}

	function setCategory (cat) {
		polygon.category = cat;
	}

	function setCoordList (coordList) {
		polygon.coordList = coordList;
	}

	function getShape () {
		return polygon.shape;
	}

	function getCategory () {
		return polygon.category;
	}

	function getCoordList () {
		return polygon.coordList;
	}

	function toJSON () {
		return polygon;
	}

	return functions;
}