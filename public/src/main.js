const XIHU_LANDSCAPE_BOUNDS = [
  [120.052, 30.158],
  [120.206, 30.292],
];

const WEST_LAKE_VIEW = {
  center: [120.128, 30.224],
  zoom: 11.85,
  pitch: 62,
  bearing: -24,
};

const DATA_URLS = {
  regions: "data/xihu-regions.geojson",
  entities: "data/cultural-entities.geojson",
  trails: "data/trail-lines.geojson",
};

const EMPTY_FEATURE_COLLECTION = {
  type: "FeatureCollection",
  features: [],
};

const ENTRY_SOURCE_LABELS = {
  gps: "GPS",
  click: "地图点",
  share: "分享",
  view: "视角",
};

const state = {
  regions: null,
  entities: [],
  trails: [],
  selectedId: null,
  entryPoint: null,
  uiBound: false,
  domainLayersAdded: false,
};

lucide.createIcons();

const map = new maplibregl.Map({
  container: "map",
  center: WEST_LAKE_VIEW.center,
  zoom: WEST_LAKE_VIEW.zoom,
  pitch: WEST_LAKE_VIEW.pitch,
  bearing: WEST_LAKE_VIEW.bearing,
  minZoom: 10.7,
  maxZoom: 17,
  maxPitch: 82,
  hash: false,
  attributionControl: false,
  localIdeographFontFamily:
    '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
  style: {
    version: 8,
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sources: {
      osm: {
        type: "raster",
        tiles: [
          "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
        ],
        tileSize: 256,
        maxzoom: 19,
        attribution: "OpenStreetMap contributors",
      },
      satellite: {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        maxzoom: 19,
        attribution: "Esri, Maxar, Earthstar Geographics, and the GIS User Community",
      },
      terrain: {
        type: "raster-dem",
        tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
        tileSize: 256,
        maxzoom: 15,
        encoding: "terrarium",
        attribution: "AWS Terrain Tiles",
      },
      hillshade: {
        type: "raster-dem",
        tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
        tileSize: 256,
        maxzoom: 15,
        encoding: "terrarium",
      },
    },
    layers: [
      {
        id: "paper-base",
        type: "background",
        paint: {
          "background-color": "#e7ddbd",
        },
      },
      {
        id: "satellite-base",
        type: "raster",
        source: "satellite",
        layout: { visibility: "none" },
        paint: {
          "raster-opacity": 0.74,
          "raster-saturation": -0.28,
          "raster-contrast": -0.08,
          "raster-brightness-min": 0.08,
          "raster-brightness-max": 0.92,
        },
      },
      {
        id: "osm-atlas",
        type: "raster",
        source: "osm",
        layout: { visibility: "none" },
        paint: {
          "raster-opacity": 0.26,
          "raster-saturation": -0.85,
          "raster-contrast": -0.12,
          "raster-brightness-min": 0.18,
          "raster-brightness-max": 0.96,
        },
      },
      {
        id: "hillshade-layer",
        type: "hillshade",
        source: "hillshade",
        paint: {
          "hillshade-accent-color": "#8a8a65",
          "hillshade-highlight-color": "#f7efd2",
          "hillshade-shadow-color": "#738069",
          "hillshade-illumination-direction": 315,
          "hillshade-exaggeration": 0.72,
        },
      },
    ],
    terrain: {
      source: "terrain",
      exaggeration: 1.25,
    },
    sky: {
      "sky-color": "#b8d3e0",
      "sky-horizon-blend": 0.18,
      "horizon-color": "#dbe4d2",
      "horizon-fog-blend": 0.25,
      "fog-color": "#8fa6a0",
      "fog-ground-blend": 0.18,
    },
  },
});

map.addControl(
  new maplibregl.NavigationControl({
    visualizePitch: true,
    showCompass: true,
    showZoom: true,
  }),
  "bottom-right",
);
map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
map.setMaxBounds(XIHU_LANDSCAPE_BOUNDS);

initializeApp();

map.on("load", () => {
  tryAddDomainLayers();
  updateCameraState();
});
map.on("styledata", tryAddDomainLayers);
map.on("idle", tryAddDomainLayers);
map.on("move", updateCameraState);

const layerInitTimer = window.setInterval(() => {
  tryAddDomainLayers();
  if (state.domainLayersAdded) window.clearInterval(layerInitTimer);
}, 700);

