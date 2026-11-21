// The supplied logo, parsed into parts for LogoMark, AssembledMark and Lockup (written by scripts/brand.py
// from brand/logo/logo.svg): cinetic:brand-supplied. Re-run brand.py to change it, never edit the paths.
import { type Logo, logoParts } from './Mark';

export const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path id="A" d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" fill="none" stroke="#1854B4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path id="B" d="M14 13.12c0 2.38 0 6.38-1 8.88" fill="none" stroke="#1854B4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path id="C" d="M17.29 21.02c.12-.6.43-2.3.5-3.02" fill="none" stroke="#1854B4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path id="D" d="M2 12a10 10 0 0 1 18-6" fill="none" stroke="#1854B4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path id="E" d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" fill="none" stroke="#1854B4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path id="F" d="M8.65 22c.21-.66.45-1.32.57-2" fill="none" stroke="#1854B4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path id="G" d="M9 6.8a6 6 0 0 1 9 5.2v2" fill="none" stroke="#1854B4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path id="H" d="M21.8 16c.2-2 .131-5.354 0-6" fill="none" stroke="#1854B4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const LOGO = logoParts(LOGO_SVG, { split: 'leaves' });
export const LOGO_PARTS = ["A", "B", "C", "D", "E", "F", "G", "H"];
export const WORDMARK_SVG: string | null = null;
export const WORDMARK: Logo | null = null;
/** A raster logo is placed whole; none here: the logo is vector. */
export const LOGO_RASTER: string | null = null;
