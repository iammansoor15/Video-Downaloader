/**
 * Single source of truth for the Stream Save logo mark.
 *
 * The mark fuses three ideas: a ring + play triangle (stream) whose bottom
 * tapers into a download arrow (save). It is drawn in a violet/purple gradient
 * so it reads well on the app's dark theme. Re-used as the browser tab icon
 * (`app/icon.svg`), the Apple touch icon, the OG image, and the in-app logo.
 */
export const LOGO_MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><defs><linearGradient id="ss-mark" x1="14" y1="8" x2="50" y2="58" gradientUnits="userSpaceOnUse"><stop stop-color="#c4b5fd"/><stop offset="0.5" stop-color="#8b5cf6"/><stop offset="1" stop-color="#6d28d9"/></linearGradient></defs><circle cx="32" cy="25" r="15.5" stroke="url(#ss-mark)" stroke-width="6"/><path d="M27.5 17 L27.5 33 L42 25 Z" fill="url(#ss-mark)" stroke="url(#ss-mark)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M29 37 h6 v10 h6 L32 58 L23 47 h6 v-10 z" fill="url(#ss-mark)" stroke="url(#ss-mark)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/></svg>`;

/** The mark as an inline data URI — usable in `<img>` and `next/og` Satori. */
export const LOGO_MARK_DATA_URI = `data:image/svg+xml,${encodeURIComponent(
  LOGO_MARK_SVG,
)}`;
