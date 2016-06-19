module.exports = function(category) {

    var fs = require('fs');
    var geojsonvt = require('geojson-vt');
    var config = require('../../../public/js/config.js');

    return {
        name: 'geojson-vt-server',
        init: function(server, callback) {
            // build an initial index of tiles
            var data = JSON.parse(fs.readFileSync("./server/data/geojson/" + category + ".geojson"));
            this.tileIndex = geojsonvt(data, {
                tolerance: 1
                // debug: 0
            });

            callback();
        },
        serve: function(server, req, callback) {
            // request a particular tile
            var tile = this.tileIndex.getTile(req.z, req.x, req.y);
            var status = 404;
            var tileStr = '';
            console.log(tile);
            if(tile) {
                var tileStr = JSON.stringify(tile, null, "\t");
                status = 200;
            }

            console.log(status, req.z, req.x, req.y);

            callback(null, tileStr, req.headers);
        },
        destroy: function(server, callback) {
            callback();
        }
    };
};