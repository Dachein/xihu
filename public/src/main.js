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

const state = {
  regions: null,
  entities: [],
  trails: [],
  selectedId: null,
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
  hash: true,
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

  ["entity-dots", "trail-line"].forEach((layer) => {
    map.on("mouseenter", layer, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", layer, () => {
      map.getCanvas().style.cursor = "";
    });
  });

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
      map.flyTo({
        center: [position.coords.longitude, position.coords.latitude],
        zoom: 15,
        pitch: 68,
        duration: 900,
      });
    });
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
