from flask import Flask, Response, request, url_for
from flask.ext.cors import CORS
from flask.ext.cors import cross_origin
import os
import json
# from geojson_encoder import _encode_geometry

# Initialize the Flask app
app = Flask(__name__)

# Initialize CORS filters
cors = CORS(app, resources={r'/*': {'origins': '*'}})

host='localhost'
port = 5678

@app.route('/', methods=['GET'])
@cross_origin(origins='*')
def welcome():
    html = '<div> <b>Usage:</b> ' + request.base_url + 'encode/[filename.json]</div>'
    html += '<div> <b>Example of request:</b> <a href="' + request.base_url + 'encode/geojson_test.json"> Encode geojson_test.json</a></div>'
    html += '</div>'
    return html


@app.route('/encode/<filename>', methods=['GET'])
@cross_origin(origins='*')
def rest_encoding(filename):
    geojson_encoded = encode_file(filename)
    return Response(json.dumps(geojson_encoded), content_type='application/json; charset=utf-8')


def encode_file(filename):
    geojson_path = os.path.join(os.getcwd(), "geojson_files", filename)
    print geojson_path
    geojson_encoded = process_file(geojson_path)
    return geojson_encoded


def process_file(file_path):
    with open(file_path) as f:
        geojson = json.load(f)
        geojson_encoded = encode_geojson(geojson)
        print geojson_encoded
        return geojson_encoded


def save_file(file_path, value):
    return None


def encode_geojson(geojson):
    for f in geojson["features"]:
        f["geometry"]["coordinates"] = _encode_geometry(f["geometry"])
    return geojson



# Google Polyline encoder & decoder https://gist.github.com/signed0/2031157
'''Provides utility functions for encoding and decoding linestrings using the
Google encoded polyline algorithm.
'''
def _encode_coords(coords):
    '''Encodes a polyline using Google's polyline algorithm

    See http://code.google.com/apis/maps/documentation/polylinealgorithm.html
    for more information.

    :param coords: Coordinates to transform (list of tuples in order: latitude,
    longitude).
    :type coords: list
    :returns: Google-encoded polyline string.
    :rtype: string
    '''

    result = []

    prev_lat = 0
    prev_lng = 0

    for coord in coords:
        lat, lng = int(coord[1] * 1e5), int(coord[0] * 1e5)

        d_lat = _encode_value(lat - prev_lat)
        d_lng = _encode_value(lng - prev_lng)

        prev_lat, prev_lng = lat, lng

        result.append(d_lat)
        result.append(d_lng)

    return ''.join(c for r in result for c in r)


def _split_into_chunks(value):
    while value >= 32:  # 2^5, while there are at least 5 bits

        # first & with 2^5-1, zeros out all the bits other than the first five
        # then OR with 0x20 if another bit chunk follows
        yield (value & 31) | 0x20
        value >>= 5
    yield value


def _encode_value(value):
    # Step 2 & 4
    value = ~(value << 1) if value < 0 else (value << 1)

    # Step 5 - 8
    chunks = _split_into_chunks(value)

    # Step 9-10
    return (chr(chunk + 63) for chunk in chunks)


def _encode_geometry(geom):
    geom_type = geom["type"]
    encoded_geom = None
    if geom_type == "Point":
        return geom["coordinates"]
    elif geom_type == "LineString":
        return _encode_coords(geom["coordinates"])
    elif geom_type == "Polygon":
        return [_encode_coords(ring) for ring in geom["coordinates"]]
    elif geom_type == "MultiLinePoint":
        return _encode_coords(geom["coordinates"])
    elif geom_type == "MultiLineString":
        return [_encode_coords(ls) for ls in geom["coordinates"]]
    elif geom_type == "MultiPolygon":
        out = []
        for pg in geom["coordinates"]:
            out.append([_encode_coords(ring) for ring in pg])
        return out
    else:
        raise Exception('%s is not a supported geometry type.' % geom_type)


# Start Flask server
if __name__ == '__main__':
    app.run(host=host, port=port, debug=True, threaded=True)