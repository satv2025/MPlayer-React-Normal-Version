import React from 'react';
import { createRoot } from 'react-dom/client';
import VideoPlayer from './components/VideoPlayer';
import './styles.css';

function mount(elOrId, props = {}) {
  const target =
    typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;

  if (!target) {
    console.warn('mountVideoPlayer: target not found', elOrId);
    return null;
  }

  // Desmontar root previo si existía
  if (target.__vp_root) {
    target.__vp_root.unmount();
    target.__vp_root = null;
  }

  const root = createRoot(target);
  root.render(<VideoPlayer {...props} />);
  target.__vp_root = root;
  return root;
}

function unmount(elOrId) {
  const target =
    typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;

  if (!target || !target.__vp_root) return;

  target.__vp_root.unmount();
  target.__vp_root = null;
}

// Exponer globalmente para HTML estático
window.mountVideoPlayer = mount;
window.unmountVideoPlayer = unmount;

// Opcional: si querés un render inicial automático
document.addEventListener('DOMContentLoaded', () => {
  const playerDiv = document.getElementById('player');
  if (playerDiv) {
    mount(playerDiv, {
      src: 'https://solargentinotv.com.ar/assets/media/videos/Trailer%20SATV%20WEB%20BETA.mp4',
      poster: 'https://solargentinotv.com.ar/assets/media/images/poster.jpg',
    });
  }
});