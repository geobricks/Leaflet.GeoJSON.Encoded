from flask import Flask, Response, request, url_for
from flask.ext.cors import CORS
from flask.ext.cors import cross_origin
import os
import json
from geojson_encoder import _encode_geometry

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
    parent_path = os.path.abspath(os.path.join(os.getcwd(), os.path.pardir))
    geojson_path = os.path.join(parent_path, "geojson_files", filename)
    geojson_encoded_path = os.path.join(parent_path, "geojson_encoded_files", filename)
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

# Start Flask server
if __name__ == '__main__':
    app.run(host=host, port=port, debug=True, threaded=True)