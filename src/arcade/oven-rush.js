/* OVEN RUSH — 450° · one-button arcade game.
   Pizzas slide into the wood-fired oven and bake fast. Pull each one out at
   the perfect moment (SPACE / tap). Perfect pulls build a combo multiplier,
   pineapple pizzas must be left to burn, golden pizzas bake extra fast for
   triple points. Three lives. Weekly best score wins a real pizza — the game
   over screen composes an Instagram DM with the score to claim it. */

const W = 960, H = 540;
const STORE_KEY = 'hypertobi_ovenrush_scores';
const VOUCHER_MIN = 1200; /* below this a #1 score doesn't unlock the claim */

/* ---------- tiny 8-bit synth ---------- */
let actx = null;
function tone(freq, type, dur, vol = 0.08, when = 0) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    const t0 = actx.currentTime + when;
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.00001, t0 + dur);
    osc.connect(gain); gain.connect(actx.destination);
    osc.start(t0); osc.stop(t0 + dur);
  } catch (e) { /* audio blocked — play silent */ }
}
const sfx = {
  pull: () => tone(500, 'square', 0.07),
  perfect: () => { tone(660, 'triangle', 0.09); tone(880, 'triangle', 0.12, 0.08, 0.07); tone(1320, 'triangle', 0.2, 0.07, 0.14); },
  good: () => { tone(520, 'triangle', 0.1); tone(660, 'triangle', 0.12, 0.06, 0.08); },
  bad: () => { tone(180, 'sawtooth', 0.25, 0.09); tone(120, 'sawtooth', 0.3, 0.08, 0.1); },
  bonus: () => { tone(784, 'square', 0.08); tone(988, 'square', 0.08, 0.07, 0.08); tone(1175, 'square', 0.16, 0.07, 0.16); },
  over: () => { tone(392, 'sawtooth', 0.2); tone(330, 'sawtooth', 0.2, 0.08, 0.18); tone(262, 'sawtooth', 0.4, 0.08, 0.36); },
  start: () => { tone(523, 'square', 0.08); tone(659, 'square', 0.08, 0.07, 0.09); tone(784, 'square', 0.15, 0.07, 0.18); },
};

/* ---------- highscores ---------- */
function loadScores() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch (e) { return []; }
}
function saveScores(list) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(list.slice(0, 5))); } catch (e) { /* private mode */ }
}

/* ---------- helpers ---------- */
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
function lerpColor(c1, c2, t) {
  return `rgb(${Math.round(lerp(c1[0], c2[0], t))},${Math.round(lerp(c1[1], c2[1], t))},${Math.round(lerp(c1[2], c2[2], t))})`;
}

