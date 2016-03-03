$(document).ready(function () {
	'use-strict';

	var categoryDropDownMenuHTML = "";
	var paramNum = 0;
	var paramsList = {};

	TileRenderer();
	setupCategoryDropDownHTML();

	$('#app-container').click(function(event) {
		var clickedEl = $(event.target);

		if (clickedEl.is("#add-parameter-button")) {
			var newParamID = "param-" + _.keys(paramsList).length;

			paramsList[newParamID] = {};
			addParameterSettingsPanel(newParamID);
		}

		else if (clickedEl.hasClass("add-btn")) {
			var paramID = clickedEl.closest('.map-panel').attr('id');

			saveParamData(paramID);

			$('#' + paramID).remove();
			addParameterButton(paramID);
		}

		else if (clickedEl.hasClass("cancle-btn")) {
			var paramID = clickedEl.closest('.map-panel').attr('id');

			$('#' + paramID).remove();

			if (!$.isEmptyObject(paramsList[paramID])) {
				addParameterButton(paramID);
			} else {
				delete paramsList[paramID];
			}
		}

		else if (clickedEl.hasClass('param-btn')) {
			var paramID = clickedEl.attr('id');

			$('#' + paramID).remove();
			addParameterSettingsPanel(paramID);
		}

		else if (clickedEl.hasClass('dropdown-menu-entry')) {
			var selectedDropdownMenuBtn = $(clickedEl.closest('ul').prev());
			var selectedValue = clickedEl.html();

			selectedDropdownMenuBtn.contents().first().replaceWith(selectedValue);
		}

		TileRenderer.updateParameters(paramsList);
	});

	function setupCategoryDropDownHTML() {
		var first = true;
		
		for (var category in Categories) {
			if (first) {
				categoryDropDownMenuHTML += '<li class="dropdown-header">' + category + '</li>';
				first = false;
			} else {
				categoryDropDownMenuHTML += '<li role="separator" class="divider"></li>' + '\n' + '<li class="dropdown-header">' + category + '</li>';
			}
			
			for (var subCategory in Categories[category]) {
				categoryDropDownMenuHTML += '<li><a class="dropdown-menu-entry" href="#">' + subCategory.capitalize() + '</a></li>';
			}
		}
	}

	function addParameterSettingsPanel(paramID) {
		var paramData = paramsList[paramID];
		var parameterSettingsPanel;

		if(!$.isEmptyObject(paramsList[paramID])) {
			parameterSettingsPanel = render('parameter-settings-panel', {
				paramID: paramID,
				selectedCategory: paramData.category,
				categoryDropdownMenu: categoryDropDownMenuHTML,
				distanceInputValue: paramData.distance,
				selectedDistanceUnit: paramData.distanceUnit,
				selectedImportance: paramData.importance,
				selectedDistanceAppedix: paramData.distanceAppendix,
				addButtonName: "save"
			});

		} else {
			parameterSettingsPanel = render('parameter-settings-panel', {
				paramID: paramID,
				selectedCategory: $(categoryDropDownMenuHTML).contents().get(1).innerHTML,
				categoryDropdownMenu: categoryDropDownMenuHTML,
				distanceInputValue: "500",
				selectedDistanceUnit: "m",
				selectedImportance: "Default",
				selectedDistanceAppedix: "Maximal .. away",
				addButtonName: "add"
			});
		}

		addAfterPredecessor(parameterSettingsPanel, paramID);
	}

	function saveParamData(paramID) {
		var categoryDropdown = $('#' + paramID).find('.category-dropdown-btn');
		var distanceInput = $('#' + paramID).find('.distance-input');
		var distanceUnitInput = $('#' + paramID).find('.distance-unit-dropdown-btn');
		var importanceDropdown = $('#' + paramID).find('.importance-dropdown-btn');
		var distanceAppendixDropdown = $('#' + paramID).find('.distance-appendix-dropdown-btn');

		var paramData = {
			category: categoryDropdown.contents().first().text(),
			distance: parseInt(distanceInput.val()),
			distanceUnit: distanceUnitInput.contents().first().text(),
			importance: importanceDropdown.contents().first().text(),
			distanceAppendix: distanceAppendixDropdown.contents().first().text()
		}

		paramsList[paramID] = paramData;
	}

	function addParameterButton(paramID) {
		var paramData = paramsList[paramID];

		parameterButton = render('parameter-button', {
			id: paramID,
			name: paramData.category,
			distance: paramData.distance + " " + paramData.distanceUnit
		});

		addAfterPredecessor(parameterButton, paramID);
	}

	function addAfterPredecessor(el, paramID) {
		var paramIDNum = parseInt(paramID.slice(paramID.length-1))
		var predecessorIDNum = paramIDNum - 1;

		if(predecessorIDNum >= 0) {
			$(el).insertAfter("#param-" + predecessorIDNum);
		} else {
			$(el).insertAfter('#add-parameter-button');
		}
	}


});

// Source: http://stackoverflow.com/a/10136935
function render(tmpl_name, tmpl_data) {
	if(!tmpl_data) {
		tmpl_data = {};
	}

    if (!render.tmpl_cache) { 
        render.tmpl_cache = {};
    }

    if (!render.tmpl_cache[tmpl_name]) {
        var tmpl_dir = '/templates';
        var tmpl_url = tmpl_dir + '/' + tmpl_name + '.html';

        var tmpl_string;
        $.ajax({
            url: tmpl_url,
            method: 'GET',
            async: false,
            success: function(data) {
                tmpl_string = data;
            }
        });

        render.tmpl_cache[tmpl_name] = _.template(tmpl_string);
    }
    return render.tmpl_cache[tmpl_name](tmpl_data);
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}