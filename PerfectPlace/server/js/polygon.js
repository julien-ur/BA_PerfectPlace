'use strict';

module.exports = function () {

	var values = {
		category: "",
		coordList: []
	};

	var functions = {
		setCategory: setCategory,
		setCoordList: setCoordList,
		getShape: getShape,
		getCategory: getCategory,
		getCoordList: getCoordList,
		getPolygonInfo: getPolygonInfo
	};

	function setCategory (cat) {
		values.category = cat;
	}

	function setCoordList (coordList) {
		values.coordList = coordList;
	}

	function getShape () {
		return computeActualShape();
	}

	function getCategory () {
		return values.category;
	}

	function getCoordList () {
		return values.coordList;
	}

	function getPolygonInfo () {
		return {
			shape: computeActualShape(),
			category: values.category,
			coordList: values.coordList
		};
	}

	function computeActualShape () {
		var shape = "";

		if (!values.coordList || values.coordList.length == 0) {
			shape = "no shape";
		} else if (values.coordList.length == 1) {
			shape = "point";
		} else {
			if (values.coordList[0] != values.coordList[values.coordList.length-1]) {
				shape = "line";
			} else {
				shape = "area";
			}
		}
		return shape;
	}

	return functions;
}

