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