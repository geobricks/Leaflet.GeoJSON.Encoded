# Leaflet.GeoJSON.Encoded

This Leaflet plugin extends the L.GeoJSON layer using Google polyline encoding algorithm, allowing an optimized data transfer.
The algorithm is documented in [Google Maps API Docs](https://developers.google.com/maps/documentation/utilities/polylinealgorithm).

##Demo
- [example italy](http://labs.easyblog.it/maps/leaflet-geojson-encoded/examples/italy.html)
- [example roads](http://labs.easyblog.it/maps/leaflet-geojson-encoded/examples/roads.html)

#Encoder (server)

### Requirements
- [pip](https://pip.pypa.io/en/latest/installing.html)
- [flask](http://flask.pocoo.org/)
- [flask-cors](http://flask-cors.readthedocs.org/en/latest/)
- [watchdog](https://pypi.python.org/pypi/watchdog)

### Setup

To install pip package

```
$ cd encoder
$ sudo pip install -r requirements.txt
$ python ./encoder/geojson_encoder_rest.py
```

To encode a GeoJSON (contained in geojson_files)

http://localhost:8000/encode/italy_simplify.json

The service returns an encoded GeoJSON
