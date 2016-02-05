'use strict';

var saxStream = require('sax').createStream(true);
var categories = require('../models/categories.js');
var geoObjectCollection = require('../collections/geo-object-collection.js');

var LON_INDEX = 0;
var LAT_INDEX = 1;

var nodeCoordList = {};
var wayList = {};

var actualNodeID = null;
var actualWayID = null;
var relationMemberWaysReferenceList = null;

var geoObjects;
var callback;

saxStream.on("opentag", function (tag) {

	if (tag.name === "bounds") {
		geoObjects.setBoundingBox({ 
			minlat: parseFloat(tag.attributes.minlat),
			minlon: parseFloat(tag.attributes.minlon),
			maxlat: parseFloat(tag.attributes.maxlat),
			maxlon: parseFloat(tag.attributes.maxlon)
		});
	}
	if (tag.name === "node") {
		actualNodeID = tag.attributes.id
		var coords = [tag.attributes.lon, tag.attributes.lat];
		nodeCoordList[actualNodeID] = coords;
	}
	else if (tag.name === "way") {
		actualWayID = tag.attributes.id;
		wayList[actualWayID] = [];
	}
	else if (tag.name === "nd") {
		wayList[actualWayID].push(tag.attributes.ref);
	}
	else if (tag.name === "relation")
	{
		relationMemberWaysReferenceList = [];
	}
	else if (tag.name === "member")
	{
		var role = tag.attributes.role;
		if (role == "outer" || role == "inner")
		{
			relationMemberWaysReferenceList.push({
				role: role,
				id: tag.attributes.ref
			});
		}
	}
	else if (tag.name === "tag") {
		var subCategory = getSubCategoryNameForTagValue(tag.attributes.v);

		if (subCategory) {
			if (actualNodeID !== null) {
				saveNewNodeObjectInCollection(subCategory);
			}
			else if (actualWayID !== null) {
				saveNewWayObjectInCollection(subCategory);
			}
			else if (relationMemberWaysReferenceList !== null && relationMemberWaysReferenceList.length > 0) {
				saveNewRelationObjectInCollection(subCategory);
			}
		}
	}
});

saxStream.on("closetag", function (tagName) {
	if (tagName === "node") {
		actualNodeID = null;
	} 
	else if (tagName === "way") {
		actualWayID = null;
	}
	else if (tagName === "relation") {
		relationMemberWaysReferenceList = null;
	}
});

saxStream.on("end", function () {
	callback(geoObjects);
});


function getSubCategoryNameForTagValue(tagValue) {
	for (var category in categories) {
		for (var subCategory in categories[category]) {
			for (var tagNum = 0; tagNum < categories[category][subCategory].length; tagNum++) {
				if (tagValue === categories[category][subCategory][tagNum]) {
					return subCategory;
				}
			}
		}
	}
	return null;
}

function saveNewNodeObjectInCollection(subCategory) {
	var nodeCoords = nodeCoordList[actualNodeID];
	geoObjects.addObject(subCategory, "point", nodeCoords);
	actualNodeID = null;
}

function saveNewWayObjectInCollection(subCategory) {
	var wayCoordList = [];

	for(var nodeNum = 0; nodeNum < wayList[actualWayID].length; nodeNum++) {
		var nodeID = wayList[actualWayID][nodeNum];
		wayCoordList.push(nodeCoordList[nodeID]);
	}

	var shape = computeWayShape(wayCoordList);
	if (shape === "polygon") wayCoordList = [wayCoordList];
	
	geoObjects.addObject(subCategory, shape, wayCoordList);
	actualWayID = null;
}

function saveNewRelationObjectInCollection(subCategory) {
	var relationCoordList = [[]];

	for (var wayNum = 0; wayNum < relationMemberWaysReferenceList.length; wayNum++) {
		var memberWayRef = relationMemberWaysReferenceList[wayNum];
		var actualWay = wayList[memberWayRef.id];
		var role = memberWayRef.role;

		if(actualWay && actualWay.length > 0) {
			relationCoordList = addWayToRelationCoordList(relationCoordList, actualWay, role);
		} else if (role === "outer") { 
			relationMemberWaysReferenceList = null; 
			return;
		}
	}

	geoObjects.addObject(subCategory, "polygon", relationCoordList);
	relationMemberWaysReferenceList = null;
}

function computeWayShape(wayCoordList) {
	if (wayCoordList[0][LAT_INDEX] !== wayCoordList[wayCoordList.length-1][LAT_INDEX] 
		&& wayCoordList[0][LON_INDEX] !== wayCoordList[wayCoordList.length-1][LON_INDEX]) {
		return "line";
	} else {
		return "polygon";
	}
}

function addWayToRelationCoordList(relationCoordList, actualWay, role) {
	var actCoordListIndex;

	if(role === "outer") {
		actCoordListIndex = 0;
	} else if (role === "inner") {
		relationCoordList.push([]);
		actCoordListIndex = relationCoordList.length-1;
	}

	for(var nodeNum = 0; nodeNum < actualWay.length; nodeNum++) {
		var nodeID = actualWay[nodeNum];
		relationCoordList[actCoordListIndex].push(nodeCoordList[nodeID]);
	}

	return relationCoordList;
}


exports.parseFileStream = function (stream, callbackFunct) {
	geoObjects = geoObjectCollection();
	stream.pipe(saxStream);
	callback = callbackFunct;
}