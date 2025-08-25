import { POLL_MS } from './config.js';
import {
  onStartClick, bindModal, showPanel, hidePanel,
  setStartBusy, setTripRunning, setStartIdle, updateInfo, showModal
} from './ui.js';
import { ensureMap, updateMyMarker, setPeers } from './map.js';
import { startGeolocation, stopGeolocation } from './geo.js';
import { loadPeers } from './peers.js';

let peersInterval = null;
window.myNickname = null; // 🌍 variável global

setStartIdle();

function startTrip() {
  // pega valor do input
  const nicknameInput = document.getElementById("nicknameInput");
  const nickname = nicknameInput.value.trim();

  if (!nickname) {
    alert("Digite seu apelido antes de iniciar!");
    nicknameInput.focus();
    return;
  }

  window.myNickname = nickname; // salva global
  console.log("Meu apelido é:", window.myNickname);

  setStartBusy(true);
  showPanel();

  startGeolocation({
    onGood: (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      updateInfo({ lat: latitude, lon: longitude, acc: accuracy, src: 'GPS (alta precisão)' });
      ensureMap(latitude, longitude);
      updateMyMarker(latitude, longitude, { pan: true });

      setTripRunning();

      if (peersInterval) clearInterval(peersInterval);
      peersInterval = setInterval(fetchAndRenderPeers, POLL_MS);
      fetchAndRenderPeers().catch(() => {});
    },

    onImprecise: () => {
      stopGeolocation();
      setStartIdle();
      updateInfo({ src: 'Impreciso (rede/IP)' });
      showModal();
      hidePanel();
    },

    onError: (error) => {
      setStartIdle();
      alertMsgFromGeoError(error);
      hidePanel();
    },
  });
}

async function fetchAndRenderPeers() {
  try {
    const peers = await loadPeers();
    setPeers(peers);
  } catch (_) {}
}

function alertMsgFromGeoError(error) {
  if (!error) return;
  if (typeof error.code === 'number') {
    switch (error.code) {
      case error.PERMISSION_DENIED: alert('Permissão negada. Habilite o acesso à localização.'); return;
      case error.POSITION_UNAVAILABLE: alert('Localização indisponível no momento.'); return;
      case error.TIMEOUT: alert('Tempo esgotado ao buscar localização.'); return;
      default: alert('Erro desconhecido ao obter localização.'); return;
    }
  }
  alert(error.message || 'Erro ao obter localização.');
}

window.addEventListener('beforeunload', () => {
  stopGeolocation();
  if (peersInterval) clearInterval(peersInterval);
});

onStartClick(startTrip);
bindModal(startTrip);
