const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "public, max-age=60",
};

const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "geolocation=(self)",
};

const DATA_ROUTES = new Map([
  ["/api/entities", "/data/cultural-entities.geojson"],
  ["/api/trails", "/data/trail-lines.geojson"],
  ["/api/regions", "/data/xihu-regions.geojson"],
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return withCommonHeaders(new Response(null, { status: 204 }));
    }

    if (url.pathname === "/api/health") {
      return json({
        ok: true,
        service: "xihu",
        runtime: "cloudflare-worker",
        map: "west-lake-mountain-river-atlas",
      });
    }

    if (DATA_ROUTES.has(url.pathname)) {
      return dataResponse(request, env, DATA_ROUTES.get(url.pathname));
    }

    const assetResponse = await env.ASSETS.fetch(request);
    return withCommonHeaders(assetResponse);
  },
};

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
