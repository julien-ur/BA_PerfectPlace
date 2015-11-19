'use strict';
	var shape = "no shape";
	var coordList = [{}];
	var category = "";

	function computeActualShape ()
	{
		var shape = "";

		if (!coordList || coordList.length == 0)
		{
			shape = "no shape";
		}

		else if (coordList.length == 1)
		{
			shape = "point";
		}

		else 
		{
			if (coordList[0] != coordList[coordList.length-1])
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

	exports.addCoords =  function (coords) {
		coordList.push(coords);
	},

	exports.setCategory = function (cat) {
		category = cat;
	},

	exports.getActualShape = function () {
		return computeActualShape();
	},

	exports.getPolygonInfo = function () {
		return {
			shape: computeActualShape(),
			category: category,
			coordList: coordList
		};
	}