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
                tolerance: 3,
                extent: config.SERVER_TILE_SIZE,
                maxZoom: 18
                // buffer: 0
                // debug: 0
            });

            callback();
        },
        serve: function(server, req, callback) {
            // request a particular tile
            var tile = this.tileIndex.getTile(req.z, req.x, req.y);
            var err = 'tile ' + req.z + ', ' +  req.x + ', ' +  req.y + ' not found';
            var tileStr = '';

            if(tile) {
                var tileStr = JSON.stringify(tile, null, "\t");
                err = null;
            }

            console.log(err);
            callback(err, tileStr, req.headers);
        },
        destroy: function(server, callback) {
            callback();
        }
    };
};