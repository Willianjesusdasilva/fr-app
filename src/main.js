// src/main.js
import { POLL_MS } from './config.js';
import { onStartClick, bindModal, showPanel, hidePanel, setStartBusy, setTripRunning, updateInfo, showModal } from './ui.js';
import { ensureMap, updateMyMarker, setPeers } from './map.js';
import { startGeolocation, stopGeolocation } from './geo.js';
import { loadPeers } from './peers.js';

let peersInterval = null;

function startTrip() {
  setStartBusy(true);
  showPanel();

  startGeolocation({
    onGood: (position) => {
      const { latitude, longitude, accuracy } = position.coords;

      updateInfo({ lat: latitude, lon: longitude, acc: accuracy, src: 'GPS (alta precisão)' });
      ensureMap(latitude, longitude);
      updateMyMarker(latitude, longitude, { pan: true });
      setTripRunning();

      // inicia / reinicia polling dos peers
      if (peersInterval) clearInterval(peersInterval);
      peersInterval = setInterval(fetchAndRenderPeers, POLL_MS);
      // primeira rodada imediata
      fetchAndRenderPeers().catch(() => {});
    },

    onImprecise: () => {
      // posição não confiável: parar watch e orientar usuário
      stopGeolocation();
      setStartBusy(false);
      updateInfo({ src: 'Impreciso (rede/IP)' });
      showModal();
      hidePanel();
    },

    onError: (error) => {
      setStartBusy(false);
      alertMsgFromGeoError(error);
      hidePanel();
    },
  });
}

async function fetchAndRenderPeers() {
  try {
    const peers = await loadPeers();
    setPeers(peers);
  } catch (_) {
    // silencioso; pode logar no console se quiser
    console.log('Peers fetch error:', _);
  }
}

function alertMsgFromGeoError(error) {
  if (!error) return;
  if (typeof error.code === 'number') {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        alert('Permissão negada. Habilite o acesso à localização.');
        return;
      case error.POSITION_UNAVAILABLE:
        alert('Localização indisponível no momento.');
        return;
      case error.TIMEOUT:
        alert('Tempo esgotado ao buscar localização.');
        return;
      default:
        alert('Erro desconhecido ao obter localização.');
        return;
    }
  }
  alert(error.message || 'Erro ao obter localização.');
}

// Ao sair da página, limpar watcher/polling
window.addEventListener('beforeunload', () => {
  stopGeolocation();
  if (peersInterval) clearInterval(peersInterval);
});

// Ligações de UI
onStartClick(startTrip);
bindModal(startTrip);
