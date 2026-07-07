/* Mounts the 8-bit Pizza Lab game (React). The game bundle expects a global
   React + html2canvas at module-eval time, so set those before the dynamic
   import evaluates the bundle.
   (OVEN RUSH — 450°, the one-button interlude, lives on in oven-rush.js.) */
import React from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';

window.React = React;
window.html2canvas = html2canvas;

export async function mountGame(el) {
  if (!el) return;
  const { default: PizzaGame } = await import('./game-bundle.jsx');
  createRoot(el).render(React.createElement(PizzaGame));
}
