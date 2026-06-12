# D1 Data Integration

## Production Resources

- Worker: `https://xihu.dachein-x.workers.dev`
- Worker version: `fdfd0a49-7615-45aa-916c-eaff938724db`
- D1 database: `xihu-app`
- D1 database ID: `063b376b-3f95-4ca4-90c7-41bc6d166ccc`
- R2 terrain bucket: `xihu-terrain`
- Import SQL: `d1/xihu_app_d1.sql`

## API

- `GET /api/health`
- `GET /api/datasets`
- `GET /api/entities?limit=1200`
- `GET /api/entities?category=mountain_peak`
- `GET /api/trails`
- `GET /api/regions`
- `GET /api/boundaries`

## Storage Split

D1 stores queryable application records: entities, entity tags, mountain trails, UNESCO boundary metadata, and dataset manifests.

Large geospatial artifacts should stay outside D1:

- DEM GeoTIFFs
- generated Terrain-RGB/Terrarium tiles
- PMTiles or MBTiles
- full raw OSM XML tiles

Current terrain assets are served from R2-backed PMTiles:

- PMTiles endpoint: `/data/terrain/xihu-render-terrain.pmtiles`
- PMTiles format: Terrarium PNG raster-dem, zoom `10-16`
- PMTiles byte size: `334264839`
- R2 physical storage: `terrain/xihu-render-terrain.pmtiles.chunks/xihu-render-terrain.pmtiles.part-*`
- R2 chunk count: `5`
- Out-of-range fallback tile: `/data/terrain/terrarium/empty.png`
- Render out-of-range fallback tile: `/data/terrain/render-terrarium/empty.png`
- Artistic surface overlay: `/data/art-surface.geojson`

## Current Data State

- Entities: `881`
- Trails: `25`
- Boundary levels: `2`
- Dataset rows: `6`
- L1 property geometry: available
- L2 buffer geometry: pending vectorization
- Elevation: Copernicus GLO-30 sampled for `87` mountain peaks and all `25` trail rows
- Terrain tiles: Copernicus GLO-30 derived Terrarium tiles, zoom `10-15`, `1395` analytical tiles kept in the dataset
- Render terrain tiles: render-only interpolated/smoothed Copernicus GLO-30 Terrarium tiles, zoom `10-16`, `5407` tiles packed into PMTiles
- Artistic surface overlay: `2969` OSM semantic polygons; bamboo is intentionally folded into woodland until a reliable vegetation source is available

## Rendering Data

The map uses a render-only DEM for visual terrain:

- `xihu_glo30_render_dem_7m.tif`
- 4x upsampled from the clipped GLO-30 DSM
- approximate render grid: `7-8 m`
- cubic interpolation, light smoothing, and deterministic low-frequency visual noise
- not used for analytical elevation sampling
- deployed through R2 + PMTiles to avoid uploading thousands of PNG files as Cloudflare static assets

The art surface overlay is loaded after the core map data, so slow static GeoJSON downloads do not block the address list, trails, or point data.

## Elevation Fields

Entities:

- `elevation_m`: preferred application elevation, currently the sampled GLO-30 value when available
- `dem_elevation_m`: sampled GLO-30 value
- `osm_ele_raw`: original OSM `ele` tag when present
- `osm_dem_delta_m`: sampled DEM minus OSM `ele`
- `elevation_source`: `copernicus_glo30` for sampled mountain peaks
- `elevation_confidence`: coarse confidence score from DEM availability and OSM delta

Trails:

- `length_m`
- `elevation_min_m`
- `elevation_max_m`
- `elevation_start_m`
- `elevation_end_m`
- `ascent_m`
- `descent_m`
- `sample_count`
- `profile_json`
- `elevation_source`
