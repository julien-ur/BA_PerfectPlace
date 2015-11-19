'use strict';

module.exports = function () {

	var values = {
		coordList: [],
		category: ""
	};

	var functions = {
		addCoordList: function (coordList) {
			values.coordList = coordList;
		},

		setCategory: function (cat) {
			values.category = cat;
		},

		getCategory: function () {
			return values.category;
		},

		getPolygonInfo: function () {
			return {
				shape: computeActualShape(),
				category: values.category,
				coordList: values.coordList
			};
		}
	}

	function computeActualShape ()
	{
		var shape = "";

		if (!values.coordList || values.coordList.length == 0)
		{
			shape = "no shape";
		}

		else if (values.coordList.length == 1)
		{
			shape = "point";
		}

		else 
		{
			if (values.coordList[0] != values.coordList[values.coordList.length-1])
			{
				shape = "line";
			}
			else
			{
				shape = "area";
			}
		}

		return shape;
	}

	return functions;
}

