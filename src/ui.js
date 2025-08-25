// src/ui.js
const els = {
  startBtn: document.getElementById('startBtn'),
  panel: document.getElementById('panel'),
  infoBox: document.getElementById('info'),
  lat: document.getElementById('lat'),
  lon: document.getElementById('lon'),
  acc: document.getElementById('acc'),
  src: document.getElementById('src'),
  modalWrap: document.getElementById('modalWrap'),
  closeModal: document.getElementById('closeModal'),
  retryModal: document.getElementById('retryModal'),
};

export function onStartClick(handler) {
  els.startBtn.addEventListener('click', handler);
}

export function bindModal(onRetry) {
  els.closeModal.addEventListener('click', hideModal);
  els.retryModal.addEventListener('click', () => {
    hideModal();
    onRetry();
  });
}

export function showPanel() {
  els.panel.style.display = 'block';
  els.infoBox.style.display = 'grid';
}

export function hidePanel() {
  els.panel.style.display = 'none';
  els.infoBox.style.display = 'none';
}

export function setStartBusy(busy, textWhenBusy = 'Buscando sinal de GPS...', textIdle = 'Iniciar TRIP') {
  els.startBtn.disabled = !!busy;
  els.startBtn.textContent = busy ? textWhenBusy : textIdle;
}

export function setTripRunning() {
  els.startBtn.textContent = 'TRIP em andamento';
}

export function updateInfo({ lat, lon, acc, src }) {
  if (typeof lat === 'number') els.lat.textContent = lat.toFixed(6);
  if (typeof lon === 'number') els.lon.textContent = lon.toFixed(6);
  if (typeof acc === 'number') els.acc.textContent = `${Math.round(acc)} m`;
  if (typeof src === 'string') els.src.textContent = src;
}

export function showModal() {
  els.modalWrap.style.display = 'flex';
}

export function hideModal() {
  els.modalWrap.style.display = 'none';
}
