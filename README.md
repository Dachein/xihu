# xihu

Mobile-first Web terrain map for the Hangzhou West Lake cultural landscape.

## Terrain Map Type

The reference images combine two terrain-map traditions:

- Image 1: oblique 3D terrain scene, similar to Google Earth. A satellite or aerial imagery texture is draped over a DEM elevation model, then rendered with pitch, bearing, route overlays, and location markers.
- Image 2: shaded-relief physical map. It uses DEM-derived hillshade plus hypsometric tinting, where green/brown color bands suggest elevation and slope.

This prototype starts with the first approach: MapLibre GL JS renders a DEM-backed 3D terrain surface, while local GeoJSON layers add cultural entities, scenic regions, and mountain paths. A shaded-relief style can be added later as a second basemap once West Lake-specific DEM tiles or self-hosted hillshade tiles are prepared.

## Local Preview

```bash
python3 -m http.server 8788
```

Open `http://localhost:8788`.

## Cloudflare Pages

```bash
npx wrangler pages deploy . --project-name xihu
```

The app is static-first. `functions/api/entities.js` is included as a Cloudflare Pages Function stub for future dynamic data access.

## Data Model

- `data/xihu-regions.geojson`: scenic/cultural area polygons.
- `data/cultural-entities.geojson`: cultural place entities with `id`, `parent_id`, `entity_kind`, `elevation_m`, and tags.
- `data/trail-lines.geojson`: mountain and lakeside paths as GeoJSON LineString features.

Future walking GPS tracks can be normalized into GeoJSON features with time/elevation arrays, then merged into `trail-lines.geojson` or served from a Cloudflare D1/R2-backed API.

## DEM Plan

The current prototype uses public Terrarium DEM tiles as a 30m-class development terrain base. This is enough to validate West Lake terrain rendering, camera behavior, and cultural/trail overlays.

Production should replace the external DEM source with self-hosted terrain tiles generated from selected source GeoTIFF:

1. Free baseline: Copernicus DEM GLO-30, NASA SRTMGL1, or JAXA AW3D30.
2. Production terrain: purchased 5m DTM, preferably AW3D Standard or local survey data.
3. Hosting: Cloudflare R2 or Pages static tiles.

See `docs/5m-dtm-procurement.md` for the procurement checklist.
