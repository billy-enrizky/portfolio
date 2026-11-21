// Local variable fonts, bundled with the film: no network at render time and every weight on
// the axis available. Browser-only (CSS imports and a style element), so only FontGate imports this file.
// opsz.css: weight and optical size, so every film size (32 px and up) takes Inter's display cut.
import { staticFile } from 'remotion';
import { fontFaceCss } from '../fx/TypePairs';

// The bundled faces (public/fonts, SIL OFL 1.1, licences in public/fonts/fonts.json): one @font-face per face and
// subset. A face downloads only when a line uses it, so registering all of them costs nothing at render time.
if (typeof document !== 'undefined' && !document.getElementById('cinetic-faces')) {
  const el = document.createElement('style');
  el.id = 'cinetic-faces';
  el.textContent = fontFaceCss((p) => staticFile(p));
  document.head.appendChild(el);
}
import './fonts/geist/index.css'; // Geist Variable (text), vendored: scripts/add-font.mjs
import './fonts/geist-mono/index.css'; // Geist Mono Variable (mono), vendored: scripts/add-font.mjs
