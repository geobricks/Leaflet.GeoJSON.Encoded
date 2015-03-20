(function() {
/*
 * Original code from: polyline-encoded v0.0.7
 * Author: Jan Pieter Waagmeester <jieter@jieter.nl>
 * 
 * http://facstaff.unca.edu/mcmcclur/GoogleMaps/EncodePolyline/
 * (which is down as of december 2014)
 */

L.GeoJSON.Encoded.include({

	encode: function (points, options) {
		options = this.defaultOptions(options);

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

	encodeDeltas: function(numbers, options) {
		options = this.defaultOptions(options);

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

	encodeFloats: function(numbers, options) {
		options = this.defaultOptions(options);

		for (var i = 0, len = numbers.length; i < len; ++i) {
			numbers[i] = Math.round(numbers[i] * options.factor);
		}

		return this.encodeSignedIntegers(numbers);
	},

	encodeSignedIntegers: function(numbers) {
		for (var i = 0, len = numbers.length; i < len; ++i) {
			var num = numbers[i];
			numbers[i] = (num < 0) ? ~(num << 1) : (num << 1);
		}

		return this.encodeUnsignedIntegers(numbers);
	},

	encodeUnsignedIntegers: function(numbers) {
		var encoded = '';
		for (var i = 0, len = numbers.length; i < len; ++i) {
			encoded += this.encodeUnsignedInteger(numbers[i]);
		}
		return encoded;
	},

	encodeSignedInteger: function (num) {
		num = (num < 0) ? ~(num << 1) : (num << 1);
		return this.encodeUnsignedInteger(num);
	},
	
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
});

}).call(this);
