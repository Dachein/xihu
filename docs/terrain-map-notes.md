# West Lake Terrain Map Notes

## Map Category

The requested visual style is not a flat road map. It is closer to a terrain-first geographic scene:

1. 3D satellite terrain map
   - DEM elevation controls real surface relief.
   - Satellite or aerial imagery is draped over that surface.
   - The camera uses oblique pitch and bearing to show mountain ridges and lake basins.
   - Routes and cultural points are overlaid as annotation layers.

2. Shaded-relief topographic map
   - DEM is rendered into hillshade.
   - Elevation is tinted with hypsometric colors.
   - Water, ridgelines, streams, paths, and labels are drawn as cartographic layers.

For West Lake, the product should support both:

- `terrain scene`: immersive 3D browsing for mountain/lake perception.
- `relief atlas`: readable cultural geography, suitable for dense labels and relationship browsing.

## Implementation Direction

The current prototype uses MapLibre GL JS because it can run as a static Cloudflare Pages app and supports:

- raster basemaps,
- raster DEM terrain,
- pitch/bearing camera movement,
- GeoJSON point, polygon, and route layers,
- future GPS LineString ingestion.

## Future Elevation Track Format

Recommended feature properties for a GPS walking path:

```json
{
  "id": "track_2026_06_10_lingyin_beigaofeng",
  "name": "Lingyin to Bei Gaofeng",
  "track_kind": "gps_walk",
  "source": "phone_gps",
  "recorded_at": "2026-06-10T08:00:00+08:00",
  "distance_m": 3400,
  "elevation_gain_m": 410
}
```

Use GeoJSON `LineString` or `MultiLineString`. If per-point elevation/time must be preserved, store parallel arrays:

```json
{
  "ele": [62, 77, 103],
  "time": ["2026-06-10T08:00:00+08:00", "2026-06-10T08:02:00+08:00", "2026-06-10T08:05:00+08:00"]
}
```
