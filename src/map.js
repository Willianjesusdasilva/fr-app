// src/map.js
import { TILE } from './config.js';

let map;
let myMarker;
let peersLayer;
const peerMarkers = new Map(); // id -> marker

export function ensureMap(lat, lon) {
  if (!map) {
    map = L.map('map', { zoomControl: true, attributionControl: true })
      .setView([lat, lon], 16);

    L.tileLayer(TILE.url, TILE.options).addTo(map);

    myMarker = L.marker([lat, lon], { title: 'Você' })
      .addTo(map)
      .bindTooltip('Você', { permanent: true, direction: 'top', className: 'peer-label', offset: [0, -10] });

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

/** Atualiza/adiciona marcador de peer */
function upsertPeerMarker(peer) {
  if (!peersLayer) return;
  const existing = peerMarkers.get(peer.id);
  if (existing) {
    existing.setLatLng([peer.lat, peer.lon]);
    existing.setTooltipContent(peer.name);
    return;
  }
  const m = L.marker([peer.lat, peer.lon], { title: peer.name });
  m.addTo(peersLayer).bindTooltip(peer.name, {
    permanent: true, direction: 'top', className: 'peer-label', offset: [0, -10],
  });
  peerMarkers.set(peer.id, m);
}

/** Remove marcadores que não apareceram na última rodada */
function prunePeerMarkers(validIds) {
  for (const [id, marker] of peerMarkers.entries()) {
    if (!validIds.has(id)) {
      peersLayer.removeLayer(marker);
      peerMarkers.delete(id);
    }
  }
}

/** Recebe uma lista normalizada [{id,name,lat,lon}] e aplica no mapa */
export function setPeers(peers) {
  const seen = new Set();
  for (const p of peers) {
    upsertPeerMarker(p);
    seen.add(p.id);
  }
  prunePeerMarkers(seen);
}
