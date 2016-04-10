(function (window) {
	'use strict';

	ParameterSettingsPanelView.prototype = new PerfectPlace.ParameterView();
	ParameterSettingsPanelView.prototype.constructor = ParameterSettingsPanelView;

	function ParameterSettingsPanelView (id, paramData, paramNotAdded) {
		this.id = id;
		paramData.category  = paramData.category.capitalize();
		paramData.distanceReversed = paramData.distanceReversed ? "At least .. away" : "Maximal .. away";
		var addBtnName = paramNotAdded ? "add" : "cancle";
		var removeBtnName = paramNotAdded ? "cancle" : "remove";
		var catDropdownMenuHTML = this._createCategoryDropdownMenuHTML();
		
		this.html = this._createHTMLTemplate(paramData, catDropdownMenuHTML, addBtnName, removeBtnName);
	}

	ParameterSettingsPanelView.prototype.bind = function(event, handler) {
		var that = this;

		if (event === "add") {

			var $addButton = $('#param-' + this.id).find('.add-btn');
			$addButton.click(function() {
				handler(that.id);
			});

		} else if (event === "remove") {

			var $cancleButton = $('#param-' + this.id).find('.remove-btn');
			$cancleButton.click(function() {
				handler(that.id);
			});

		} else if (event === "settingsChanged") {

			this.$el.find('.dropdown-menu-entry').click(function(event) {
				that._handleSettingsChanged(event, handler, 'dropdown');
			});

			this.$el.find('.distance-input').change(function(event){
				that._handleSettingsChanged(event, handler, 'input');
			});
		}
	}

	ParameterSettingsPanelView.prototype._createHTMLTemplate = function(paramData, catDropdownMenuHTML, addBtnName, removeBtnName) {
		var htmlTemplate = PerfectPlace.Utils.renderHTMLTemplate('parameter-settings-panel', {
			paramId: "param-" + this.id,
			selectedCategory: paramData.category,
			categoryDropdownMenu: catDropdownMenuHTML,
			distanceInputValue: paramData.distance,
			selectedDistanceUnit: paramData.distanceUnit,
			selectedImportance: paramData.importance,
			selectedDistanceAppedix: paramData.distanceReversed,
			addButtonName: addBtnName,
			removeButtonName: removeBtnName
		});

		return htmlTemplate;
	}

	ParameterSettingsPanelView.prototype._createCategoryDropdownMenuHTML = function() {
		var dropdownMenu = "";
		var first = true;

		for (var category in PerfectPlace.Categories) {
			if (first) {
				dropdownMenu += '<li class="dropdown-header">' + category + '</li>';
				first = false;
			} else {
				dropdownMenu += '<li role="separator" class="divthis.ider"></li>' + '\n' + '<li class="dropdown-header">' + category + '</li>';
			}
			
			for (var subCategory in PerfectPlace.Categories[category]) {
				dropdownMenu += '<li><a class="dropdown-menu-entry" href="#">' + subCategory.capitalize() + '</a></li>';
			}
		}
		return dropdownMenu;
	}

	ParameterSettingsPanelView.prototype._handleSettingsChanged = function(event, handler, elType) {
		var $clickedEl = $(event.target);
		var changedValue = (elType === 'dropdown') ? $clickedEl.html() : $clickedEl.val();

		var $settingsMainEl;

		if (elType === 'dropdown') {
			$settingsMainEl = $clickedEl.closest('ul').prev();
			$settingsMainEl.contents().first().replaceWith(changedValue);
		}
		else if (elType === 'input') {
			$settingsMainEl = $clickedEl;
		}

		var settingData = this._getSettingData($settingsMainEl, changedValue);
		handler(this.id, settingData[0], settingData[1]);
	}

	ParameterSettingsPanelView.prototype._getSettingData = function($settingsMainEl, selectedValue) {
		var setting;

		if ($settingsMainEl.hasClass('category-dropdown-btn')) {
			setting = 'category';
			selectedValue = selectedValue.toLowerCase();
		} 
		else if ($settingsMainEl.hasClass('distance-input')) {
			setting = 'distance';
		} 
		else if ($settingsMainEl.hasClass('distance-unit-dropdown-btn')) {
			setting = 'distanceUnit';
		} 
		else if ($settingsMainEl.hasClass('importance-dropdown-btn')) {
			setting = 'importance';
		} 
		else if ($settingsMainEl.hasClass('distance-appendix-dropdown-btn')) {
			setting = 'distanceReversed';
			selectedValue = (selectedValue === 'At least .. away') ? true : false;
		}

		return [setting, selectedValue];
	}

	ParameterSettingsPanelView.prototype.updateAddButtonName = function(settingsChanged) {
		var addBtn = this.$el.find('.add-btn');
		var addBtnName = settingsChanged ? "save" : "cancle";
		addBtn.html(addBtnName);
	}

	window.PerfectPlace = window.PerfectPlace || {};
	window.PerfectPlace.ParameterSettingsPanelView = ParameterSettingsPanelView;

})(window);