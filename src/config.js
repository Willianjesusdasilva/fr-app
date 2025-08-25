// src/config.js
export const ACCURACY_LIMIT_METERS = 50000;

export const GEO_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
};

// Endpoints para pins de outros usuários
export const INDEX_ROUTES = 'https://willianjesusdasilva.github.io/fr-app/index.routes';

export const POLL_MS = 5000; // frequência para atualizar peers

// Tile estilo Waze noturno (Carto Dark)
export const TILE = {
  url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  options: {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20,
  },
};
