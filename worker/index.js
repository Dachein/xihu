const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "public, max-age=60",
};

const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "geolocation=(self)",
};

const STATIC_FALLBACKS = new Map([
  ["/api/entities", "/data/cultural-entities.geojson"],
  ["/api/trails", "/data/trail-lines.geojson"],
  ["/api/regions", "/data/xihu-regions.geojson"],
]);

const ENTITY_KIND = {
  mountain_peak: "mountain",
  natural: "mountain",
  tourism: "view",
  historic: "temple",
  landscape: "mountain",
  civic_culture: "temple",
  settlement: "village",
  waterway: "water",
};

const TERRAIN_TILE_PREFIXES = ["/data/terrain/terrarium/", "/data/terrain/render-terrarium/"];
const TERRAIN_PMTILES_PATH = "/data/terrain/xihu-render-terrain.pmtiles";
const TERRAIN_PMTILES_CONTENT_TYPE = "application/vnd.pmtiles";
const TERRAIN_PMTILES_CHUNK_PREFIX = "terrain/xihu-render-terrain.pmtiles.chunks";
const TERRAIN_PMTILES_CHUNK_SIZE = 67_108_864;
const TERRAIN_PMTILES_SIZE = 334_264_839;
const TERRAIN_PMTILES_CHUNKS = [
  "xihu-render-terrain.pmtiles.part-000",
  "xihu-render-terrain.pmtiles.part-001",
  "xihu-render-terrain.pmtiles.part-002",
  "xihu-render-terrain.pmtiles.part-003",
  "xihu-render-terrain.pmtiles.part-004",
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return withCommonHeaders(new Response(null, { status: 204 }));
    }

    try {
      if (url.pathname === TERRAIN_PMTILES_PATH) {
        return terrainPmtilesResponse(request, env);
      }
      if (isTerrainTilePath(url.pathname)) {
        return terrainTileResponse(request, env);
      }
      if (url.pathname === "/api/health") return health(env);
      if (url.pathname === "/api/datasets") return datasets(env);
      if (url.pathname === "/api/entities") return entities(request, env);
      if (url.pathname === "/api/trails") return trails(env);
      if (url.pathname === "/api/regions" || url.pathname === "/api/boundaries") return boundaries(env);
      if (url.pathname === "/api/entry-schema") return entrySchema();
    } catch (error) {
      console.error("API error", error);
      if (STATIC_FALLBACKS.has(url.pathname)) {
        return dataResponse(request, env, STATIC_FALLBACKS.get(url.pathname));
      }
      return json({ error: "Internal API error" }, { status: 500 });
    }

    const assetResponse = await env.ASSETS.fetch(request);
    return withCommonHeaders(assetResponse);
  },
};

async function health(env) {
  const counts = await countTables(env, ["entities", "trails", "boundary_levels", "datasets"]);
  return json({
    ok: true,
    service: "xihu",
    runtime: "cloudflare-worker",
    database: "xihu-app",
    map: "west-lake-mountain-river-atlas",
    counts,
  });
}

async function terrainTileResponse(request, env) {
  const assetUrl = new URL(request.url);
  assetUrl.search = "";
  const response = await env.ASSETS.fetch(new Request(assetUrl.toString(), request));
  const contentType = response.headers.get("content-type") || "";
  if (response.ok && contentType.includes("image/png")) {
    return withCommonHeaders(response);
  }

  const fallbackUrl = new URL(request.url);
  fallbackUrl.pathname = fallbackTerrainTilePath(assetUrl.pathname);
  fallbackUrl.search = "";
  const fallback = await env.ASSETS.fetch(new Request(fallbackUrl.toString(), request));
  const headers = new Headers(fallback.headers);
  headers.set("content-type", "image/png");
  headers.set("cache-control", "public, max-age=86400");
  return withCommonHeaders(
    new Response(fallback.body, {
      status: 200,
      headers,
    }),
  );
}

