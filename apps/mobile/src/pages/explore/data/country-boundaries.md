# Bundled country boundaries

Public-domain Natural Earth Admin 0 country polygons at 1:50 million scale.
Bundled with the application for offline MapLibre rendering. Small territories
without a polygon remain selectable through the country list.

Source: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson

License: https://www.naturalearthdata.com/about/terms-of-use/

Transformations: retain supported ISO country codes and polygon geometry, strip
other attributes, merge all polygons with the same ISO code into one MultiPolygon,
and round coordinates to four decimal places.

Original source SHA-256: `3e458fc036ad0a66411f2c1e6cac49c5d7bfb81cb1123bc513b22511a2b7fdeb`
