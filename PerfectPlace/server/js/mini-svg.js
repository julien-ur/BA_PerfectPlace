'use strict';

var _ = require('underscore');
var fs = require('fs');
_.templateSettings.interpolate = /\{\{(.+?)\}\}/g;

var head = '<svg xmlns="http://www.w3.org/2000/svg" width="{{ width }}" height="{{ height }}">' + '\n' + '{{ body }}' + '\n' + '</svg>';
var circle = '<ellipse cx="{{ x }}" cy="{{ y }}" rx="{{ radius }}" ry="{{ radius }}" fill="{{ color }}" />';
var polyline = '<polyline points="{{ points }}" fill="none" stroke="{{ color }}" stroke-width="{{ lineWidth }}" />';
var polygon = '<polygon points="{{ points }}" fill="{{ color }}" {{ stroke }}/>';
var strokeOptions = 'stroke="{{ color }}" stroke-width="{{ strokeWidth }}"';
var indent = '   ';

module.exports = function (width, height) {

	var values = {
		svg: '',
		elements: []
	};

	var functions = {
		addCircle: addCircle,
		addPolyline: addPolyline,
		addPolygon: addPolygon,
		draw: draw,
		writeFile: writeFile
	};

	function addCircle (x, y, radius, colorString) {
		var newCircle = _.template(circle);
		newCircle = newCircle({ x: x, y: y, radius: radius, color: colorString });
		
		addToElements(newCircle);
	}

	function addPolyline (pointList, colorString, lineWidth) {
		var newPolyline = _.template(polyline);
		newPolyline = newPolyline({ points: pointsToString(pointList), color: colorString, lineWidth: lineWidth });

		addToElements(newPolyline);
	}

	function addPolygon (pointList, colorString, strokeWidth) {
		var newPolygon = _.template(polygon);
		var optionalStroke = createOptionalStroke(colorString, strokeWidth);
		newPolygon = newPolygon({ points: pointsToString(pointList), color: colorString, stroke: optionalStroke });

		addToElements(newPolygon);
	}

	function draw () {
		var elements = values.elements.toString().replace(/\>,/g, "\>\n");
		values.svg = _.template(head)({ width: width, height: height, body: elements });
	}

	function writeFile (relativeFilePath) {
		fs.writeFile(relativeFilePath, values.svg, function (err) {
			if(err) console.log(err);
		});
	}


	function pointsToString (pointList) {
		var pointString = "";
		for (var num = 0; num < pointList.length; num++) {
			pointString += pointList[num][0] + "," + pointList[num][1] + " ";
		};

		return pointString;
	}

	function createOptionalStroke (colorString, strokeWidth) {
		var newStroke;

		if(strokeWidth > 0) {
			newStroke = _.template(strokeOptions)({ color: colorString, strokeWidth: strokeWidth });
		} else {
			newStroke = '';
		}

		return newStroke;
	}

	function addToElements (element) {
		values.elements.push(indent + element);
	}

	return functions;
}