(function (window) {
	'use strict';

	function AppInteraction (paramsList, appView) {
		this.paramsList = paramsList;
		this.appView = appView;
	}

	AppInteraction.prototype.initAppView = function() {
		var that = this;

		this.appView.bind('createNewParameter', function() {
			var id = that.paramsList.createNewDefaultParam();
			that.createParameterSettingsPanel(id);
		});

		$('#blur-filter-toggle-btn').click(function(e) {
            if (e.target !== this)
                return; // prevents firing two click events, when clicking directly on checkbox child

            $('#blur-filter-checkbox').trigger('click');
		})
	};

	AppInteraction.prototype.createParameterSettingsPanel = function(id) {
		var that = this;
		var paramData = this.paramsList.getParamData(id);
		var paramNotAdded = this.paramsList.isParamNotAdded(id);
		var paramSettingsPanelView = new PerfectPlace.ParameterSettingsPanelView(id, paramData, paramNotAdded);
		paramSettingsPanelView.renderAfter(this.appView.getParamPredecessorEl(id));

		paramSettingsPanelView.bind('add', function(id) {
			that.paramsList.applyPendingChanges(id);
			paramSettingsPanelView.remove();
			that.createParameterButton(id);
		});

		paramSettingsPanelView.bind('remove', function(id) {
			paramSettingsPanelView.remove();
			that.appView.decrementParameterIndices(id + 1, that.paramsList.getTotalParamCount());
			that.paramsList.deleteParam(id);
		});

		paramSettingsPanelView.bind('settingsChanged', function(id, setting, value) {
			that.paramsList.updatePendingChanges(id, setting, value);

			if (!paramNotAdded) {
				var hasPendingChanges = that.paramsList.hasPendingChanges(id);
				paramSettingsPanelView.updateAddButtonName(hasPendingChanges);
			}
		});
	}

	AppInteraction.prototype.createParameterButton = function(id) {
		var that = this;
		var paramData = this.paramsList.getParamData(id);
		var paramBtnView = new PerfectPlace.ParameterButtonView(id, paramData.category, paramData.distance, paramData.distanceUnit);
		paramBtnView.renderAfter(this.appView.getParamPredecessorEl(id));

		paramBtnView.bind('changeSettings', function(id) {
			paramBtnView.remove();
			that.createParameterSettingsPanel(id, paramData, false);
		});
	}

	window.PerfectPlace = window.PerfectPlace || {};
	window.PerfectPlace.AppInteraction = AppInteraction;

})(window);