# xihu

Mobile-first Web terrain map for the Hangzhou West Lake cultural landscape.

## Terrain Map Type

The reference images combine two terrain-map traditions:

- Image 1: oblique 3D terrain scene, similar to Google Earth. A satellite or aerial imagery texture is draped over a DEM elevation model, then rendered with pitch, bearing, route overlays, and location markers.
- Image 2: shaded-relief physical map. It uses DEM-derived hillshade plus hypsometric tinting, where green/brown color bands suggest elevation and slope.

This prototype starts with the first approach: MapLibre GL JS renders a DEM-backed 3D terrain surface, while local GeoJSON layers add cultural entities, scenic regions, and mountain paths. A shaded-relief style can be added later as a second basemap once West Lake-specific DEM tiles or self-hosted hillshade tiles are prepared.

## Local Preview

```bash
npm run dev
```

Open the Wrangler local URL, usually `http://localhost:8787`.

## Cloudflare Worker

```bash
npm run deploy
```

The app is now a Worker with Static Assets. Static files live in `public/`, and `worker/index.js` owns API routing plus static asset fallback.

Current API routes:

- `/api/health`
- `/api/entities`
- `/api/trails`
- `/api/regions`

The earlier Cloudflare Pages preview can remain as a historical preview, but the product runtime should use Workers.

## Data Model

- `public/data/xihu-regions.geojson`: scenic/cultural area polygons.
- `public/data/cultural-entities.geojson`: cultural place entities with `id`, `parent_id`, `entity_kind`, `elevation_m`, and tags.
- `public/data/trail-lines.geojson`: mountain and lakeside paths as GeoJSON LineString features.

Future walking GPS tracks can be normalized into GeoJSON features with time/elevation arrays, then merged into `trail-lines.geojson` or served from a Cloudflare D1/R2-backed API.


## Current Area of Interest

The working AOI is now the West Lake mountain-water-river system, not only the lake basin.

- North: Baoshishan, Bei Gaofeng, Lingyin mountain edge.
- West: Lingyin, Longjing, Jiuxi, Wuyunshan mountain system.
- South: Qiantang River and Liuhe Pagoda / Zhijiang interface.
- East: Wushan, Yuhuangshan, and the city-facing lake edge.

The map limits panning with `XIHU_LANDSCAPE_BOUNDS` in `src/main.js` so mobile clients request fewer terrain and imagery tiles than a broad Hangzhou-scale scene.

## DEM Plan

The current prototype uses public Terrarium DEM tiles as a 30m-class development terrain base. This is enough to validate West Lake terrain rendering, camera behavior, and cultural/trail overlays.

Production should replace the external DEM source with self-hosted terrain tiles generated from selected source GeoTIFF:

1. Free baseline: Copernicus DEM GLO-30, NASA SRTMGL1, or JAXA AW3D30.
2. Production terrain: purchased 5m DTM, preferably AW3D Standard or local survey data.
3. Hosting: Cloudflare R2 or Pages static tiles.

See `docs/5m-dtm-procurement.md` for the procurement checklist.

## Point Entry Model

The map now supports entering the 3D landscape from any point. Users can tap the map, use GPS, or share the current view to create an observation point. The URL records `lng`, `lat`, `z`, `pitch`, `bearing`, `source`, `ele`, and `t`, so a mountain position can be revisited later.

API schema endpoint:

- `/api/entry-schema`

## Observation Controls

When an observation point is active, the map shows a compact controller for moving through the 3D landscape:

- Forward/back/left/right: move the observation point relative to current bearing.
- Zoom in/out: lower or raise the camera.
- Rotate left/right: change bearing.
- Pitch up/down: change viewing angle.

Keyboard shortcuts mirror the controls: arrow keys or WASD move, Q/E rotate, +/- zoom, and [/] adjust pitch. Each move updates the entry URL so the current mountain view can be shared.
