# Leaflet.GeoJSON.Encoded

This Leaflet plugin extends the L.GeoJSON layer using Google polyline encoding algorithm, allowing an optimized data transfer.
The algorithm is documented in [Google Maps API Docs](https://developers.google.com/maps/documentation/utilities/polylinealgorithm).

##Demo
- [example italy](examples/italy.html)
- [example roads](examples/roads.html)

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

#Decoder (client)
### Requirements
- [Polyline encoded](https://github.com/jieter/Leaflet.encoded)

