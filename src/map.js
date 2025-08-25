import { TILE } from './config.js';

let map;
let myMarker;
let peersLayer;
const peerMarkers = new Map();

// ========= MARCADOR DO USUÁRIO =========
export function ensureMap(lat, lon) {
  if (!map) {
    map = L.map('map', { zoomControl: true, attributionControl: true })
      .setView([lat, lon], 16);

    L.tileLayer(TILE.url, TILE.options).addTo(map);

    // Circulozinho azul pro "Você"
    myMarker = L.circleMarker([lat, lon], {
      radius: 7,
      fillColor: "#3399ff",
      color: "#0066cc",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9
    }).addTo(map);

    // Label fixa sem seta
    L.tooltip({
      permanent: true,
      direction: "center",
      className: "peer-label",
      offset: [0, -15]
    })
      .setContent("Você")
      .setLatLng([lat, lon])
      .addTo(map);

    peersLayer = L.layerGroup().addTo(map);
  } else {
    updateMyMarker(lat, lon, { pan: true });
  }
}

export function updateMyMarker(lat, lon, { pan = false } = {}) {
  if (!myMarker) return;
  myMarker.setLatLng([lat, lon]);
  if (pan && map) map.panTo([lat, lon]);
}

// ========= MARCADORES DE PEERS =========
function upsertPeerMarker(peer) {
  if (!peersLayer) return;

  const existing = peerMarkers.get(peer.id);
  if (existing) {
    existing.circle.setLatLng([peer.lat, peer.lon]);
    existing.tooltip.setLatLng([peer.lat, peer.lon]);
    existing.tooltip.setContent(peer.name);
    return;
  }

  // Ponto verde
  const circle = L.circleMarker([peer.lat, peer.lon], {
    radius: 6,
    fillColor: "#00ff00",
    color: "#009900",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.9
  }).addTo(peersLayer);

  // Nome fixo sem seta
  const tooltip = L.tooltip({
    permanent: true,
    direction: "center", // sem seta
    className: "peer-label",
    offset: [0, -15]
  })
    .setContent(peer.name)
    .setLatLng([peer.lat, peer.lon])
    .addTo(peersLayer);

  peerMarkers.set(peer.id, { circle, tooltip });
}

function prunePeerMarkers(validIds) {
  for (const [id, marker] of peerMarkers.entries()) {
    if (!validIds.has(id)) {
      peersLayer.removeLayer(marker.circle);
      peersLayer.removeLayer(marker.tooltip);
      peerMarkers.delete(id);
    }
  }
}

export function setPeers(peers) {
  const seen = new Set();
  for (const p of peers) {
    upsertPeerMarker(p);
    seen.add(p.id);
  }
  prunePeerMarkers(seen);
}
