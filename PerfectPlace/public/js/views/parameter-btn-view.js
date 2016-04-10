(function (window) {
	'use strict';

	ParameterButtonView.prototype = new PerfectPlace.ParameterView();
	ParameterButtonView.prototype.constructor = ParameterButtonView;

	function ParameterButtonView (id, category, distance, distanceUnit) {
		this.id = id;

		this.html = PerfectPlace.Utils.renderHTMLTemplate('parameter-button', {
			paramId: 'param-' + this.id,
			name: category.capitalize(),
			distance: distance + ' ' + distanceUnit
		});
	}

	ParameterButtonView.prototype.bind = function(event, handler) {
		var that = this;

		if (event === "changeSettings") {

			this.$el.click(function() {
				handler(that.id);
			});
		}
	}

	window.PerfectPlace = window.PerfectPlace || {};
	window.PerfectPlace.ParameterButtonView = ParameterButtonView;

})(window);