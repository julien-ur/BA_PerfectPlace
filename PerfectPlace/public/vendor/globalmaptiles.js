/*
	GlobalMapTiles - part of Aggregate Map Tools
	Version 1.0
	Copyright (c) 2009 The Bivings Group
	All rights reserved.
	Author: John Bafford
	adapted by Julien Wachter (2015) to fit Node's require module

	http://www.bivings.com/
	http://bafford.com/softare/aggregate-map-tools/
	
	Based on GDAL2Tiles / globalmaptiles.py
	Original python version Copyright (c) 2008 Klokan Petr Pridal. All rights reserved.
	http://www.klokan.cz/projects/gdal2tiles/
	
	Permission is hereby granted, free of charge, to any person obtaining a
	copy of this software and associated documentation files (the "Software"),
	to deal in the Software without restriction, including without limitation
	the rights to use, copy, modify, merge, publish, distribute, sublicense,
	and/or sell copies of the Software, and to permit persons to whom the
	Software is furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included
	in all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
	THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
	DEALINGS IN THE SOFTWARE.
*/

(function(exports) {
	
	var tileSize = 256;
	var initialResolution = 2 * Math.PI * 6378137 / tileSize;
	var originShift = 2 * Math.PI * 6378137 / 2.0;

	exports.setTileSize = function (size) {
		tileSize = size;
		initialResolution = 2 * Math.PI * 6378137 / tileSize;
	};

	//Converts given lat/lon in WGS84 Datum to XY in Spherical Mercator EPSG:900913
	exports.LatLonToMeters = function (lat, lon)
	{
		var mx = lon * originShift / 180.0;
		var my = Math.log(Math.tan((90 + lat) * Math.PI / 360.0)) / (Math.PI / 180.0);
		
		my = my * originShift / 180.0;
		
		return [mx, my];
	};

	//Converts XY point from Spherical Mercator EPSG:900913 to lat/lon in WGS84 Datum
	exports.MetersToLatLon = function (mx, my)
	{
		var lon = (mx / originShift) * 180.0;
		var lat = (my / originShift) * 180.0;

		lat = 180 / Math.PI * (2 * Math.atan(Math.exp(lat * Math.PI / 180.0)) - Math.PI / 2);
		
		return [lat, lon];
	};

	//Converts pixel coordinates in given zoom level of pyramid to EPSG:900913
	exports.PixelsToMeters = function (px, py, zoom)
	{
		var res = exports.Resolution(zoom);
		var mx = px * res - originShift;
		var my = py * res - originShift;
		
		return [mx, my];
	};

	//Converts EPSG:900913 to pyramid pixel coordinates in given zoom level
	exports.MetersToPixels = function (mx, my, zoom)
	{
		var res = exports.Resolution(zoom);
		
		var px = (mx + originShift) / res;
		var py = (my + originShift) / res;

		return [px, py];
	};

	//Returns a tile covering region in given pixel coordinates
	exports.PixelsToTile = function (px, py)
	{
		var tx = Math.ceil( px / tileSize ) - 1;
		var ty = Math.ceil( py / tileSize ) - 1;

		return [tx, ty];
	};

	//Returns tile for given mercator coordinates
	exports.MetersToTile = function (mx, my, zoom)
	{
		var p = exports.MetersToPixels(mx, my, zoom);
		var t = exports.PixelsToTile(p[0], p[1]);

		//convert from TMS to Google
	    t[1] = (1 << zoom) - t[1] - 1;

		return t;
	};

	//Returns bounds of the given tile in EPSG:900913 coordinates
	exports.TileBounds = function (tx, ty, zoom)
	{
		var min = exports.PixelsToMeters( tx*tileSize, ty*tileSize, zoom );
		var max = exports.PixelsToMeters( (tx+1)*tileSize, (ty+1)*tileSize, zoom );
		
		return [min[0], min[1], max[0], max[1]];
	};

	//Returns bounds of the given tile in latutude/longitude using WGS84 datum
	exports.TileLatLonBounds = function (tx, ty, zoom)
	{
		var bounds = exports.TileBounds(tx, ty, zoom);
		
		var min = exports.MetersToLatLon(bounds[0], bounds[1]);
		var max = exports.MetersToLatLon(bounds[2], bounds[3]);
		 
		return [min[0], min[1], max[0], max[1]];
	};

	//Resolution (meters/pixel) for given zoom level (measured at Equator)
	exports.Resolution = function (zoom)
	{
		return initialResolution / (1 << zoom);
	};

	//Resolution (meters/pixel) for given zoom level and latitude in WGS84 Datum
	exports.LatToRes = function (zoom, lat)
	{
		return initialResolution * Math.cos(lat * (Math.PI / 180)) / (1 << zoom);
	};

	//Returns a list of all of tiles at a given zoom level within a latitude/longude box
	exports.GetTiles = function (zoom, latLon, latLonMax)
	{
		var lat = latLon[0];
		var lon = latLon[1];

		var latMax, lonMax;
		
		if(latLonMax)
		{
			latMax = latLonMax[0];
			lonMax = latLonMax[1];
			
			if(latMax < lat || lonMax < lon) return undefined;
		}

		var m = exports.LatLonToMeters(lat, lon);
		var tmin = exports.MetersToTile(m[0], m[1], zoom);
		var tmax;
		
		if(latLonMax)
		{
			m = exports.LatLonToMeters(latMax, lonMax);
			tmax = exports.MetersToTile(m[0], m[1], zoom);
		}
		else
			tmax = tmin;
		
		var tiles = {};
		tiles.minX = tmin[0];
		tiles.minY = tmax[1];
		tiles.maxX = tmax[0];
		tiles.maxY = tmin[1];
		tiles.rows = tmin[1] - tmax[1] + 1;
		tiles.cols = tmax[0] - tmin[0] + 1;

		return tiles;
	}

})((typeof exports === 'undefined') ? this['GlobalMapTiles']={} : exports);
