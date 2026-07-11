/* Tile "peel" — rolls a home tile up like wrapping paper / an apple peel,
   revealing the photo underneath. Vanilla port of the prototype logic:
   html2canvas snapshot → 40 nested vertical segments, each rotated around its
   edge with a staggered GSAP timeline + an overall rotateX tilt. */
import { gsap } from 'gsap';
import html2canvas from 'html2canvas';
import { reducedMotion } from './intro.js';

const N = 40, A = 22.5;

function buildCurl(shot) {
  const w = shot.w / N;
  const leftDir = shot.dir === 'L';
  let inner = null;

  for (let i = N - 1; i >= 0; i--) {
    const Ai = A * (1 - 0.0085 * (N - 1 - i));
    const bgx = leftDir ? -(i * w) : -(shot.w - (i + 1) * w);

    const face = (back) => {
      const f = document.createElement('div');
      Object.assign(f.style, {
        position: 'absolute', top: '0', left: '0', right: '0', bottom: '0',
        backfaceVisibility: 'hidden',
        backgroundSize: shot.w + 'px ' + shot.h + 'px',
        backgroundPosition: bgx + 'px 0px',
        backgroundRepeat: 'no-repeat'
      });
      if (back) {
        f.style.transform = 'rotateY(180deg)';
        f.style.backgroundImage =
          'linear-gradient(rgba(250,244,232,0.93),rgba(250,244,232,0.93)), url(' + shot.url + ')';
      } else {
        f.style.backgroundImage = 'url(' + shot.url + ')';
      }
      return f;
    };

    const seg = document.createElement('div');
    Object.assign(seg.style, {
      position: 'absolute', top: '0', height: '100%',
      width: (w + 1) + 'px',
      transformStyle: 'preserve-3d',
      transformOrigin: leftDir ? 'left center' : 'right center',
      willChange: 'transform',
      backfaceVisibility: 'hidden'
    });
    seg.style[leftDir ? 'left' : 'right'] = (i === 0 ? 0 : w) + 'px';
    seg.dataset.seg = i;
    seg.dataset.a = (leftDir ? Ai : -Ai).toFixed(2);
    seg.appendChild(face(false));
    seg.appendChild(face(true));
    if (inner) seg.appendChild(inner);
    inner = seg;
  }

  const tilt = document.createElement('div');
  Object.assign(tilt.style, {
    position: 'absolute', top: '0', left: '0', right: '0', bottom: '0',
    transformStyle: 'preserve-3d',
    transformOrigin: leftDir ? 'left center' : 'right center'
  });
  tilt.dataset.tilt = '1';
  tilt.appendChild(inner);

  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    position: 'absolute', top: '0', left: '0', right: '0', bottom: '0',
    zIndex: '2', pointerEvents: 'none',
    perspective: '1600px', perspectiveOrigin: '50% 5%'
  });
  wrap.appendChild(tilt);
  return wrap;
}

function runCurl(state, curled, onDone) {
  const segs = state.curlNode.querySelectorAll('[data-seg]');
  const tiltEl = state.curlNode.querySelector('[data-tilt]');
  const leftDir = state.dir === 'L';
  gsap.to(segs, {
    rotationY: (i, t) => (curled ? parseFloat(t.getAttribute('data-a')) : 0),
    duration: 0.7,
    ease: 'power2.inOut',
    stagger: { each: 0.013, from: curled ? 'end' : 'start' },
    onComplete: () => { if (onDone) onDone(); }
  });
  if (tiltEl) gsap.to(tiltEl, {
    rotationX: curled ? -9 : 0,
    rotationZ: curled ? (leftDir ? -2.5 : 2.5) : 0,
    duration: 1.1, ease: 'power2.out'
  });
}

export function initPeel() {
  document.querySelectorAll('[data-peel]').forEach((tileWrap) => {
    const dir = tileWrap.getAttribute('data-peel') === 'R' ? 'R' : 'L';
    const face = tileWrap.querySelector('.tile-face');
    const target = face && face.firstElementChild;
    const corner = tileWrap.querySelector('.peel-corner');
    if (!face || !target || !corner) return;

    const state = { peeled: false, busy: false, curlNode: null, dir };

    const hideFace = () => { face.style.visibility = 'hidden'; face.style.pointerEvents = 'none'; };
    const showFace = () => { face.style.removeProperty('visibility'); face.style.removeProperty('pointer-events'); };

    /* keyboard: Enter/Space triggers the same peel */
    corner.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); corner.click(); }
    });
    corner.addEventListener('click', () => {
      if (state.busy) return;

      /* reduced motion: plain reveal/restore, no roll */
      if (reducedMotion()) {
        state.peeled = !state.peeled;
        state.peeled ? hideFace() : showFace();
        corner.title = state.peeled ? 'Roll it back' : 'Peel';
        return;
      }

      if (!state.peeled) {
        state.busy = true;
        const rect = target.getBoundingClientRect();
        html2canvas(target, { backgroundColor: null, scale: 1.25, logging: false }).then((canvas) => {
          const shot = { url: canvas.toDataURL('image/png'), w: rect.width, h: rect.height, dir };
          state.curlNode = buildCurl(shot);
          hideFace();
          tileWrap.insertBefore(state.curlNode, corner);
          /* let the browser fully paint the 40 segments before animating (2 frames + settle) */
          requestAnimationFrame(() => requestAnimationFrame(() => {
            setTimeout(() => {
              runCurl(state, true, () => {
                state.busy = false;
                state.peeled = true;
                corner.title = 'Roll it back';
              });
            }, 40);
          }));
        }).catch(() => { state.busy = false; });
      } else {
        state.busy = true;
        runCurl(state, false, () => {
          state.curlNode.remove();
          state.curlNode = null;
          showFace();
          state.busy = false;
          state.peeled = false;
          corner.title = 'Peel';
        });
      }
    });
  });
}
