// src/peers.js
import { INDEX_ROUTES } from './config.js';

/** Converte objetos arbitrários do backend para { id, name, lat, lon } */
export function normalizePeer(p) {
  const name = p.name ?? p.nome ?? p.user ?? p.username ?? p.dono ?? null;
  const id   = p.id ?? name ?? null;

  const lat = p.lat ?? p.latitude ?? p.Latitude ?? p.LAT ?? p.y ?? null;
  const lon = p.lng ?? p.lon ?? p.longitude ?? p.Longitude ?? p.LNG ?? p.x ?? null;

  if (id == null || name == null || lat == null || lon == null) return null;

  const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
  const lonNum = typeof lon === 'string' ? parseFloat(lon) : lon;
  if (!isFinite(latNum) || !isFinite(lonNum)) return null;

  return { id: String(id), name: String(name), lat: latNum, lon: lonNum };
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
  const res = await fetch(dataUrl, { cache: 'no-store' });
  if (!res.ok) throw new Error('Falha ao carregar data URL do backend');

  const payload = await res.json();
  let list = Array.isArray(payload)
    ? payload
    : (payload?.results ?? payload?.users ?? payload?.data ?? []);

  if (!Array.isArray(list)) list = [];
  return list.map(normalizePeer).filter(Boolean);
}
