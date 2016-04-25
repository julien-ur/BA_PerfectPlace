(function(window) {
	'use strict';

	var PARAM_DATA = 0;
	var PENDING_DATA = 1;
	var NOT_ADDED_FLAG = 2;

	function ParameterList () {
		this.paramList = [];
		
		var firstCategory = Object.keys(PerfectPlace.Categories)[0];
		var firstSubCategory = Object.keys(PerfectPlace.Categories[firstCategory])[0];
		
		this.defaultParamData = {
			category: 'water',
			distance: 500,
			distanceUnit: "m",
			distanceReversed: false,
			importance: "Default"
		}

		this.listeners = {
			paramCreated: [],
			paramAdded: [],
			paramUpdated: [],
			paramDeleted: []
		};
	}

	ParameterList.prototype.on = function(event, listener) {
		var listenerList = this.listeners[event];
		if (listenerList) listenerList.push(listener);
	}

	ParameterList.prototype._notify = function(event, id, args) {
		var listenerList = this.listeners[event];
		for (var i = 0; i < listenerList.length; i++) {
			listenerList[i](id, args);
		}
	}

	ParameterList.prototype.getParamData = function(id) {
		return $.extend({}, this.paramList[id][PARAM_DATA]);
	}

	ParameterList.prototype.createNewDefaultParam = function(paramData) {
		var id = this.getTotalParamCount();
		var defaultParamData = $.extend({}, this.defaultParamData);
		this.paramList.push([defaultParamData, {}, true]);
		this._notify('paramCreated', id);
		return id;
	}

	ParameterList.prototype.getCategory = function(id) {
		return this.paramList[id][PARAM_DATA].category;
	}

	ParameterList.prototype.getDistance = function(id) {
		return this.paramList[id][PARAM_DATA].distance;;
	}

	ParameterList.prototype.getDistanceUnit = function(id) {
		return this.paramList[id][PARAM_DATA].distanceUnit;;
	}

	ParameterList.prototype.getDistanceInMeters = function(id) {
		var distance = this.paramList[id][PARAM_DATA].distance;
		var distanceUnit = this.paramList[id][PARAM_DATA].distanceUnit;
		return (distanceUnit == "m") ? distance : distance * 1000;
	}

	ParameterList.prototype.getImportance = function(id) {
		return this.paramList[id][PARAM_DATA].importance;
	}

	ParameterList.prototype.isDistanceReversed = function(id) {
		return this.paramList[id][PARAM_DATA].distanceReversed;
	}

	ParameterList.prototype.isParamNotAdded = function(id) {
		return this.paramList[id][NOT_ADDED_FLAG];
	}

	ParameterList.prototype.updatePendingChanges = function(id, setting, value) {
		this.paramList[id][PENDING_DATA][setting] = value;
	}

	ParameterList.prototype.hasPendingChanges = function(id) {
		var paramData = this.paramList[id][PARAM_DATA];
		var pendingData = this.paramList[id][PENDING_DATA];

		for (var setting in pendingData) {
			if (paramData[setting] !== pendingData[setting]) return true;
		}
		return false;
	}

	ParameterList.prototype.applyPendingChanges = function(id) {

		var paramData = this.paramList[id][PARAM_DATA];
		var pendingData = this.paramList[id][PENDING_DATA];
		var isNewParam = this.paramList[id][NOT_ADDED_FLAG];
		
		if (this.hasPendingChanges(id)) {

			var changedSettings = [];

			for (var setting in pendingData) {
				paramData[setting] = pendingData[setting];
				changedSettings.push(setting);
			}
			if (!isNewParam) this._notify('paramUpdated', id, changedSettings);
		}

		if (isNewParam) {
			this.paramList[id][NOT_ADDED_FLAG] = false;
			this._notify('paramAdded', id);
		}

		this.paramList[id][PENDING_DATA] = {};
	}

	ParameterList.prototype.deleteParam = function(id) {
		this.paramList.splice(id, 1);
		this._notify('paramDeleted', id);
	}

	ParameterList.prototype.getTotalParamCount = function() {
		return this.paramList.length;
	}

	ParameterList.prototype.getAddedParamCount = function() {
		var addedParamCount = 0;

		for (var id = 0; id < this.paramList.length; id++) {
			if (!this.paramList[id][NOT_ADDED_FLAG]) addedParamCount++;
		}

		return addedParamCount;
	}

	window.PerfectPlace = window.PerfectPlace || {};
	window.PerfectPlace.ParameterList = ParameterList;

})(window);