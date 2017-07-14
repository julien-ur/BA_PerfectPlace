(function(window) {
    'use strict';

    var Utils = {

        // Source: http://stackoverflow.com/a/10136935
        renderHTMLTemplate: function (tmpl_name, tmpl_data) {
            if(!tmpl_data) {
                tmpl_data = {};
            }

            if (!this.tmpl_cache) { 
                this.tmpl_cache = {};
            }

            if (!this.tmpl_cache[tmpl_name]) {
                var tmpl_string;

                $.ajax({
                    url: './templates/' + tmpl_name + '.html',
                    method: 'GET',
                    async: false,
                    success: function(data) {
                        tmpl_string = data;
                    }
                });

                this.tmpl_cache[tmpl_name] = _.template(tmpl_string);
            }
            return this.tmpl_cache[tmpl_name](tmpl_data);
        }
    };

    String.prototype.capitalize = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    window.PerfectPlace = window.PerfectPlace || {};
    window.PerfectPlace.Utils = Utils;

})(window);
