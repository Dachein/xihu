# 5m DTM Procurement Notes

## Recommended First Vendor

Start with AW3D Standard.

Reason:

- It covers global land area.
- It offers DSM/DTM products.
- It supports 2.5m / 5m resolution.
- It delivers GeoTIFF, which can be converted into terrain tiles for MapLibre.
- Its minimum order size is 400 km2, enough to cover West Lake plus surrounding mountains.

Official product page:

- https://www.aw3d.jp/en/products/standard/

AW3D Enhanced is much finer, but likely unnecessary for the first production terrain base:

- 0.5m / 1m / 2m DSM/DTM.
- Minimum order size 25 km2.
- Better for detailed inspection, not required for the initial full West Lake mountain atlas.
- https://www.aw3d.jp/en/products/enhanced/

## Initial AOI

Ask for a quote using a polygon, not a vague place name.

Suggested rough AOI:

- West: 120.03
- South: 30.14
- East: 120.23
- North: 30.33

This covers West Lake, Lingyin, Bei Gaofeng, Longjing, Jiuxi, Wuyunshan, Yuhuangshan, Fenghuangshan, Wushan, and immediate urban context.

AW3D Standard has a 400 km2 minimum order. This bounding box is about that order of magnitude, but the vendor should confirm final chargeable area.

## Request Parameters

Ask for:

- Product: AW3D Standard
- Product type: DTM, not only DSM
- Resolution: 5m
- Area: AOI polygon for Hangzhou West Lake cultural landscape and surrounding mountains
- Delivery: GeoTIFF
- Coordinate reference system: WGS84 geographic if available, otherwise document source CRS
- Vertical datum: specify and document. Request EGM96/orthometric height if available.
- Quality layer: include QC/mask layer
- License: web service use, derived terrain tiles, internal processing, public mobile map rendering

Optional:

- DSM too, if budget allows. DSM helps compare vegetation/building canopy against DTM.
- 2.5m ortho imagery only if licensing supports web display and cost is acceptable.

## Vendor Workflow

AW3D describes the order workflow as:

1. Contact vendor with interested area and product.
2. Include AOI file such as SHP, KML, or KMZ.
3. Vendor performs feasibility check.
4. Vendor sends quotation.
5. Confirm technical specifications and delivery terms.
6. Place official order.
7. Production starts.
8. Delivery via FTP or DVD.
9. Payment by invoice.

Official contact/workflow page:

- https://www.aw3d.jp/en/contact/

## Acceptance Checklist

Before accepting delivery:

- GeoTIFF opens in QGIS/GDAL.
- AOI fully covers West Lake and all target ridges.
- No large voids over forested mountains.
- DTM and QC layer are included.
- Vertical units are meters.
- CRS and vertical datum are documented.
- License explicitly allows derived web terrain tiles.
- Compare elevation at known peaks: Bei Gaofeng, Wuyunshan, Yuhuangshan, Baoshishan.
- Compare against SRTM/Copernicus/JAXA 30m to detect systematic offsets.

## After Delivery

Processing steps:

1. Clip GeoTIFF to AOI.
2. Reproject if needed.
3. Fill small voids if license and quality permit.
4. Generate hillshade and contour lines.
5. Encode DEM into terrain-rgb or terrarium raster tiles.
6. Upload tiles to Cloudflare R2 or Pages static assets.
7. Replace the prototype DEM tile URL in `src/main.js`.
8. Record source, license, processing date, vertical datum, and confidence metadata.
