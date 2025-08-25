// src/peers.js
import { INDEX_ROUTES } from './config.js';

/** Converte objetos arbitrários do backend para { name, lat, lon } */
export function normalizePeer(p) {
  const name = p.name;
  const lat = p.lat;
  const lon = p.lon;

  const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
  const lonNum = typeof lon === 'string' ? parseFloat(lon) : lon;
  if (!isFinite(latNum) || !isFinite(lonNum)) return null;

  return { name: String(name), lat: latNum, lon: lonNum };
}

async function fetchIndexRoutes() {
  const res = await fetch(INDEX_ROUTES, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao carregar index.routes');
  const json = await res.json();
  const dataUrl = json?.data;
  if (!dataUrl || typeof dataUrl !== 'string') {
    throw new Error('Campo "data" ausente ou inválido em index.routes');
  }
  return dataUrl;
}

/** Retorna uma lista normalizada de peers */
export async function loadPeers() {
  const dataUrl = await fetchIndexRoutes();

  // --- envia meu estado atual (name + lat/lon) ---
  try {
    const myName = (window.myNickname ?? '').toString().trim();
    const lat = Number(window.myPos?.lat);
    const lon = Number(window.myPos?.lon);

    const hasCoords = Number.isFinite(lat) && Number.isFinite(lon);
    if (myName && hasCoords) {
      await fetch(dataUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: myName,
          lat: lat.toString(),
          lon: lon.toString(),
        }),
      });
    }
  } catch (e) {
    // silencioso para não travar caso o backend não aceite POST
    // console.debug('POST self failed:', e);
  }

  // --- busca a lista atualizada ---
  const res = await fetch(dataUrl, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao carregar data URL do backend');

  const payload = await res.json();
  let list = Array.isArray(payload)
    ? payload
    : (payload?.results ?? payload?.users ?? payload?.data ?? []);

  if (!Array.isArray(list)) list = [];

  // normaliza e remove "eu" pelo name
  const normalized = list.map(normalizePeer).filter(Boolean);

  const me = (window.myNickname ?? '').toString().trim().toLowerCase();
  return me
    ? normalized.filter(p => (p.name ?? '').toString().trim().toLowerCase() !== me)
    : normalized;
}
