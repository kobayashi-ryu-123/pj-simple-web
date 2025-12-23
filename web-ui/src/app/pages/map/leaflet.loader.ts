export async function loadLeaflet() {
  const L = await import('leaflet');
  await import('leaflet.markercluster');
  return L;
}
