(function(window) {
	'use strict';

	function MapLayerControl (paramsList, mapView) {
		this.paramsList = paramsList;
		this.mapView = mapView;
		this.layerList = [];

		this._attachListener();
	}

	MapLayerControl.prototype.addLayer = function (paramId, category, distanceInMeters, distanceReversed) {
		var tileCache = new PerfectPlace.CanvasTileCache();
		var tileSize = PerfectPlaceConfig.PARAM_LAYER_TILE_SIZE;
		var renderer = new PerfectPlace.CanvasTileRenderer(category, distanceInMeters, distanceReversed, tileSize, tileCache);

		var opacity = 0.5 / this.paramsList.getAddedParamCount();
		this.mapView.updateLayerOpacity(opacity);

		var layerId = this.mapView.addLayer(opacity, function(canvas, tilePoint, zoom, mapBounds, mapCenter) {
			renderer.drawTile(canvas, tilePoint, zoom, mapBounds, mapCenter);
		});

		this.layerList[paramId] = {
			layerId: layerId,
			renderer: renderer
		}
	};

	MapLayerControl.prototype.updateLayer = function(paramId, category, distanceInMeters, distanceReversed) {
		this.layerList[paramId].renderer.updateSettings(category, distanceInMeters, distanceReversed);
		this.mapView.redrawLayer(this.layerList[paramId].layerId);
	};

	MapLayerControl.prototype.removeLayer = function(paramId) {
		var l = this.layerList[paramId];
		if(!$.isEmptyObject(l)) {
			var opacity = 0.5 / this.paramsList.getAddedParamCount();
			this.mapView.removeLayer(l.layerId);
			this.mapView.updateLayerOpacity(opacity);
		}
		this.layerList.splice(paramId, 1);
	};

	MapLayerControl.prototype._attachListener = function() {
		var that = this;

		this.paramsList.on('paramCreated', function(paramId) {
			that.layerList.push({});
		});

		this.paramsList.on('paramAdded', function(paramId) {
			var category = that.paramsList.getCategory(paramId);
			var distanceInMeters = that.paramsList.getDistanceInMeters(paramId);
			var distanceReversed = that.paramsList.isDistanceReversed(paramId);

			that.addLayer(paramId, category, distanceInMeters, distanceReversed);
		});

		this.paramsList.on('paramUpdated', function(paramId) {
			var category = that.paramsList.getCategory(paramId);
			var distanceInMeters = that.paramsList.getDistanceInMeters(paramId);
			var distanceReversed = that.paramsList.isDistanceReversed(paramId);
			
			that.updateLayer(paramId, category, distanceInMeters, distanceReversed);
		});

		this.paramsList.on('paramDeleted', function(paramId) {
			that.removeLayer(paramId);
		});
	};

	window.PerfectPlace = window.PerfectPlace || {};
	window.PerfectPlace.MapLayerControl = MapLayerControl;

})(window);