async function initializeApp() {
  const [regions, entities, trails] = await Promise.all(
    Object.values(DATA_URLS).map((url) => fetch(url).then((res) => res.json())),
  );

  state.regions = regions;
  state.entities = entities.features;
  state.trails = trails.features;

  renderEntityList(state.entities);
  bindUi();
  updateCameraState();
  tryAddDomainLayers();
}

function tryAddDomainLayers() {
  if (state.domainLayersAdded || !state.regions || map.getSource("regions")) return;

  try {
    addDomainLayers();
    state.domainLayersAdded = true;
  } catch (error) {
    if (!String(error?.message || error).includes("Style is not done loading")) {
      console.warn("Domain layers are waiting for the map style.", error);
    }
  }
}

function addDomainLayers() {
  map.addSource("regions", {
    type: "geojson",
    data: state.regions,
  });
  map.addSource("entities", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: state.entities,
    },
  });
  map.addSource("trails", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: state.trails,
    },
  });
  map.addSource("entry-point", {
    type: "geojson",
    data: EMPTY_FEATURE_COLLECTION,
  });

  map.addLayer({
    id: "region-fill",
    type: "fill",
    source: "regions",
    paint: {
      "fill-color": [
        "match",
        ["get", "entity_kind"],
        "water",
        "#77bfc0",
        "mountain",
        ["coalesce", ["get", "color"], "#8fb36d"],
        ["coalesce", ["get", "color"], "#9fb076"],
      ],
      "fill-opacity": [
        "match",
        ["get", "entity_kind"],
        "water",
        0.48,
        "mountain",
        0.31,
        0.26,
      ],
    },
  });

  map.addLayer({
    id: "region-edge-soft",
    type: "line",
    source: "regions",
    paint: {
      "line-color": ["coalesce", ["get", "color"], "#ad9c63"],
      "line-width": ["interpolate", ["linear"], ["zoom"], 10, 9, 15, 18],
      "line-opacity": 0.12,
      "line-blur": 7,
    },
  });

  map.addLayer({
    id: "region-line",
    type: "line",
    source: "regions",
    paint: {
      "line-color": ["coalesce", ["get", "color"], "#9a8750"],
      "line-width": 1.2,
      "line-opacity": 0.52,
      "line-blur": 0.4,
    },
  });

  map.addLayer({
    id: "trail-casing",
    type: "line",
    source: "trails",
    paint: {
      "line-color": "#f6ddad",
      "line-width": ["interpolate", ["linear"], ["zoom"], 11, 5, 15, 10],
      "line-opacity": 0.74,
      "line-blur": 1.2,
    },
  });

  map.addLayer({
    id: "trail-line",
    type: "line",
    source: "trails",
    paint: {
      "line-color": ["coalesce", ["get", "color"], "#cf5b44"],
      "line-width": ["interpolate", ["linear"], ["zoom"], 11, 2.1, 15, 5.4],
      "line-opacity": 0.9,
      "line-blur": 0.35,
    },
  });

  map.addLayer({
    id: "entry-halo",
    type: "circle",
    source: "entry-point",
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 16, 15, 28],
      "circle-color": "#f3d177",
      "circle-opacity": 0.18,
      "circle-stroke-color": "#fff3c6",
      "circle-stroke-opacity": 0.42,
      "circle-stroke-width": 1.4,
    },
  });

  map.addLayer({
    id: "entry-dot",
    type: "circle",
    source: "entry-point",
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 6, 15, 10],
      "circle-color": "#d44f37",
      "circle-stroke-color": "#fff1cf",
      "circle-stroke-width": 2.2,
    },
  });

  map.addLayer({
    id: "entry-label",
    type: "symbol",
    source: "entry-point",
    layout: {
      "text-field": ["get", "label"],
      "text-size": ["interpolate", ["linear"], ["zoom"], 11, 12, 15, 15],
      "text-offset": [0, 1.35],
      "text-anchor": "top",
      "text-font": ["Open Sans Regular"],
    },
    paint: {
      "text-color": "#4a261c",
      "text-halo-color": "#f4eacb",
      "text-halo-width": 1.7,
    },
  });

  map.addLayer({
    id: "entity-dots",
    type: "circle",
    source: "entities",
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 5, 15, 9],
      "circle-color": [
        "match",
        ["get", "entity_kind"],
        "mountain",
        "#8fcb7d",
        "temple",
        "#d7b760",
        "water",
        "#6ec7ce",
        "view",
        "#f0a05f",
        "#f2eee2",
      ],
      "circle-stroke-color": "#fff1cf",
      "circle-stroke-width": 1.9,
    },
  });

  map.addLayer({
    id: "entity-labels",
    type: "symbol",
    source: "entities",
    layout: {
      "text-field": ["get", "name"],
      "text-size": ["interpolate", ["linear"], ["zoom"], 11, 11, 15, 14],
      "text-offset": [0, 1.15],
      "text-anchor": "top",
      "text-allow-overlap": false,
      "text-font": ["Open Sans Regular"],
    },
    paint: {
      "text-color": "#3e2f1c",
      "text-halo-color": "#f4eacb",
      "text-halo-width": 1.6,
    },
  });

  map.on("click", "entity-dots", (event) => selectFeature(event.features[0]));
  map.on("click", "trail-line", (event) => selectFeature(event.features[0]));

  ["entity-dots", "trail-line", "entry-dot"].forEach((layer) => {
    map.on("mouseenter", layer, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", layer, () => {
      map.getCanvas().style.cursor = "";
    });
  });

  map.on("click", "entry-dot", () => {
    if (state.entryPoint) renderEntryPoint(state.entryPoint);
  });

  syncEntryPointLayer();
}

