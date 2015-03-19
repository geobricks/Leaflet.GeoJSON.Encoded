(function() {
/*
 * Original code from: polyline-encoded v0.0.7
 * Author: Jan Pieter Waagmeester <jieter@jieter.nl>
 * 
 * http://facstaff.unca.edu/mcmcclur/GoogleMaps/EncodePolyline/
 * (which is down as of december 2014)
 */
var defaultOptions = function (options) {
	if (typeof options === 'number') {
		options = {
			precision: options
		};
	} else {
		options = options || {};
	}

	options.precision = options.precision || 5;
	options.factor = options.factor || Math.pow(10, options.precision);
	options.dimension = options.dimension || 2;
	return options;
};

var Decoder = {
	encode: function (points, options) {
		options = defaultOptions(options);

		var flatPoints = [];
		for (var i = 0, len = points.length; i < len; ++i) {
			var point = points[i];

			if (options.dimension === 2) {
				flatPoints.push(point.lat || point[0]);
				flatPoints.push(point.lng || point[1]);
			} else {
				for (var dim = 0; dim < options.dimension; ++dim) {
					flatPoints.push(point[dim]);
				}
			}
		}

		return this.encodeDeltas(flatPoints, options);
	},

	decode: function (encoded, options) {
		options = defaultOptions(options);

		var flatPoints = this.decodeDeltas(encoded, options);

		var points = [];
		for (var i = 0, len = flatPoints.length; i + (options.dimension - 1) < len;) {
			var point = [];

			for (var dim = 0; dim < options.dimension; ++dim) {
				point.push(flatPoints[i++]);
			}

			points.push(point);
		}

		return points;
	},

	encodeDeltas: function(numbers, options) {
		options = defaultOptions(options);

		var lastNumbers = [];

		for (var i = 0, len = numbers.length; i < len;) {
			for (var d = 0; d < options.dimension; ++d, ++i) {
				var num = numbers[i];
				var delta = num - (lastNumbers[d] || 0);
				lastNumbers[d] = num;

				numbers[i] = delta;
			}
		}

		return this.encodeFloats(numbers, options);
	},

	decodeDeltas: function(encoded, options) {
		options = defaultOptions(options);

		var lastNumbers = [];

		var numbers = this.decodeFloats(encoded, options);
		for (var i = 0, len = numbers.length; i < len;) {
			for (var d = 0; d < options.dimension; ++d, ++i) {
				numbers[i] = Math.round((lastNumbers[d] = numbers[i] + (lastNumbers[d] || 0)) * options.factor) / options.factor;
			}
		}

		return numbers;
	},

	encodeFloats: function(numbers, options) {
		options = defaultOptions(options);

		for (var i = 0, len = numbers.length; i < len; ++i) {
			numbers[i] = Math.round(numbers[i] * options.factor);
		}

		return this.encodeSignedIntegers(numbers);
	},

	decodeFloats: function(encoded, options) {
		options = defaultOptions(options);

		var numbers = this.decodeSignedIntegers(encoded);
		for (var i = 0, len = numbers.length; i < len; ++i) {
			numbers[i] /= options.factor;
		}

		return numbers;
	},

	/* jshint bitwise:false */

	encodeSignedIntegers: function(numbers) {
		for (var i = 0, len = numbers.length; i < len; ++i) {
			var num = numbers[i];
			numbers[i] = (num < 0) ? ~(num << 1) : (num << 1);
		}

		return this.encodeUnsignedIntegers(numbers);
	},

	decodeSignedIntegers: function(encoded) {
		var numbers = this.decodeUnsignedIntegers(encoded);

		for (var i = 0, len = numbers.length; i < len; ++i) {
			var num = numbers[i];
			numbers[i] = (num & 1) ? ~(num >> 1) : (num >> 1);
		}

		return numbers;
	},

	encodeUnsignedIntegers: function(numbers) {
		var encoded = '';
		for (var i = 0, len = numbers.length; i < len; ++i) {
			encoded += this.encodeUnsignedInteger(numbers[i]);
		}
		return encoded;
	},

	decodeUnsignedIntegers: function(encoded) {
		var numbers = [];

		var current = 0;
		var shift = 0;

		for (var i = 0, len = encoded.length; i < len; ++i) {
			var b = encoded.charCodeAt(i) - 63;

			current |= (b & 0x1f) << shift;

			if (b < 0x20) {
				numbers.push(current);
				current = 0;
				shift = 0;
			} else {
				shift += 5;
			}
		}

		return numbers;
	},

	encodeSignedInteger: function (num) {
		num = (num < 0) ? ~(num << 1) : (num << 1);
		return this.encodeUnsignedInteger(num);
	},

	// This function is very similar to Google's, but I added
	// some stuff to deal with the double slash issue.
	encodeUnsignedInteger: function (num) {
		var value, encoded = '';
		while (num >= 0x20) {
			value = (0x20 | (num & 0x1f)) + 63;
			encoded += (String.fromCharCode(value));
			num >>= 5;
		}
		value = num + 63;
		encoded += (String.fromCharCode(value));

		return encoded;
	}

	/* jshint bitwise:true */
};
	
L.GeoJSON.Encoded = L.GeoJSON.extend({

/*	initialize: function(geojson, options) {

		L.GeoJSON.prototype.initialize.call(this, geojson, options);
	},*/

	_decodeFeature: function(feature) {

		var geom,coords,resp;

		function _build_linestrings(geom) {
		    var paths = [];
		    for (var j = 0; j < geom.length; j++)
		        paths.push( Decoder.decode(geom[j]) );
		    return paths;
		}

		function _build_polygons(geom) {
		    var polygons = [];
		    for (var i = 0; i < geom.length; i++)
		        polygons.push( _build_linestrings(geom[i]) );
		    return polygons;
		}

        geom = feature.geometry.coordinates;

        switch(feature.geometry.type) {
            case 'Point':
                
                resp = L.marker([geom[1], geom[0]]);

                break;
            case 'LineString':
                coords = L.Util.isArray(geom[0]) ? L.GeoJSON.coordsToLatLngs(geom, 0) : _build_linestrings(geom[0])[0];
                
                resp = L.polyline(coords);

                break;
            case 'MultiLineString':
                coords = L.Util.isArray(geom[0][0]) ? L.GeoJSON.coordsToLatLngs(geom, 1) : _build_linestrings(geom);
                
                resp = L.multiPolyline(coords);

                break;
            case 'Polygon':
                coords = L.Util.isArray(geom[0][0]) ? L.GeoJSON.coordsToLatLngs(geom, 1) : _build_linestrings(geom);
                
                resp = L.polygon(coords);

                break;
            case 'MultiPolygon':
                coords = L.Util.isArray(geom[0][0]) ? L.GeoJSON.coordsToLatLngs(geom, 2) : _build_polygons(geom);

                resp = L.multiPolygon(coords);

                break;
        }

        return resp.toGeoJSON();
	},

	addData: function (geojsonEnc) {

		var features = L.Util.isArray(geojsonEnc) ? geojsonEnc : geojsonEnc.features,
		    i, len, feature;

		if (features) {
			for (i = 0, len = features.length; i < len; i++) {

				feature = this._decodeFeature(features[i]);

				if (feature.geometries || feature.geometry || feature.features || feature.coordinates) {
					this.addData(feature);
				}
			}
			return this;
		}

		var options = this.options;

		if (options.filter && !options.filter(geojsonEnc)) { return this; }

		var layer = L.GeoJSON.geometryToLayer(geojsonEnc, options);
		layer.feature = L.GeoJSON.asFeature(geojsonEnc);

		layer.defaultOptions = layer.options;
		this.resetStyle(layer);

		if (options.onEachFeature) {
			options.onEachFeature(geojsonEnc, layer);
		}

		return this.addLayer(layer);
	}
});

L.geoJson.encoded = function (geojson, options) {
    return new L.GeoJSON.Encoded(geojson, options);
};

}).call(this);