# Leaflet.GeoJSON.Encoded
Leaflet GeoJSON Encoded




## Python Service

### Installation (Dependendencies)

It's required to run the service [flask](http://flask.pocoo.org/) and [flask-cors](http://flask-cors.readthedocs.org/en/latest/). To install install run

sudo pip install -r requirements.txt

### Run the service

python geojson_encoder_rest.py

### Usage (Encoding)

To encode a GeoJSON (contained in geojson_files)

http://localhost:5678/encode/<filename> (i.e. for example http://localhost:5678/encode/geojson_test.json)

The service returns an encoded GeoJSON