export function mountOvenRush(el) {
  if (!el) return;
  el.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:relative;width:100%;max-width:960px;margin:0 auto;user-select:none';
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;display:block;border-radius:10px;cursor:pointer;touch-action:manipulation';
  wrap.appendChild(canvas);
  const overlay = document.createElement('div'); /* DOM game-over panel */
  overlay.style.cssText = 'position:absolute;inset:0;display:none;align-items:center;justify-content:center;padding:20px';
  wrap.appendChild(overlay);
  el.appendChild(wrap);

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  /* ---------- state ---------- */
  let mode = 'title';               /* title | play | over */
  let raf = 0, last = 0, t = 0;     /* time */
  let shake = 0;
  let score, lives, combo, served, best;
  let pizza = null;                 /* the active pizza */
  let gapTimer = 0;                 /* pause between pizzas */
  let popups = [];                  /* floating texts */
  let parts = [];                   /* particles */
  let smoke = [];
  best = loadScores()[0] ? loadScores()[0].s : 0;

  /* difficulty by pizzas served */
  const bakeTime = () => Math.max(1.15, 2.6 - served * 0.09);      /* s from raw to burnt threshold */
  const perfectWin = () => Math.max(0.055, 0.13 - served * 0.004); /* width of perfect zone */
  const gapTime = () => Math.max(0.25, 0.9 - served * 0.03);

  function newPizza() {
    let kind = 'normal';
    if (served >= 5 && Math.random() < 0.13) kind = 'pineapple';
    else if (served >= 8 && Math.random() < 0.09) kind = 'gold';
    const pw = perfectWin();
    pizza = {
      kind, p: 0,                              /* bake progress 0..1.1 */
      x: -140, y: 348,                         /* slides to oven center */
      state: 'enter',                          /* enter | bake | exit */
      exitVx: 0, exitVy: 0, exitRot: 0, rot: 0,
      speed: (kind === 'gold' ? 1.45 : 1) / bakeTime(),
      zonePerfect: [0.78 - pw / 2, 0.78 + pw / 2],
      zoneGood: [0.55, 0.78 + pw / 2 + 0.1],
      toppings: Array.from({ length: 7 }, () => ({ a: rnd(0, Math.PI * 2), r: rnd(8, 34) })),
    };
  }

  function startGame() {
    score = 0; lives = 3; combo = 1; served = 0;
    popups = []; parts = []; smoke = [];
    gapTimer = 0.4; pizza = null;
    overlay.style.display = 'none';
    mode = 'play';
    sfx.start();
  }

  function popup(txt, x, y, color, size = 26) {
    popups.push({ txt, x, y, color, size, life: 1 });
  }
  function burst(x, y, color, n = 14) {
    for (let i = 0; i < n; i++) {
      const a = rnd(0, Math.PI * 2), v = rnd(60, 260);
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, life: rnd(0.4, 0.8), color });
    }
  }

  function loseLife(msg, x, y) {
    lives--; combo = 1; shake = 12; sfx.bad();
    popup(msg, x, y, '#ff5544', 30);
    if (lives <= 0) endGame();
  }

  function pull() {
    if (!pizza || pizza.state !== 'bake') return;
    const { p, kind } = pizza;
    sfx.pull();
    pizza.state = 'exit';
    pizza.exitVx = rnd(520, 640); pizza.exitVy = rnd(-460, -360); pizza.exitRot = rnd(3, 7);
    const cx = 480, cy = 330;

    if (kind === 'pineapple') { loseLife('MAMMA MIA! NO PINEAPPLE!', cx, cy - 60); return; }
    if (p < pizza.zoneGood[0]) { loseLife('TROPPO CRUDA!', cx, cy - 60); return; }

    served++;
    const mult = kind === 'gold' ? 3 : 1;
    if (p >= pizza.zonePerfect[0] && p <= pizza.zonePerfect[1]) {
      const pts = 100 * combo * mult;
      score += pts;
      popup(kind === 'gold' ? `PERFETTO D'ORO! +${pts}` : `PERFETTO! +${pts}`, cx, cy - 60, kind === 'gold' ? '#ffd23e' : '#39ff14', 32);
      burst(cx, cy, kind === 'gold' ? '#ffd23e' : '#39ff14', 22);
      combo = Math.min(5, combo + 1);
      sfx.perfect();
    } else if (p <= pizza.zoneGood[1]) {
      const pts = 40 * mult;
      score += pts; combo = 1;
      popup(`BENE +${pts}`, cx, cy - 60, '#FAF4E8', 26);
      sfx.good();
    } else {
      const pts = 10;
      score += pts; combo = 1;
      popup('QUASI BRUCIATA… +10', cx, cy - 60, '#ff9a55', 24);
      sfx.good();
    }
  }

  function burnOut() { /* pizza reached burnt without being pulled */
    const cx = 480, cy = 330;
    if (pizza.kind === 'pineapple') {
      served++;
      const pts = 150;
      score += pts;
      popup(`GRAZIE! PINEAPPLE BURNED +${pts}`, cx, cy - 60, '#39ff14', 28);
      burst(cx, cy, '#ffd23e', 18);
      sfx.bonus();
      pizza.state = 'exit'; pizza.exitVx = 0; pizza.exitVy = 60; pizza.exitRot = 0;
    } else {
      for (let i = 0; i < 6; i++) smoke.push({ x: 480 + rnd(-40, 40), y: 320, r: rnd(8, 16), life: 1 });
      loseLife('BRUCIATA!', cx, cy - 60);
      pizza.state = 'exit'; pizza.exitVx = 0; pizza.exitVy = 100; pizza.exitRot = 1;
    }
  }

  /* ---------- game over + highscores + voucher claim (DOM) ---------- */
  function endGame() {
    mode = 'over';
    sfx.over();
    const scores = loadScores();
    const qualifies = scores.length < 5 || score > scores[scores.length - 1].s;
    const isTop = (scores.length === 0 || score > scores[0].s);
    best = Math.max(best, score);

    const retro = "font-family:'Press Start 2P',monospace";
    const box = document.createElement('div');
    box.style.cssText = 'background:#0a0a0aee;border:3px solid #E8402A;border-radius:16px;padding:26px 30px;max-width:520px;width:100%;color:#FAF4E8;text-align:center;box-shadow:0 0 40px rgba(232,64,42,.35)';
    box.innerHTML =
      `<div style="${retro};font-size:13px;color:#E8402A;margin-bottom:10px">GAME OVER</div>` +
      `<div style="${retro};font-size:26px;margin-bottom:4px">${score} PTS</div>` +
      `<div style="${retro};font-size:8px;color:#8a7f72;margin-bottom:16px">${served} PIZZAS SERVED</div>` +
      (qualifies
        ? `<div style="display:flex;gap:8px;justify-content:center;align-items:center;margin-bottom:14px">
             <input id="or-name" maxlength="3" placeholder="AAA" style="${retro};width:80px;text-align:center;font-size:14px;padding:8px;background:#161310;border:2px solid #E8402A;color:#FAF4E8;border-radius:6px;text-transform:uppercase">
             <button id="or-save" style="${retro};font-size:9px;padding:10px 14px;background:#E8402A;border:none;color:#fff;border-radius:6px;cursor:pointer">SAVE SCORE</button>
           </div>`
        : '') +
      `<div id="or-table" style="${retro};font-size:9px;line-height:2.2;color:#FAF4E8;margin-bottom:16px"></div>` +
      `<div id="or-claim"></div>` +
      `<button id="or-again" style="${retro};font-size:10px;padding:12px 20px;background:#39ff14;border:none;color:#0a0a0a;border-radius:6px;cursor:pointer">PLAY AGAIN ▸</button>`;
    overlay.innerHTML = '';
    overlay.appendChild(box);
    overlay.style.display = 'flex';

    const renderTable = () => {
      const list = loadScores();
      box.querySelector('#or-table').innerHTML =
        '<div style="color:#E8402A;margin-bottom:2px">— HIGH SCORES —</div>' +
        (list.length
          ? list.map((r, i) => `<div>${i + 1}. ${r.n} · ${r.s}</div>`).join('')
          : '<div style="color:#8a7f72">no scores yet</div>');
    };
    renderTable();

    /* voucher claim: only a NEW top score above the bar unlocks it */
    if (isTop && score >= VOUCHER_MIN) {
      const claim = box.querySelector('#or-claim');
      const msg = `Hi Tobi! \u{1F355}\u{1F525} New OVEN RUSH highscore: ${score} points (${served} pizzas). Screenshot attached — claiming my pizza voucher!`;
      claim.innerHTML =
        `<div style="border:2px dashed #ffd23e;border-radius:10px;padding:14px;margin-bottom:16px;background:rgba(255,210,62,.08)">
           <div style="${retro};font-size:10px;color:#ffd23e;margin-bottom:8px">\u{1F3C6} NEW #1 — WIN A REAL PIZZA</div>
           <div style="font-family:'Archivo',sans-serif;font-size:12.5px;line-height:1.55;color:#FAF4E8;margin-bottom:10px">
             Screenshot this screen and DM it to <b>@hypertobi</b> — the best score of the week gets a pizza voucher.
           </div>
           <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
             <button id="or-copy" style="${retro};font-size:8px;padding:9px 12px;background:#ffd23e;border:none;color:#0a0a0a;border-radius:6px;cursor:pointer">COPY DM TEXT</button>
             <a href="https://instagram.com/hypertobi" target="_blank" rel="noopener" style="${retro};font-size:8px;padding:9px 12px;background:#E8402A;color:#fff;border-radius:6px;text-decoration:none">OPEN INSTAGRAM ▸</a>
           </div>
         </div>`;
      claim.querySelector('#or-copy').addEventListener('click', (e) => {
        navigator.clipboard && navigator.clipboard.writeText(msg);
        e.target.textContent = 'COPIED!';
      });
    }

    if (qualifies) {
      const nameEl = box.querySelector('#or-name');
      const saveBtn = box.querySelector('#or-save');
      nameEl.focus();
      const save = () => {
        const n = (nameEl.value || 'TOB').toUpperCase().slice(0, 3);
        const list = loadScores();
        list.push({ n, s: score });
        list.sort((a, b) => b.s - a.s);
        saveScores(list);
        best = loadScores()[0].s;
        nameEl.disabled = true; saveBtn.disabled = true; saveBtn.textContent = 'SAVED';
        renderTable();
      };
      saveBtn.addEventListener('click', save);
      nameEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') save(); e.stopPropagation(); });
    }
    box.querySelector('#or-again').addEventListener('click', startGame);
  }

  /* ---------- update ---------- */
  function update(dt) {
    t += dt;
    shake = Math.max(0, shake - dt * 40);
    popups.forEach((p) => { p.life -= dt * 0.9; p.y -= dt * 46; });
    popups = popups.filter((p) => p.life > 0);
    parts.forEach((p) => { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt; });
    parts = parts.filter((p) => p.life > 0);
    smoke.forEach((s) => { s.life -= dt * 0.6; s.y -= dt * 55; s.r += dt * 14; });
    smoke = smoke.filter((s) => s.life > 0);

    if (mode !== 'play') return;

    if (!pizza) {
      gapTimer -= dt;
      if (gapTimer <= 0) newPizza();
      return;
    }
    const pz = pizza;
    if (pz.state === 'enter') {
      pz.x += dt * 900;
      if (pz.x >= 480) { pz.x = 480; pz.state = 'bake'; }
    } else if (pz.state === 'bake') {
      pz.p += dt * pz.speed;
      if (pz.p >= 1.08) burnOut();
    } else if (pz.state === 'exit') {
      pz.x += pz.exitVx * dt;
      pz.y += pz.exitVy * dt;
      pz.exitVy += 900 * dt;
      pz.rot += pz.exitRot * dt;
      if (pz.y > H + 160 || pz.x > W + 160) { pizza = null; gapTimer = gapTime(); }
    }
  }

  /* ---------- draw ---------- */
  function drawPizza(pz) {
    const { x, y, p, kind, rot } = pz;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    /* crust: raw dough -> golden -> charcoal */
    const cr = p < 0.78
      ? lerpColor([238, 214, 170], [226, 152, 60], clamp(p / 0.78, 0, 1))
      : lerpColor([226, 152, 60], [42, 32, 26], clamp((p - 0.78) / 0.3, 0, 1));
    ctx.fillStyle = cr;
    ctx.beginPath(); ctx.arc(0, 0, 58, 0, Math.PI * 2); ctx.fill();
    /* sauce + cheese */
    const sauce = p < 0.9 ? lerpColor([214, 60, 38], [150, 40, 26], clamp(p, 0, 1)) : lerpColor([150, 40, 26], [30, 24, 20], clamp((p - 0.9) / 0.2, 0, 1));
    ctx.fillStyle = sauce;
    ctx.beginPath(); ctx.arc(0, 0, 46, 0, Math.PI * 2); ctx.fill();
    const cheese = p < 0.9 ? lerpColor([248, 238, 200], [238, 190, 90], clamp(p, 0, 1)) : lerpColor([238, 190, 90], [50, 40, 30], clamp((p - 0.9) / 0.2, 0, 1));
    ctx.fillStyle = cheese;
    ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.fill();
    /* toppings */
    pz.toppings.forEach((tp, i) => {
      const tx = Math.cos(tp.a) * tp.r, ty = Math.sin(tp.a) * tp.r;
      if (kind === 'pineapple') {
        ctx.fillStyle = '#ffd23e';
        ctx.fillRect(tx - 5, ty - 5, 10, 10);
      } else if (kind === 'gold') {
        ctx.fillStyle = i % 2 ? '#ffd23e' : '#fff2b0';
        ctx.beginPath(); ctx.arc(tx, ty, 6, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = p > 1 ? '#33241c' : '#c92f22';
        ctx.beginPath(); ctx.arc(tx, ty, 7, 0, Math.PI * 2); ctx.fill();
      }
    });
    /* gold shimmer */
    if (kind === 'gold') {
      ctx.strokeStyle = `rgba(255,210,62,${0.5 + 0.5 * Math.sin(t * 8)})`;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0, 0, 62, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    if (shake > 0) ctx.translate(rnd(-shake, shake) * 0.5, rnd(-shake, shake) * 0.5);

    /* backdrop */
    ctx.fillStyle = '#121212';
    ctx.fillRect(-20, -20, W + 40, H + 40);
    /* floor */
    ctx.fillStyle = '#1c1712';
    ctx.fillRect(-20, 410, W + 40, 150);
    ctx.strokeStyle = '#2a241d'; ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(i * 90 - 10, 410); ctx.lineTo(i * 90 - 40, H); ctx.stroke(); }

    /* oven body */
    ctx.fillStyle = '#8a4a32';
    ctx.beginPath();
    ctx.moveTo(180, 410);
    ctx.quadraticCurveTo(180, 120, 480, 120);
    ctx.quadraticCurveTo(780, 120, 780, 410);
    ctx.closePath(); ctx.fill();
    /* brick lines */
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3;
    for (let r = 0; r < 4; r++) {
      ctx.beginPath();
      ctx.moveTo(210 + r * 12, 410);
      ctx.quadraticCurveTo(210 + r * 12, 150 + r * 26, 480, 150 + r * 26);
      ctx.quadraticCurveTo(750 - r * 12, 150 + r * 26, 750 - r * 12, 410);
      ctx.stroke();
    }
    /* mouth */
    ctx.fillStyle = '#0a0806';
    ctx.beginPath();
    ctx.moveTo(300, 410);
    ctx.quadraticCurveTo(300, 220, 480, 220);
    ctx.quadraticCurveTo(660, 220, 660, 410);
    ctx.closePath(); ctx.fill();
    /* flames */
    for (let i = 0; i < 7; i++) {
      const fx = 350 + i * 40;
      const fh = 34 + Math.sin(t * (6 + i)) * 12 + (pizza && pizza.state === 'bake' ? pizza.p * 26 : 0);
      ctx.fillStyle = i % 2 ? '#ff8c2e' : '#ffd23e';
      ctx.beginPath();
      ctx.moveTo(fx - 12, 408);
      ctx.quadraticCurveTo(fx, 408 - fh * 1.8, fx + 12, 408);
      ctx.closePath(); ctx.fill();
    }
    /* stone shelf */
    ctx.fillStyle = '#3a3128';
    ctx.fillRect(240, 400, 480, 18);

    /* pizza */
    if (pizza) drawPizza(pizza);

    /* smoke */
    smoke.forEach((s) => {
      ctx.fillStyle = `rgba(120,120,120,${s.life * 0.5})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    });
    /* particles */
    parts.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = clamp(p.life * 2, 0, 1);
      ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
      ctx.globalAlpha = 1;
    });

    /* signage */
    ctx.fillStyle = '#FAF4E8';
    ctx.font = "800 20px 'Bricolage Grotesque', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText('450°C', 480, 108);

    if (mode === 'play') {
      /* bake meter */
      const bx = 280, bw = 400, by = 60;
      ctx.fillStyle = '#161310';
      ctx.fillRect(bx - 4, by - 4, bw + 8, 26);
      const grad = ctx.createLinearGradient(bx, 0, bx + bw, 0);
      grad.addColorStop(0, '#7ac0ff'); grad.addColorStop(0.55, '#ffd23e');
      grad.addColorStop(0.78, '#39ff14'); grad.addColorStop(0.95, '#E8402A');
      ctx.fillStyle = grad;
      ctx.fillRect(bx, by, bw, 18);
      if (pizza && pizza.state !== 'exit') {
        /* perfect window marker */
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        const z0 = bx + pizza.zonePerfect[0] / 1.1 * bw, z1 = bx + pizza.zonePerfect[1] / 1.1 * bw;
        ctx.fillRect(z0, by - 6, 2, 30); ctx.fillRect(z1, by - 6, 2, 30);
        /* needle */
        const nx = bx + clamp(pizza.p / 1.1, 0, 1) * bw;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.moveTo(nx, by + 22); ctx.lineTo(nx - 7, by + 34); ctx.lineTo(nx + 7, by + 34); ctx.closePath(); ctx.fill();
        if (pizza.kind === 'pineapple') {
          ctx.fillStyle = '#ffd23e';
          ctx.font = "700 15px 'Archivo', sans-serif";
          ctx.fillText('🍍 PINEAPPLE — DO NOT PULL! LET IT BURN!', 480, 46);
        }
      }
      /* HUD */
      ctx.font = "12px 'Press Start 2P', monospace";
      ctx.textAlign = 'left';
      ctx.fillStyle = '#FAF4E8';
      ctx.fillText(`SCORE ${score}`, 24, 36);
      ctx.fillStyle = combo > 1 ? '#39ff14' : '#8a7f72';
      ctx.fillText(`COMBO x${combo}`, 24, 62);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#8a7f72';
      ctx.fillText(`BEST ${best}`, W - 24, 36);
      ctx.fillStyle = '#E8402A';
      ctx.fillText('🍕'.repeat(Math.max(0, lives)), W - 24, 64);
    }

    /* popups */
    popups.forEach((p) => {
      ctx.globalAlpha = clamp(p.life, 0, 1);
      ctx.fillStyle = p.color;
      ctx.font = `800 ${p.size}px 'Bricolage Grotesque', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(p.txt, p.x, p.y);
      ctx.globalAlpha = 1;
    });

    if (mode === 'title') {
      ctx.fillStyle = 'rgba(10,8,6,0.55)';
      ctx.fillRect(-20, -20, W + 40, H + 40);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#E8402A';
      ctx.font = "26px 'Press Start 2P', monospace";
      ctx.fillText('OVEN RUSH', 480, 175);
      ctx.fillStyle = '#ffd23e';
      ctx.font = "13px 'Press Start 2P', monospace";
      ctx.fillText('— 450° —', 480, 210);
      ctx.fillStyle = '#FAF4E8';
      ctx.font = "700 17px 'Archivo', sans-serif";
      ctx.fillText('Pull every pizza out at the perfect moment.', 480, 265);
      ctx.fillText('Perfect pulls build your combo. Never pull a pineapple pizza.', 480, 292);
      ctx.fillStyle = '#39ff14';
      ctx.font = "11px 'Press Start 2P', monospace";
      ctx.fillText(t % 1.2 < 0.7 ? '▸ PRESS SPACE / TAP TO COOK ◂' : '', 480, 350);
      ctx.fillStyle = '#ffd23e';
      ctx.font = "700 14px 'Archivo', sans-serif";
      ctx.fillText('🏆 Best score of the week wins a real pizza — details at game over.', 480, 395);
      if (best > 0) {
        ctx.fillStyle = '#8a7f72';
        ctx.font = "9px 'Press Start 2P', monospace";
        ctx.fillText(`BEST ${best}`, 480, 425);
      }
    }
    ctx.restore();
  }

  /* ---------- loop + input ---------- */
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    update(dt);
    draw();
    raf = requestAnimationFrame(frame);
  }

  function action() {
    if (mode === 'title') startGame();
    else if (mode === 'play') pull();
    /* 'over' handled by DOM buttons */
  }
  canvas.addEventListener('pointerdown', (e) => { e.preventDefault(); action(); });
  const keyHandler = (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
      /* don't steal keys while typing initials */
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
      e.preventDefault();
      action();
    }
  };
  window.addEventListener('keydown', keyHandler);

  /* manual test hook (only with ?rushdebug in the URL): jump to states */
  if (location.search.includes('rushdebug')) {
    window.__rush = {
      start: startGame,
      over: (s = 1500, sv = 14) => { if (mode !== 'play') startGame(); score = s; served = sv; endGame(); },
    };
  }

  raf = requestAnimationFrame(frame);
  return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', keyHandler); };
}
