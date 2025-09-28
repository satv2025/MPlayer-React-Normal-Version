import React from 'react';
import { createRoot } from 'react-dom/client';
import VideoPlayer from './components/VideoPlayer';
import './styles.css';

// Exponer función global para montar el player
window.mountVideoPlayer = function mountVideoPlayer(elOrId, props = {}) {
  const target = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
  if (!target) {
    console.warn('mountVideoPlayer: target not found', elOrId);
    return null;
  }

  // Si ya había un root previo, desmontarlo
  if (target.__vp_root) {
    try {
      target.__vp_root.unmount();
    } catch (e) {}
    target.__vp_root = null;
  }

  const root = createRoot(target);
  root.render(<VideoPlayer {...props} />);
  target.__vp_root = root;
  return root;
};

window.unmountVideoPlayer = function unmountVideoPlayer(elOrId) {
  const target = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
  if (!target || !target.__vp_root) return;
  try {
    target.__vp_root.unmount();
  } catch (e) {
    console.warn('Error unmounting VideoPlayer', e);
  }
  target.__vp_root = null;
};