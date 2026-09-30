
import client from "./client";

export async function fetchSnapshots() {
  const { data } = await client.get("/snapshots");
  return data.snapshots;
}

export async function fetchSources() {
  const { data } = await client.get("/snapshots/sources");
  return data.sources;
}

export async function fetchLiveCatalogs() {
  const { data } = await client.get("/snapshots/live-catalogs");
  return data.catalogs;
}

export async function runSnapshotNow() {
  const { data } = await client.post("/snapshots/run");
  return data;
}

export function downloadUrl(filename) {
  const base = client.defaults.baseURL || "";
  return `${base}/snapshots/download/${encodeURIComponent(filename)}`;
}
