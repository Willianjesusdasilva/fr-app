// src/geo.js
import { ACCURACY_LIMIT_METERS, GEO_OPTIONS } from './config.js';

let watchId = null;

/** Retorna true se a precisão for compatível com GPS */
export function isGpsQuality(position) {
  return position.coords.accuracy <= ACCURACY_LIMIT_METERS;
}

/**
 * Inicia o watchPosition e avisa via callbacks:
 * - onGood(position): posição com boa precisão (GPS)
 * - onImprecise(position): posição ruim (rede/IP)
 * - onError(error): erro do geolocation
 */
export function startGeolocation({ onGood, onImprecise, onError }) {
  if (!('geolocation' in navigator)) {
    onError?.(new Error('Geolocalização não suportada'));
    return;
  }
  stopGeolocation(); // evita duplicidade
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      if (isGpsQuality(pos)) onGood?.(pos);
      else onImprecise?.(pos);
    },
    (err) => onError?.(err),
    GEO_OPTIONS
  );
}

export function stopGeolocation() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}
