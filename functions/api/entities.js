export async function onRequestGet() {
  return Response.json({
    status: "ok",
    message: "Entity API placeholder. Static GeoJSON is used by the current prototype.",
  });
}
