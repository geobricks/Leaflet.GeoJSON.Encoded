(function() {

L.GeoJSON.Encoded = L.GeoJSON.extend({

	_decodeFeature: function(feature) {

		var geom,coords,resp;

		function _build_linestrings(geom) {
		    var paths = [];
		    for (var j = 0; j < geom.length; j++)
		        paths.push( L.PolylineUtil.decode(geom[j]) );
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
                coords = L.Util.isArray(geom[0]) ? L.GeoJSON.coordsToLatLngs(geom, 0) : L.PolylineUtil.decode(geom);
                
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
				// only add this if geometry or geometries are set and not null

				feature = this._decodeFeature(features[i]);
				//feature = features[i];

				console.log(features[i], feature);

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
		//return L.GeoJSON.prototype.addData.call(this, geojsonEnc);
	}
// */
/*	DEFAULT GeoJSON METHOD
	addData: function (geojson) {
		var features = L.Util.isArray(geojson) ? geojson : geojson.features,
		    i, len, feature;

		if (features) {
			for (i = 0, len = features.length; i < len; i++) {
				// only add this if geometry or geometries are set and not null
				feature = features[i];
				if (feature.geometries || feature.geometry || feature.features || feature.coordinates) {
					this.addData(feature);
				}
			}
			return this;
		}

		var options = this.options;

		if (options.filter && !options.filter(geojson)) { return this; }

		var layer = L.GeoJSON.geometryToLayer(geojson, options);
		layer.feature = L.GeoJSON.asFeature(geojson);

		layer.defaultOptions = layer.options;
		this.resetStyle(layer);

		if (options.onEachFeature) {
			options.onEachFeature(geojson, layer);
		}

		return this.addLayer(layer);
	}*/
});
/*

L.extend(L.GeoJSON.Encoded, {
	geometryToLayer: function (geojson, options) {

		var geometry = geojson.type === 'Feature' ? geojson.geometry : geojson,
		    coords = geometry.coordinates,
		    layers = [],
		    pointToLayer = options && options.pointToLayer,
		    coordsToLatLng = options && options.coordsToLatLng || this.coordsToLatLng,
		    latlng, latlngs, i, len;

		switch (geometry.type) {
		case 'Point':
			latlng = coordsToLatLng(coords);
			return pointToLayer ? pointToLayer(geojson, latlng) : new L.Marker(latlng);

		case 'MultiPoint':
			for (i = 0, len = coords.length; i < len; i++) {
				latlng = coordsToLatLng(coords[i]);
				layers.push(pointToLayer ? pointToLayer(geojson, latlng) : new L.Marker(latlng));
			}
			return new L.FeatureGroup(layers);

		case 'LineString':
		case 'MultiLineString':
			latlngs = this.coordsToLatLngs(coords, geometry.type === 'LineString' ? 0 : 1, coordsToLatLng);
			return new L.Polyline(latlngs, options);

		case 'Polygon':
		case 'MultiPolygon':
			latlngs = this.coordsToLatLngs(coords, geometry.type === 'Polygon' ? 1 : 2, coordsToLatLng);
			return new L.Polygon(latlngs, options);

		case 'GeometryCollection':
			for (i = 0, len = geometry.geometries.length; i < len; i++) {

				layers.push(this.geometryToLayer({
					geometry: geometry.geometries[i],
					type: 'Feature',
					properties: geojson.properties
				}, options));
			}
			return new L.FeatureGroup(layers);

		default:
			throw new Error('Invalid GeoJSON object.');
		}
	}
});*/

L.geoJson.encoded = function (geojson, options) {
    return new L.GeoJSON.Encoded(geojson, options);
};

}).call(this);