async function terrainPmtilesResponse(request, env) {
  if (!env.TILES) return new Response("R2 terrain binding is not configured", { status: 500 });

  const range = parseByteRange(request.headers.get("range"), TERRAIN_PMTILES_SIZE);
  const headers = pmtilesHeaders();

  if (range) {
    const length = range.end - range.start + 1;
    headers.set("content-length", String(length));
    headers.set("content-range", `bytes ${range.start}-${range.end}/${TERRAIN_PMTILES_SIZE}`);
    return withCommonHeaders(
      new Response(request.method === "HEAD" ? null : streamTerrainRange(env, range.start, range.end), {
        status: 206,
        headers,
      }),
    );
  }

  headers.set("content-length", String(TERRAIN_PMTILES_SIZE));
  return withCommonHeaders(
    new Response(
      request.method === "HEAD" ? null : streamTerrainRange(env, 0, TERRAIN_PMTILES_SIZE - 1),
      {
        status: 200,
        headers,
      },
    ),
  );
}

function pmtilesHeaders() {
  return new Headers({
    "content-type": TERRAIN_PMTILES_CONTENT_TYPE,
    "accept-ranges": "bytes",
    "cache-control": "public, max-age=31536000, immutable",
  });
}

function parseByteRange(header, size) {
  if (!header) return null;
  const match = header.match(/^bytes=(\d*)-(\d*)$/);
  if (!match) return null;

  let start = match[1] === "" ? null : Number(match[1]);
  let end = match[2] === "" ? null : Number(match[2]);
  if (start === null && end === null) return null;

  if (start === null) {
    const suffixLength = end;
    if (!Number.isFinite(suffixLength) || suffixLength <= 0) return null;
    start = Math.max(size - suffixLength, 0);
    end = size - 1;
  } else {
    if (!Number.isFinite(start) || start < 0) return null;
    end = end === null || !Number.isFinite(end) ? size - 1 : Math.min(end, size - 1);
  }

  if (start > end || start >= size) return null;
  return { start, end };
}

