import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // tu componente principal
import './styles.css';

// Exponer el componente por si querés usarlo directamente desde HTML
window.App = App;

/**
 * mountApp(elOrId, props)
 * - elOrId: elemento DOM o id string
 * - props: props que recibe <App />
 */
window.mountApp = function mountApp(elOrId, props = {}) {
  const target = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
  if (!target) {
    console.warn('mountApp: target not found', elOrId);
    return null;
  }

  // Si ya había un root previo, desmontarlo
  if (target.__app_root) {
    try {
      target.__app_root.unmount();
    } catch (e) {}
    target.__app_root = null;
  }

  // React 18 createRoot
  const root = createRoot(target);
  root.render(<App {...props} />);
  target.__app_root = root;
  return root;
};

window.unmountApp = function unmountApp(elOrId) {
  const target = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
  if (!target || !target.__app_root) return;
  try {
    target.__app_root.unmount();
  } catch (e) {
    console.warn('Error unmounting app', e);
  }
  target.__app_root = null;
};

// Montaje automático si existe <div id="root">
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('root');
  if (el) {
    window.mountApp(el);
  }
});