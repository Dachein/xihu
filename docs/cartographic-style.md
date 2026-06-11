# Cartographic Style Direction

The product should not default to a fully literal satellite map. Satellite imagery is useful for verification, but it is visually noisy and pulls attention toward buildings, roads, and accidental texture.

The preferred product language is: real terrain skeleton, painterly cartographic expression.

## Recommended Layers

1. Real DEM terrain
   - Keep elevation and hillshade grounded in measured DEM data.
   - Use this as the reliable mountain-water structure.

2. Generalized water and mountain regions
   - Draw West Lake and Qiantang River as simplified water forms.
   - Draw mountain systems as cultural landscape regions, not administrative polygons.

3. Cultural entities and paths
   - Keep exact coordinates for query, navigation, and audit.
   - Render them with symbolic, atlas-like styling.

4. Satellite as verification mode
   - Keep satellite imagery available, but do not make it the default long-term visual style.

## Field Practices To Reference

- Shaded relief maps: DEM-derived hillshade plus tinting.
- Hypsometric tint maps: color bands communicating elevation and landform.
- Illustrated maps / pictorial maps: culturally important features are emphasized over literal completeness.
- Cartographic generalization: simplify geometry and suppress irrelevant detail at each zoom.
- Watercolor / painterly basemaps: raster or vector styling that evokes hand-drawn map texture while preserving coordinates.

## Implementation Path

Phase 1:

- Keep MapLibre terrain.
- Reduce satellite dominance.
- Add a landscape atlas mode based on hillshade, water polygons, mountain regions, and symbolic labels.

Phase 2:

- Replace external basemap with self-hosted PMTiles or vector tiles.
- Style those tiles with a custom West Lake atlas palette.

Phase 3:

- Generate custom shaded-relief and color-relief tiles from our chosen DEM.
- Add hand-tuned ridge, valley, lake, river, and cultural-route layers.


## Stamen Reference

Stamen Terrain and Watercolor are the closest external references for the desired direction.

What to borrow:

- Watercolor-style area washes instead of literal satellite texture.
- Organic edges around water and terrain regions.
- Hillshade and natural vegetation colors for orientation.
- High selectivity: only draw what supports reading the place.

What not to copy directly:

- Do not depend on Stamen/Stadia raster tiles as the product default.
- Do not make the atlas a generic world map skin.
- Keep West Lake cultural entities, paths, and terrain data controlled by this project.

Current implementation follows this as a local style: paper background, DEM hillshade, washed water/mountain polygons, softened region edges, and symbolic paths/labels.