function bindUi() {
  if (state.uiBound) return;
  state.uiBound = true;
  document.getElementById("reset-btn").addEventListener("click", () => {
    map.flyTo({ ...WEST_LAKE_VIEW, duration: 900 });
  });

  document.getElementById("locate-btn").addEventListener("click", () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      setEntryPoint({
        lng: position.coords.longitude,
        lat: position.coords.latitude,
        elevationM: position.coords.altitude,
        accuracyM: position.coords.accuracy,
        source: "gps",
      });
    });
  });

  document.getElementById("share-view-btn").addEventListener("click", () => {
    const center = map.getCenter();
    setEntryPoint(
      {
        lng: center.lng,
        lat: center.lat,
        source: "view",
      },
      { flyTo: false, writeUrl: true },
    );
    shareEntryPoint();
  });

  document.getElementById("sheet-toggle").addEventListener("click", () => {
    document.getElementById("sheet").classList.toggle("collapsed");
  });

  document.getElementById("entity-search").addEventListener("input", (event) => {
    const query = event.target.value.trim().toLowerCase();
    const features = state.entities.filter((feature) => {
      const values = [
        feature.properties.name,
        feature.properties.name_en,
        feature.properties.entity_kind,
        feature.properties.parent_id,
        feature.properties.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return values.includes(query);
    });
    renderEntityList(features);
  });

  document.querySelectorAll(".layer-toggle").forEach((button) => {
    button.addEventListener("click", () => toggleLayer(button));
  });

  document.querySelectorAll(".mode-chip").forEach((button) => {
    button.addEventListener("click", () => setMode(button));
  });

  map.on("click", (event) => {
    if (clickedDomainFeature(event.point)) return;
    setEntryPoint({
      lng: event.lngLat.lng,
      lat: event.lngLat.lat,
      source: "click",
    });
  });

  restoreEntryPointFromUrl();
}

function toggleLayer(button) {
  const layer = button.dataset.layer;
  button.classList.toggle("active");
  const visible = button.classList.contains("active");

  if (layer === "satellite") {
    setVisibility("satellite-base", visible);
    return;
  }
  if (layer === "atlas") {
    setVisibility("osm-atlas", visible);
    return;
  }
  if (layer === "regions") {
    setVisibility("region-fill", visible);
    setVisibility("region-edge-soft", visible);
    setVisibility("region-line", visible);
    return;
  }
  if (layer === "trails") {
    setVisibility("trail-casing", visible);
    setVisibility("trail-line", visible);
  }
}

function setMode(button) {
  document.querySelectorAll(".mode-chip").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");

  const mode = button.dataset.mode;
  if (mode === "terrain") {
    map.easeTo({ pitch: 62, bearing: -24, zoom: Math.max(map.getZoom(), 11.85), duration: 700 });
  }
  if (mode === "culture") {
    map.easeTo({ pitch: 45, bearing: 0, zoom: 13.2, duration: 700 });
  }
  if (mode === "trail") {
    map.easeTo({ pitch: 72, bearing: -48, zoom: 13.8, duration: 700 });
  }
}

function setVisibility(layerId, visible) {
  if (map.getLayer(layerId)) {
    map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
  }
}

