(function (document) {
	'use strict';

	function PerfectPlaceApp() {
		this.parameterList = new PerfectPlace.ParameterList();
		this.appView = new PerfectPlace.AppView();
		this.appInteraction = new PerfectPlace.AppInteraction(this.parameterList, this.appView);

		this.mapView = new PerfectPlace.MapView();
		this.mapLayerControl = new PerfectPlace.MapLayerControl(this.parameterList, this.mapView);
	}

	var pp = new PerfectPlaceApp(); 

	$(document).ready(function () {
		pp.appInteraction.initAppView();
	});

})(document);
