(function (window) {
	'use strict';

	function ParameterView () {}

	ParameterView.prototype.renderAfter = function(el) {
		var that = this;

		$(el).after(this.html);

		this.$el = $('#param-' + this.id);

		this.$el.on('id-changed', function(event, arg1) {
			that._updateId(arg1);
		});
	};

	ParameterView.prototype.remove = function() {
		this.$el.remove();
	};

	ParameterView.prototype._updateId = function(newId) {
		this.id = newId;
		this.$el = $('#param-' + this.id);
	};

	window.PerfectPlace = window.PerfectPlace || {};
	window.PerfectPlace.ParameterView = ParameterView;

})(window);