(function (window) {
	'use strict';

	function AppView() {}

	AppView.prototype.bind = function(event, handler) {
		if (event === 'createNewParameter') {
			$("#add-parameter-button").click(handler);
		}
	}

	AppView.prototype.decrementParameterIndices = function(startId, paramCount) {
		for (var id = startId; id < paramCount; id++) {

			var $paramEl = $('#param-' + id);
			$paramEl.attr('id', 'param-' + (id - 1));
			$paramEl.trigger('id-changed', id - 1);
		}
	}

	AppView.prototype.getParamPredecessorEl = function(id) {
	    var predecessorId = id - 1;

	    if(predecessorId > -1) {
	        return $("#param-" + predecessorId).get(0);
	    } else {
	        return $('#add-parameter-button').get(0);
	    }
	}

	window.PerfectPlace = window.PerfectPlace || {};
	window.PerfectPlace.AppView = AppView;

})(window);