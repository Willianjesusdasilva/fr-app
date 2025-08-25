import { TILE } from './config.js';

let map;
let myMarker;
let peersLayer;

// chave -> { circle, tooltip }
const peerMarkers = new Map();

/** Gera uma chave estável por nome + coordenadas (arredondadas) */
function peerKey(name, lat, lon) {
  const rLat = Number(lat).toFixed(5);
  const rLon = Number(lon).toFixed(5);
  return `${name}::${rLat},${rLon}`;
}

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

    // Label fixa sem seta (usa seu apelido, se existir)
    L.tooltip({
      permanent: true,
      direction: "center",
      className: "peer-label",
      offset: [0, -15]
    })
      .setContent(window.myNickname || "Você")
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

  // Gera chave por nome+coordenada (não precisamos de id)
  const key = peerKey(peer.name, peer.lat, peer.lon);
  const existing = peerMarkers.get(key);

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

  peerMarkers.set(key, { circle, tooltip });
}

function prunePeerMarkers(validKeys) {
  for (const [key, marker] of peerMarkers.entries()) {
    if (!validKeys.has(key)) {
      peersLayer.removeLayer(marker.circle);
      peersLayer.removeLayer(marker.tooltip);
      peerMarkers.delete(key);
    }
  }
}

export function setPeers(peers) {
  const seen = new Set();
  for (const p of peers) {
    // espera objetos { name, lat, lon } vindos do loader
    upsertPeerMarker(p);
    seen.add(peerKey(p.name, p.lat, p.lon));
  }
  prunePeerMarkers(seen);
}
