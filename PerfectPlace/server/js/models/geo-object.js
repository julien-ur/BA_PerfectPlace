'use strict';

module.exports = function () {

	var values = {
		shape: "",
		category: "",
		coordData: []
	};

	var functions = {
		setShape: setShape,
		setCategory: setCategory,
		setCoordData: setCoordData,
		getShape: getShape,
		getCategory: getCategory,
		getCoordData: getCoordData
	};

	function setShape (shape) {
		values.shape = shape;
	}

	function setCategory (cat) {
		values.category = cat;
	}

	function setCoordData (coordData) {
		values.coordData = coordData;
	}

	function getShape () {
		return values.shape;
	}

	function getCategory () {
		return values.category;
	}

	function getCoordData () {
		return values.coordData;
	}

	return functions;
}