function clickedDomainFeature(point) {
  const layers = ["entity-dots", "trail-line", "entry-dot"].filter((layer) => map.getLayer(layer));
  if (!layers.length) return false;
  return map.queryRenderedFeatures(point, { layers }).length > 0;
}

function renderEntityList(features) {
  const list = document.getElementById("entity-list");
  list.innerHTML = "";

  features.forEach((feature) => {
    const button = document.createElement("button");
    button.className = "entity-item";
    button.type = "button";
    button.innerHTML = `
      <span>
        <strong>${feature.properties.name}</strong>
        <p>${feature.properties.summary}</p>
      </span>
      <span class="entity-kind">${kindLabel(feature.properties.entity_kind)}</span>
    `;
    button.addEventListener("click", () => selectFeature(feature));
    list.appendChild(button);
  });
}

function selectFeature(feature) {
  state.selectedId = feature.properties.id;
  const coordinates = getFeatureCenter(feature);
  map.flyTo({
    center: coordinates,
    zoom: Math.max(map.getZoom(), 14.3),
    pitch: 67,
    bearing: map.getBearing(),
    duration: 750,
  });

  document.getElementById("sheet-title").textContent = "西湖文化地点";
  const parent = feature.properties.parent_id ? `<span class="meta-pill">${feature.properties.parent_id}</span>` : "";
  document.getElementById("detail-card").innerHTML = `
    <h2>${feature.properties.name}</h2>
    <p>${feature.properties.summary || feature.properties.description || "暂无描述"}</p>
    <div class="meta-line">
      <span class="meta-pill">${kindLabel(feature.properties.entity_kind || feature.properties.trail_kind)}</span>
      ${parent}
      <span class="meta-pill">${feature.properties.confidence || "draft"}</span>
    </div>
  `;
}

function setEntryPoint(input, options = {}) {
  const lng = Number(input.lng);
  const lat = Number(input.lat);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;

  const elevation = getElevationEstimate(lng, lat, input.elevationM);
  const point = {
    lng,
    lat,
    elevationM: elevation.value,
    elevationConfidence: elevation.confidence,
    accuracyM: Number.isFinite(input.accuracyM) ? Math.round(input.accuracyM) : null,
    source: input.source || "click",
    time: input.time || new Date().toISOString(),
    camera: {
      zoom: input.zoom || Math.max(map.getZoom(), 15.1),
      pitch: input.pitch ?? 68,
      bearing: input.bearing ?? map.getBearing(),
    },
  };

  state.entryPoint = point;
  syncEntryPointLayer();
  renderEntryPoint(point);

  if (options.writeUrl !== false) writeEntryPointToUrl(point);
  if (options.flyTo !== false) {
    moveToEntryPoint(point, { animate: false });
  }
}

function moveToEntryPoint(point, options = {}) {
  const camera = {
    center: [point.lng, point.lat],
    zoom: point.camera.zoom,
    pitch: point.camera.pitch,
    bearing: point.camera.bearing,
  };

  if (options.animate === false) {
    map.jumpTo(camera);
  } else {
    map.easeTo({ ...camera, duration: 700 });
  }
  window.setTimeout(updateCameraState, 0);
}

function getElevationEstimate(lng, lat, explicitElevation) {
  if (Number.isFinite(explicitElevation)) {
    return { value: Math.round(explicitElevation), confidence: "gps" };
  }

  try {
    if (typeof map.queryTerrainElevation === "function") {
      const elevation = map.queryTerrainElevation([lng, lat], { exaggerated: false });
      if (Number.isFinite(elevation)) {
        return { value: Math.round(elevation), confidence: "dem" };
      }
    }
  } catch (_error) {
    // Terrain tiles may still be loading; keep the point usable without elevation.
  }

  return { value: null, confidence: "unknown" };
}

function syncEntryPointLayer() {
  const source = map.getSource("entry-point");
  if (!source) return;

  const feature = state.entryPoint
    ? {
        type: "Feature",
        properties: {
          label: "观察点",
          source: state.entryPoint.source,
          elevation_m: state.entryPoint.elevationM,
        },
        geometry: {
          type: "Point",
          coordinates: [state.entryPoint.lng, state.entryPoint.lat],
        },
      }
    : null;

  source.setData({
    type: "FeatureCollection",
    features: feature ? [feature] : [],
  });
}

