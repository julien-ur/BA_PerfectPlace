/*
	GlobalMapTiles - part of Aggregate Map Tools
	Version 1.0
	Copyright (c) 2009 The Bivings Group
	All rights reserved.
	Author: John Bafford
	adapted 2015 by Julien Wachter to fit Node's require module

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

	//Converts given lat/lon in WGS84 Datum to XY in Spherical Mercator EPSG:900913
	exports.LatLonToMeters = function (lat, lon)
	{
		var mx = lon * originShift / 180.0;
		var my = Math.log( Math.tan((90 + lat) * Math.PI / 360.0 )) / (Math.PI / 180.0);
		
		my = my * originShift / 180.0;
		
		return [mx, my];
	}

	//Converts XY point from Spherical Mercator EPSG:900913 to lat/lon in WGS84 Datum
	exports.MetersToLatLon = function (mx, my)
	{
		var lon = (mx / originShift) * 180.0;
		var lat = (my / originShift) * 180.0;

		lat = 180 / Math.PI * (2 * Math.atan( Math.exp( lat * Math.PI / 180.0)) - Math.PI / 2);
		
		return [lat, lon];
	}

	//Converts pixel coordinates in given zoom level of pyramid to EPSG:900913
	exports.PixelsToMeters = function (px, py, zoom)
	{
		var res = exports.Resolution(zoom);
		var mx = px * res - originShift;
		var my = py * res - originShift;
		
		return [mx, my];
	}

	//Converts EPSG:900913 to pyramid pixel coordinates in given zoom level
	exports.MetersToPixels = function (mx, my, zoom)
	{
		var res = exports.Resolution(zoom);
		
		var px = (mx + originShift) / res;
		var py = (my + originShift) / res;
		
		return [px, py];
	}

	//Returns a tile covering region in given pixel coordinates
	exports.PixelsToTile = function (px, py)
	{
		var tx = Math.ceil( px / tileSize ) - 1;
		var ty = Math.ceil( py / tileSize ) - 1;
		
		return [tx, ty];
	}

	//Returns tile for given mercator coordinates
	exports.MetersToTile = function (mx, my, zoom)
	{
		var p = exports.MetersToPixels(mx, my, zoom);
		var t = exports.PixelsToTile(p[0], p[1]);

		//convert from TMS to Google
	    t[1] = (1 << zoom) - 1 - t[1];

		return t;
	}

	//Returns bounds of the given tile in EPSG:900913 coordinates
	exports.TileBounds = function (tx, ty, zoom)
	{
		var min = exports.PixelsToMeters( tx*tileSize, ty*tileSize, zoom );
		var max = exports.PixelsToMeters( (tx+1)*tileSize, (ty+1)*tileSize, zoom );
		
		return [min[0], min[1], max[0], max[1]];
	}

	//Returns bounds of the given tile in latutude/longitude using WGS84 datum
	exports.TileLatLonBounds = function (tx, ty, zoom)
	{
		var bounds = exports.TileBounds(tx, ty, zoom);
		
		var min = exports.MetersToLatLon(bounds[0], bounds[1]);
		var max = exports.MetersToLatLon(bounds[2], bounds[3]);
		 
		return [min[0], min[1], max[0], max[1]];
	}

	//Resolution (meters/pixel) for given zoom level (measured at Equator)
	exports.Resolution = function (zoom)
	{
		return initialResolution / (1 << zoom);
	}

	//Returns a list of all of tiles at a given zoom level within a latitude/longude box
	exports.GetTileList = function (zoom, latLon, latLonMax)
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
		
		var rows = tmin[1]+1 - tmax[1];
		var cols = tmax[0]+1 - tmin[0];

		var tileList = new Array(rows);
		for (var row = 0; row < rows; row++) {
	  		tileList[row] = new Array(cols);
		}

		for(var ty = tmax[1]; ty <= tmin[1]; ty++) {
			for(var tx = tmin[0]; tx <= tmax[0]; tx++)
			{
				tileList[ty-tmax[1]][tx-tmin[0]] = [tx, ty];
			}
		}

		return tileList;
	}

	//Converts TMS tile coordinates to Microsoft QuadTree
	exports.QuadTree = function (tx, ty, zoom)
	{
		var quadtree = '';
		
		ty = ((1 << zoom) - 1) - ty;
		for(var i = zoom; i >= 1; i--)
		{
			var digit = 0;
			
			var mask = 1 << (i-1);
			
			if((tx & mask) != 0)
				digit += 1;
			
			if((ty & mask) != 0)
				digit += 2;
			
			quadtree += digit;
		}
		
		return quadtree;
	}

	//Converts a quadtree to tile coordinates
	exports.QuadTreeToTile = function (quadtree, zoom)
	{
		var tx = 0;
		var ty = 0;
		
		for(var i = zoom; i >= 1; i--)
		{
			var ch = quadtree[zoom - i];
			var mask = 1 << (i-1);

			var digit = ch - '0';
			
			if(digit & 1)
				tx += mask;
			
			if(digit & 2)
				ty += mask;
		}
		
		ty = ((1 << zoom) - 1) - ty;
		
		return [tx, ty];
	}

	//Converts a latitude and longitude to quadtree at the specified zoom level 
	exports.LatLonToQuadTree = function (lat, lon, zoom)
	{
		var m = exports.LatLonToMeters(lat, lon);
		var t = exports.MetersToTile(m[0], m[1], zoom);
		
		return exports.QuadTree(t[0], t[1], zoom);
	}

	//Converts a quadtree location into a latitude/longitude bounding rectangle
	exports.QuadTreeToLatLon = function (quadtree)
	{
		var zoom = quadtree.length;
		
		var t = exports.QuadTreeToTile(quadtree, zoom);
		
		return exports.TileLatLonBounds(t[0], t[1], zoom);
	}

	//Returns a list of all of the quadtree locations at a given zoom level within a latitude/longude box
	exports.GetQuadTreeList = function (zoom, latLon, latLonMax)
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
		
		var arr = {};
		for(var ty = tmin[1]; ty <= tmax[1]; ty++)
			for(var tx = tmin[0]; tx <= tmax[0]; tx++)
			{
				console.log(tx, ty, zoom);
				var quadtree = exports.QuadTree(tx, ty, zoom);
				
				arr[quadtree] = exports.TileLatLonBounds(tx, ty, zoom);
			}
		
		return arr;
	}
})((typeof exports === 'undefined') ? this['globalmaptiles']={} : exports);
