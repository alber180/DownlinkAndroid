import { createWaveBackground } from './homepage-background.js';

export function initializeHomepage() {
  const spotlight = document.querySelector('[data-home-spotlight]');
  const inputSurface = document.querySelector('[data-input-surface]');
  const glintOutlines = inputSurface?.querySelectorAll('.home-controls__edge-glint rect');
  const resultsPanel = document.querySelector('.results-panel');
  const background = createWaveBackground(document.querySelector('.home-background-canvas'));
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const listeners = [];
  let enabled = false;
  let sceneInteractive = false;
  let frame = null;
  let ambientPointer = null;

  function syncGlintRadius() {
    if (!inputSurface || !glintOutlines?.length) return;
    // SVG clamps each radius independently, so use the height for both axes.
    const radius = Math.max(0, (inputSurface.getBoundingClientRect().height - 2) / 2);
    glintOutlines.forEach(outline => {
      outline.setAttribute('rx', String(radius));
      outline.setAttribute('ry', String(radius));
    });
  }

  function listen(target, event, handler) {
    if (!target) return;
    target.addEventListener(event, handler, { passive: true });
    listeners.push(() => target.removeEventListener(event, handler));
  }

  function reset() {
    if (frame !== null) window.cancelAnimationFrame(frame);
    frame = null;
    ambientPointer = null;
    background.clearPointer();
    ['--ambient-x', '--ambient-y', '--ambient-shift-x', '--ambient-shift-y']
      .forEach(property => spotlight?.style.removeProperty(property));
  }

  function paint() {
    frame = null;
    if (!enabled) return;

    if (spotlight && ambientPointer) {
      const x = ambientPointer.x / Math.max(window.innerWidth, 1);
      const y = ambientPointer.y / Math.max(window.innerHeight, 1);
      spotlight.style.setProperty('--ambient-x', `${(x * 100).toFixed(2)}%`);
      spotlight.style.setProperty('--ambient-y', `${(y * 100).toFixed(2)}%`);
      spotlight.style.setProperty('--ambient-shift-x', `${((x - 0.5) * 12).toFixed(2)}px`);
      spotlight.style.setProperty('--ambient-shift-y', `${((y - 0.5) * 12).toFixed(2)}px`);
    }
  }

  function schedulePaint() {
    if (frame === null) frame = window.requestAnimationFrame(paint);
  }

  function syncMotion() {
    const active = !document.hidden
      && !document.body.classList.contains('has-video')
      && !resultsPanel?.classList.contains('visible');
    sceneInteractive = active && !reducedMotion.matches;
    enabled = finePointer.matches && sceneInteractive;
    if (!enabled) reset();
    background.setReducedMotion(reducedMotion.matches);
    background.setActive(active);
  }

  listen(window, 'pointermove', event => {
    if (sceneInteractive && event.isPrimary !== false) {
      background.setPointer(event.clientX, event.clientY);
    }
    if (!enabled || !spotlight || event.pointerType === 'touch') return;
    ambientPointer = { x: event.clientX, y: event.clientY };
    schedulePaint();
  });
  listen(window, 'pointerdown', event => {
    if (sceneInteractive && event.isPrimary !== false) {
      background.setPointer(event.clientX, event.clientY);
    }
  });
  listen(window, 'pointerup', event => {
    if (event.pointerType === 'touch') background.clearPointer();
  });
  listen(window, 'pointercancel', () => background.clearPointer());
  listen(document.documentElement, 'pointerleave', reset);
  listen(window, 'blur', reset);
  listen(window, 'resize', () => {
    reset();
    background.resize();
  });
  listen(document, 'visibilitychange', syncMotion);
  listen(finePointer, 'change', syncMotion);
  listen(reducedMotion, 'change', syncMotion);

  const observer = new MutationObserver(syncMotion);
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  if (resultsPanel) observer.observe(resultsPanel, { attributes: true, attributeFilter: ['class'] });
  const glintResizeObserver = new ResizeObserver(syncGlintRadius);
  if (inputSurface) glintResizeObserver.observe(inputSurface);
  syncGlintRadius();
  syncMotion();

  return () => {
    enabled = false;
    listeners.forEach(remove => remove());
    observer.disconnect();
    glintResizeObserver.disconnect();
    reset();
    background.destroy();
  };
}