function streamTerrainRange(env, start, end) {
  return new ReadableStream({
    async start(controller) {
      try {
        let cursor = start;
        while (cursor <= end) {
          const chunkIndex = Math.floor(cursor / TERRAIN_PMTILES_CHUNK_SIZE);
          const chunkOffset = cursor % TERRAIN_PMTILES_CHUNK_SIZE;
          const chunkEnd = Math.min(end, (chunkIndex + 1) * TERRAIN_PMTILES_CHUNK_SIZE - 1);
          const length = chunkEnd - cursor + 1;
          const chunk = await env.TILES.get(terrainChunkKey(chunkIndex), {
            range: {
              offset: chunkOffset,
              length,
            },
          });

          if (!chunk?.body) {
            throw new Error(`Missing terrain PMTiles chunk ${chunkIndex}`);
          }

          const reader = chunk.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }

          cursor = chunkEnd + 1;
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

function terrainChunkKey(index) {
  return `${TERRAIN_PMTILES_CHUNK_PREFIX}/${TERRAIN_PMTILES_CHUNKS[index]}`;
}

function isTerrainTilePath(pathname) {
  return pathname.endsWith(".png") && TERRAIN_TILE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function fallbackTerrainTilePath(pathname) {
  if (pathname.startsWith("/data/terrain/render-terrarium/")) return "/data/terrain/render-terrarium/empty.png";
  return "/data/terrain/terrarium/empty.png";
}

async function datasets(env) {
  const result = await env.DB.prepare(
    `SELECT dataset_id, kind, title, source_path, public_url, source_license,
            attribution, status, metadata_json
     FROM datasets
     ORDER BY kind, dataset_id`,
  ).all();
  return json({ datasets: result.results.map(parseMetadataJson) });
}

async function entities(request, env) {
  const url = new URL(request.url);
  const scope = url.searchParams.get("scope");
  const category = url.searchParams.get("category");
  const query = url.searchParams.get("q")?.trim();
  const limit = clampLimit(url.searchParams.get("limit"), 1200);

  const clauses = [];
  const params = [];
  if (scope) {
    clauses.push("scope_level = ?");
    params.push(scope);
  }
  if (category) {
    clauses.push("category = ?");
    params.push(category);
  }
  if (query) {
    clauses.push("search_text LIKE ?");
    params.push(`%${query}%`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const result = await env.DB.prepare(
    `SELECT entity_id, osm_type, osm_id, name, name_zh, name_en, category, subtype,
            lon, lat, scope_level, scope_note, elevation_m, elevation_source,
            elevation_confidence, dem_elevation_m, osm_dem_delta_m, osm_ele_raw,
            source, source_license, source_rank
     FROM entities
     ${where}
     ORDER BY source_rank, name IS NULL, name, entity_id
     LIMIT ?`,
  )
    .bind(...params, limit)
    .all();

  return json({
    type: "FeatureCollection",
    features: result.results.map(entityFeature),
  });
}

async function trails(env) {
  const result = await env.DB.prepare(
    `SELECT trail_id, osm_type, osm_id, name, highway, surface, access, width,
            incline, scope_level, scope_note, node_count, geometry_json,
            elevation_status, elevation_source, length_m, elevation_min_m,
            elevation_max_m, elevation_start_m, elevation_end_m, ascent_m,
            descent_m, sample_count, profile_json, source, source_license
     FROM trails
     ORDER BY name IS NULL, name, trail_id`,
  ).all();

  return json({
    type: "FeatureCollection",
    features: result.results.map(trailFeature),
  });
}

async function boundaries(env) {
  const result = await env.DB.prepare(
    `SELECT level, level_name, name_zh, name_en, area_ha_official, geometry_status,
            geometry_json, geometry_url, bbox_west, bbox_south, bbox_east, bbox_north,
            source, source_license, metadata_json
     FROM boundary_levels
     ORDER BY level`,
  ).all();

  return json({
    type: "FeatureCollection",
    features: result.results.map(boundaryFeature).filter(Boolean),
  });
}

function entrySchema() {
  return json({
    lng: "number",
    lat: "number",
    elevation_m: "number | null",
    time: "ISO-8601 string",
    source: "gps | click | share | view",
    camera: {
      zoom: "number",
      pitch: "number",
      bearing: "number",
    },
  });
}

async function countTables(env, tables) {
  const counts = {};
  for (const table of tables) {
    const row = await env.DB.prepare(`SELECT COUNT(*) AS count FROM ${table}`).first();
    counts[table] = row?.count ?? 0;
  }
  return counts;
}

function entityFeature(row) {
  return {
    type: "Feature",
    properties: {
      id: row.entity_id,
      osm_type: row.osm_type,
      osm_id: row.osm_id,
      name: row.name_zh || row.name || row.name_en || "未命名地点",
      name_zh: row.name_zh,
      name_en: row.name_en,
      entity_kind: ENTITY_KIND[row.category] || "view",
      category: row.category,
      subtype: row.subtype,
      summary: entitySummary(row),
      scope_level: row.scope_level,
      scope_note: row.scope_note,
      elevation_m: row.elevation_m,
      elevation_source: row.elevation_source,
      elevation_confidence: row.elevation_confidence,
      dem_elevation_m: row.dem_elevation_m,
      osm_dem_delta_m: row.osm_dem_delta_m,
      osm_ele_raw: row.osm_ele_raw,
      confidence: row.elevation_source === "copernicus_glo30" ? "glo30-sampled" : row.elevation_source ? "osm" : "pending-dem",
      source: row.source,
      source_license: row.source_license,
    },
    geometry: {
      type: "Point",
      coordinates: [row.lon, row.lat],
    },
  };
}

function trailFeature(row) {
  const geometry = safeJson(row.geometry_json) || { type: "LineString", coordinates: [] };
  return {
    type: "Feature",
    properties: {
      id: row.trail_id,
      osm_type: row.osm_type,
      osm_id: row.osm_id,
      name: row.name || "未命名山路",
      trail_kind: "route",
      highway: row.highway,
      surface: row.surface,
      access: row.access,
      width: row.width,
      incline: row.incline,
      node_count: row.node_count,
      length_m: row.length_m,
      elevation_min_m: row.elevation_min_m,
      elevation_max_m: row.elevation_max_m,
      elevation_start_m: row.elevation_start_m,
      elevation_end_m: row.elevation_end_m,
      ascent_m: row.ascent_m,
      descent_m: row.descent_m,
      sample_count: row.sample_count,
      profile: safeJson(row.profile_json) || [],
      scope_level: row.scope_level,
      scope_note: row.scope_note,
      summary: trailSummary(row),
      elevation_status: row.elevation_status,
      elevation_source: row.elevation_source,
      confidence: row.elevation_status || "pending_dem_sampling",
      source: row.source,
      source_license: row.source_license,
      color: "#cf5b44",
    },
    geometry,
  };
}

function boundaryFeature(row) {
  const geometry = safeJson(row.geometry_json);
  if (!geometry) return null;
  const metadata = safeJson(row.metadata_json) || {};
  return {
    type: "Feature",
    properties: {
      id: `unesco:${row.level}`,
      level: row.level,
      level_name: row.level_name,
      name: row.name_zh || row.name_en || row.level,
      name_zh: row.name_zh,
      name_en: row.name_en,
      entity_kind: row.level === "L1" ? "mountain" : "view",
      summary: `${row.level} · ${row.area_ha_official || "未知"} ha · ${row.geometry_status}`,
      area_ha_official: row.area_ha_official,
      geometry_status: row.geometry_status,
      geometry_url: row.geometry_url,
      source: row.source,
      source_license: row.source_license,
      confidence: metadata.geometry_source_rank || row.geometry_status,
      color: row.level === "L1" ? "#8f6b78" : "#5f82b8",
    },
    geometry,
  };
}

function entitySummary(row) {
  const parts = [categoryLabel(row.category, row.subtype), row.scope_level];
  if (Number.isFinite(row.elevation_m)) parts.push(`${Math.round(row.elevation_m)} m`);
  if (row.elevation_source === "copernicus_glo30") parts.push("GLO-30");
  return parts.filter(Boolean).join(" · ");
}

function trailSummary(row) {
  const parts = ["山路", row.highway, row.scope_level];
  if (Number.isFinite(row.length_m)) parts.push(formatMeters(row.length_m));
  if (Number.isFinite(row.elevation_min_m) && Number.isFinite(row.elevation_max_m)) {
    parts.push(`${Math.round(row.elevation_min_m)}-${Math.round(row.elevation_max_m)} m`);
  }
  if (Number.isFinite(row.ascent_m)) parts.push(`爬升 ${Math.round(row.ascent_m)} m`);
  return parts.filter(Boolean).join(" · ");
}

function formatMeters(value) {
  if (value >= 1000) return `${(value / 1000).toFixed(2)} km`;
  return `${Math.round(value)} m`;
}

function categoryLabel(category, subtype) {
  const labels = {
    mountain_peak: "山峰",
    natural: "自然地貌",
    tourism: "游览点",
    historic: "历史文化",
    landscape: "园林景观",
    civic_culture: "公共文化",
    settlement: "地名",
    waterway: "水系",
  };
  return subtype ? `${labels[category] || category}/${subtype}` : labels[category] || category;
}

function parseMetadataJson(row) {
  return {
    ...row,
    metadata_json: safeJson(row.metadata_json),
  };
}

function safeJson(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (_error) {
    return null;
  }
}

function clampLimit(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(Math.floor(parsed), 2000));
}

async function dataResponse(request, env, assetPath) {
  const assetUrl = new URL(request.url);
  assetUrl.pathname = assetPath;
  assetUrl.search = "";

  const assetRequest = new Request(assetUrl.toString(), request);
  const response = await env.ASSETS.fetch(assetRequest);

  if (!response.ok) {
    return json({ error: "Data not found", path: assetPath }, { status: 404 });
  }

  const body = await response.text();
  return withCommonHeaders(
    new Response(body, {
      status: 200,
      headers: JSON_HEADERS,
    }),
  );
}

function json(body, init = {}) {
  return withCommonHeaders(
    new Response(JSON.stringify(body, null, 2), {
      ...init,
      headers: {
        ...JSON_HEADERS,
        ...(init.headers || {}),
      },
    }),
  );
}

function withCommonHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
