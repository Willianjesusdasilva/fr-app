// map.js
import { TILE } from './config.js';

let map;
let myMarker;
let peersLayer;

/** name -> marker */
const peerMarkers = new Map();

/**
 * Cria o mapa (se ainda não existir) e posiciona o marcador "Você".
 * Se já existir, só atualiza sua posição (com pan opcional).
 */
export function ensureMap(lat, lon) {
  if (!map) {
    map = L.map('map', { zoomControl: true, attributionControl: true })
      .setView([lat, lon], 16);

    L.tileLayer(TILE.url, TILE.options).addTo(map);

    myMarker = L.marker([lat, lon], { title: 'Você' })
      .addTo(map)
      .bindTooltip('Você', {
        permanent: true,
        direction: 'top',
        className: 'peer-label',
        offset: [0, -10],
      });

    peersLayer = L.layerGroup().addTo(map);
  } else {
    updateMyMarker(lat, lon, { pan: true });
  }
}

/**
 * Atualiza a posição do seu marcador.
 * @param {number} lat
 * @param {number} lon
 * @param {{pan?: boolean}} opts
 */
export function updateMyMarker(lat, lon, { pan = false } = {}) {
  if (!myMarker) return;
  myMarker.setLatLng([lat, lon]);
  if (pan && map) map.panTo([lat, lon]);
}

/**
 * Atualiza/adiciona marcador de peer pelo 'name' (sem usar id).
 * @param {{name: string, lat: number, lon: number}} peer
 */
function upsertPeerMarker(peer) {
  if (!peersLayer) return;
  const key = peer.name;
  const existing = peerMarkers.get(key);

  if (existing) {
    existing.setLatLng([peer.lat, peer.lon]);
    existing.setTooltipContent(peer.name);
    return;
  }

  const m = L.marker([peer.lat, peer.lon], { title: peer.name });
  m.addTo(peersLayer).bindTooltip(peer.name, {
    permanent: true,
    direction: 'top',
    className: 'peer-label',
    offset: [0, -10],
  });
  peerMarkers.set(key, m);
}

/**
 * Remove marcadores cujos 'name' não vieram na última atualização.
 * @param {Set<string>} validNames
 */
function prunePeerMarkers(validNames) {
  for (const [name, marker] of peerMarkers.entries()) {
    if (!validNames.has(name)) {
      peersLayer.removeLayer(marker);
      peerMarkers.delete(name);
    }
  }
}

/**
 * Recebe uma lista normalizada [{name, lat, lon}] e aplica no mapa.
 * Se houver nomes duplicados no array, o último prevalece nesse ciclo.
 * @param {Array<{name: string, lat: number, lon: number}>} peers
 */
export function setPeers(peers) {
  const seen = new Set();
  for (const p of peers) {
    upsertPeerMarker(p);
    seen.add(p.name);
  }
  prunePeerMarkers(seen);
}
