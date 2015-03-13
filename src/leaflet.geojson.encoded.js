(function() {

function _build_linestrings(geom) {

    var paths = [];
    for (var j = 0; j < geom.length; j++) {
        paths.push(L.PolylineUtil.decode(geom[j]));
    }
    return paths;
}

function _build_polygons(geom) {
    var polygons = [];
    for (var i = 0; i < geom.length; i++) {
        polygons.push(_build_linestrings(geom[i]));
    }
    return polygons;
}

function decodeToLayer(featureCollection, targetLayer, style, onEachFeature) {
    var geom,bb,
    	features = featureCollection["features"],
    	popupOpts = {closeButton: false};

    for (var i = 0; i < features.length; i++) {
        var feature = features[i];

        geom = feature["geometry"]["coordinates"];

        switch(feature["geometry"]["type"]) {
            case "Point":
                L.marker([geom[1], geom[0]]).addTo(targetLayer);
                break;
            case "LineString":
                var coords = L.Util.isArray(geom[0]) ? L.GeoJSON.coordsToLatLngs(geom, 0) : L.PolylineUtil.decode(geom);
                
                var poly = L.polyline(coords, style).addTo(targetLayer);
                onEachFeature(feature, poly);

                break;
            case "MultiLineString":
                var ls = L.Util.isArray(geom[0][0]) ? L.GeoJSON.coordsToLatLngs(geom, 1) : _build_linestrings(geom);
                
                var poly = L.multiPolyline(ls, style).addTo(targetLayer);
                onEachFeature(feature, poly);

                break;
            case "Polygon":
                var rings = L.Util.isArray(geom[0][0]) ? L.GeoJSON.coordsToLatLngs(geom, 1) : _build_linestrings(geom);
                
                var poly = L.polygon(rings, style).addTo(targetLayer);
                onEachFeature(feature, poly);

                break;
            case "MultiPolygon":
                var polygons = L.Util.isArray(geom[0][0]) ? L.GeoJSON.coordsToLatLngs(geom, 2) : _build_polygons(geom);

                var poly = L.multiPolygon(polygons, style).addTo(targetLayer);
                onEachFeature(feature, poly);

                break;
            default:
                console.error(feature.geometry.type + ' not implemented.');
        }
    }
    return targetLayer;
}

L.GeoJSON.Encoded = L.GeoJSON.extend({

/*	addData: function (geojson) {
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

L.geoJson.encoded = function (options) {
    return new L.GeoJSON.Encoded(options);
};

}).call(this);