function renderEntryPoint(point) {
  const elevationText = Number.isFinite(point.elevationM) ? `${point.elevationM} m` : "等待 DEM";
  const accuracyText = Number.isFinite(point.accuracyM) ? `±${point.accuracyM} m` : "未标注精度";
  const sourceText = ENTRY_SOURCE_LABELS[point.source] || point.source;
  const timeText = formatEntryTime(point.time);

  document.getElementById("sheet-title").textContent = "山中观察点";
  document.getElementById("detail-card").innerHTML = `
    <h2>观察点</h2>
    <p>经纬度 ${point.lng.toFixed(5)}, ${point.lat.toFixed(5)}。这是一个可分享、可回到的西湖山水视角入口。</p>
    <div class="meta-line">
      <span class="meta-pill">${sourceText}</span>
      <span class="meta-pill">海拔 ${elevationText}</span>
      <span class="meta-pill">${accuracyText}</span>
      <span class="meta-pill">${timeText}</span>
    </div>
    <div class="detail-actions">
      <button class="text-button" id="recenter-entry-btn" type="button">回到此点</button>
      <button class="text-button" id="share-entry-btn" type="button">分享入口</button>
    </div>
  `;

  document.getElementById("recenter-entry-btn")?.addEventListener("click", () => {
    moveToEntryPoint(point, { animate: true });
  });
  document.getElementById("share-entry-btn")?.addEventListener("click", shareEntryPoint);
}

function writeEntryPointToUrl(point) {
  const url = buildEntryPointUrl(point);
  window.history.replaceState(null, "", url);
}

function buildEntryPointUrl(point) {
  const url = new URL(window.location.href);
  url.hash = "";
  url.searchParams.set("lng", point.lng.toFixed(6));
  url.searchParams.set("lat", point.lat.toFixed(6));
  url.searchParams.set("source", point.source);
  url.searchParams.set("z", point.camera.zoom.toFixed(2));
  url.searchParams.set("pitch", Math.round(point.camera.pitch));
  url.searchParams.set("bearing", Math.round(point.camera.bearing));
  if (Number.isFinite(point.elevationM)) url.searchParams.set("ele", String(point.elevationM));
  url.searchParams.set("t", point.time);
  return url.toString();
}

function restoreEntryPointFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("lng") || !params.has("lat")) return;

  const lng = Number(params.get("lng"));
  const lat = Number(params.get("lat"));
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;

  setEntryPoint(
    {
      lng,
      lat,
      source: params.get("source") || "share",
      elevationM: params.has("ele") ? Number(params.get("ele")) : undefined,
      time: params.get("t") || undefined,
      zoom: Number(params.get("z")) || undefined,
      pitch: Number(params.get("pitch")) || undefined,
      bearing: Number(params.get("bearing")) || undefined,
    },
    { writeUrl: false },
  );

  window.setTimeout(() => {
    if (!state.entryPoint) return;
    moveToEntryPoint(state.entryPoint, { animate: false });
  }, 600);
}

async function shareEntryPoint() {
  if (!state.entryPoint) return;
  const url = buildEntryPointUrl(state.entryPoint);
  try {
    if (navigator.share) {
      await navigator.share({ title: "西湖山水观察点", url });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      flashCameraState("入口已复制");
    }
  } catch (_error) {
    flashCameraState("分享未完成");
  }
}

function flashCameraState(text) {
  const camera = document.getElementById("camera-state");
  if (!camera) return;
  const previous = camera.textContent;
  camera.textContent = text;
  window.setTimeout(() => {
    camera.textContent = previous;
  }, 1400);
}

function formatEntryTime(value) {
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch (_error) {
    return "此刻";
  }
}

function getFeatureCenter(feature) {
  if (feature.geometry.type === "Point") return feature.geometry.coordinates;
  if (feature.geometry.type === "LineString") {
    return feature.geometry.coordinates[Math.floor(feature.geometry.coordinates.length / 2)];
  }
  return WEST_LAKE_VIEW.center;
}

function kindLabel(kind) {
  const labels = {
    mountain: "山",
    temple: "寺",
    water: "水",
    view: "景",
    village: "村",
    route: "径",
    ridge: "脊",
    lakeside: "湖",
  };
  return labels[kind] || "点";
}

function updateCameraState() {
  const camera = document.getElementById("camera-state");
  if (!camera) return;
  camera.textContent = `${map.getZoom().toFixed(1)}z · ${Math.round(map.getPitch())}°`;
}

window.xihuDebug = { map, state, setEntryPoint, moveToEntryPoint };
globalThis.xihuDebug = window.xihuDebug;
