const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hero = document.getElementById("hero");
const nav = document.getElementById("nav");
const scrollCue = document.getElementById("scrollCue");
const headlineEl = document.getElementById("heroHeadline");
const sublineEl = document.getElementById("heroSubline");
const heroText = document.getElementById("heroText");
const heroCanvas = document.getElementById("asciiRiver");
const footerCanvas = document.getElementById("riverCanvas");
const frameInterval = 1000 / 40;

if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);

const heroState = {
  startedAt: performance.now(),
  reveal: prefersReduced ? 1 : 0,
  textDone: false,
  slideDone: false,
};

const headLine = "Intelligence that flows with you.";
const subLine = "River is building a new stack for personal AI.";

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function smooth(value) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function typeText(now) {
  if (!headlineEl || !sublineEl || !heroText) return;
  const elapsed = now - heroState.startedAt - 420;
  const headChars = Math.floor((elapsed - 180) / 34);
  const head = headLine.slice(0, clamp(headChars, 0, headLine.length));
  if (headlineEl.textContent !== head) headlineEl.textContent = head;
  headlineEl.classList.toggle("typing", head.length < headLine.length);

  const subStart = 180 + headLine.length * 34 + 300;
  const subChars = Math.floor((elapsed - subStart) / 28);
  const sub = subLine.slice(0, clamp(subChars, 0, subLine.length));
  if (sublineEl.textContent !== sub) sublineEl.textContent = sub;
  sublineEl.classList.toggle("cursor", sub.length > 0 && sub.length < subLine.length);

  if (elapsed > 0) heroText.style.opacity = "1";
  const slideStart = subStart + subLine.length * 28 + 380;
  const slide = smooth((elapsed - slideStart) / 1050);
  const canSlide = window.innerWidth >= 768;
  if (canSlide) {
    document.documentElement.style.setProperty("--hero-text-offset-x", `${(-2.5 * slide).toFixed(2)}vw`);
  } else if (slide > 0) {
    heroText.style.opacity = String(1 - slide);
  }

  if (slide >= 1 && !heroState.slideDone) {
    heroState.slideDone = true;
    document.body.classList.add("hero-cycle-done");
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function showChrome() {
  document.body.classList.remove("booting");
  document.body.classList.add("live");
  nav.classList.add("is-shown");
  scrollCue.classList.add("is-shown");
}

function updateNav() {
  nav.classList.toggle("scrolled", window.scrollY > window.innerHeight - 90);
  if (heroState.slideDone && heroText) {
    const fade = clamp01(1 - window.scrollY / (window.innerHeight * 0.42));
    heroText.style.opacity = String(fade);
  }
}

function initHeroCanvas() {
  const ctx = heroCanvas.getContext("2d", { alpha: false });
  const riverGlyphs = ".:;irsXA253hMHGS#9B&@";
  const canyonGlyphs = ".,:;irsXA253hMHGS#";
  const dustGlyphs = ".,:;irs";
  const riverParticles = [];
  const canyonParticles = [];
  const dustParticles = [];
  let width = 0;
  let height = 0;
  let cssWidth = 0;
  let cssHeight = 0;
  let dpr = 1;
  let lastDraw = 0;

  function frac(value) {
    return value - Math.floor(value);
  }

  function hash(seed) {
    return frac(Math.sin(seed * 127.1 + 311.7) * 43758.5453123);
  }

  function mix(a, b, t) {
    return a + (b - a) * t;
  }

  function rebuildParticles() {
    riverParticles.length = 0;
    canyonParticles.length = 0;
    dustParticles.length = 0;

    const area = cssWidth * cssHeight;
    const riverCount = clamp(Math.round(area / 280), 1800, 6200);
    const canyonCount = clamp(Math.round(area / 260), 2200, 7200);
    const dustCount = clamp(Math.round(area / 760), 700, 2600);

    for (let i = 0; i < riverCount; i += 1) {
      const spread = Math.pow(hash(i + 8.13), 0.62);
      const sign = hash(i + 91.7) > 0.5 ? 1 : -1;
      riverParticles.push({
        z: hash(i + 0.11),
        lane: sign * spread,
        wobble: hash(i + 17.2) * 2 - 1,
        seed: hash(i + 41.8),
        speed: mix(0.038, 0.088, hash(i + 5.4)),
      });
    }

    for (let i = 0; i < canyonCount; i += 1) {
      canyonParticles.push({
        z: hash(i + 2.51),
        side: hash(i + 33.9) > 0.5 ? 1 : -1,
        wall: Math.pow(hash(i + 10.7), 1.28),
        shelf: hash(i + 70.2),
        seed: hash(i + 4.6),
        speed: mix(0.006, 0.022, hash(i + 20.8)),
      });
    }

    for (let i = 0; i < dustCount; i += 1) {
      dustParticles.push({
        x: hash(i + 15.9),
        z: hash(i + 80.3),
        seed: hash(i + 62.1),
        speed: mix(0.004, 0.014, hash(i + 22.4)),
      });
    }
  }

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const rect = hero.getBoundingClientRect();
    cssWidth = rect.width;
    cssHeight = rect.height;
    width = Math.max(2, Math.round(rect.width * dpr));
    height = Math.max(2, Math.round(rect.height * dpr));
    heroCanvas.width = width;
    heroCanvas.height = height;
    heroCanvas.style.width = `${rect.width}px`;
    heroCanvas.style.height = `${rect.height}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    rebuildParticles();
  }

  function riverCenter(z, t) {
    return (
      0.5 +
      Math.sin(z * 6.5 - t * 0.16) * 0.045 +
      Math.sin(z * 15.5 + t * 0.07) * 0.018
    );
  }

  function project(z) {
    const horizon = height * 0.27;
    const v = Math.pow(clamp01(z), 1.54);
    return {
      v,
      y: horizon + v * height * 0.78,
      riverWidth: mix(width * 0.014, width * 0.168, Math.pow(v, 1.22)),
      wallSpan: mix(width * 0.11, width * 0.46, Math.pow(v, 1.08)),
      font: mix(5.4 * dpr, 10.6 * dpr, v),
    };
  }

  function glyphFrom(set, amount, seed, t) {
    const shimmer = Math.sin(t * 7 + seed * 19) * 0.5 + 0.5;
    const index = clamp(Math.floor((amount * 0.78 + shimmer * 0.22) * set.length), 0, set.length - 1);
    return set[index];
  }

  function fillBackdrop(t) {
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#113b86");
    sky.addColorStop(0.34, "#256a9b");
    sky.addColorStop(0.6, "#6ca6af");
    sky.addColorStop(1, "#123a82");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(width * 0.51, height * 0.48, 0, width * 0.51, height * 0.48, width * 0.58);
    glow.addColorStop(0, "rgba(210, 234, 219, 0.28)");
    glow.addColorStop(0.36, "rgba(151, 208, 207, 0.16)");
    glow.addColorStop(1, "rgba(17, 59, 134, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = 0.22 * heroState.reveal;
    ctx.strokeStyle = "rgba(214, 237, 222, 0.18)";
    ctx.lineWidth = 1 * dpr;
    for (let i = 0; i < 7; i += 1) {
      const z = i / 6;
      const p = project(mix(0.1, 0.98, z));
      const cx = riverCenter(z, t) * width;
      ctx.beginPath();
      ctx.moveTo(cx - p.riverWidth * 2.1 - p.wallSpan * 0.5, p.y);
      ctx.lineTo(cx - p.riverWidth * 1.25, p.y + 24 * dpr);
      ctx.moveTo(cx + p.riverWidth * 1.25, p.y + 24 * dpr);
      ctx.lineTo(cx + p.riverWidth * 2.1 + p.wallSpan * 0.5, p.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawEdgeLines(t) {
    ctx.save();
    ctx.lineCap = "round";
    for (const side of [-1, 1]) {
      ctx.beginPath();
      for (let i = 0; i <= 58; i += 1) {
        const z = i / 58;
        const p = project(z);
        const cx = riverCenter(z, t) * width;
        const edgeNoise = Math.sin(z * 35 + side * 2 + t * 0.32) * p.riverWidth * 0.06;
        const x = cx + side * (p.riverWidth + edgeNoise);
        if (i === 0) ctx.moveTo(x, p.y);
        else ctx.lineTo(x, p.y);
      }
      ctx.strokeStyle = `rgba(214, 237, 222, ${0.28 * heroState.reveal})`;
      ctx.lineWidth = 1.1 * dpr;
      ctx.stroke();

      ctx.beginPath();
      for (let i = 0; i <= 50; i += 1) {
        const z = i / 50;
        const p = project(z);
        const cx = riverCenter(z, t) * width;
        const x = cx + side * (p.riverWidth + p.wallSpan * 0.72);
        if (i === 0) ctx.moveTo(x, p.y - 14 * dpr);
        else ctx.lineTo(x, p.y - 14 * dpr);
      }
      ctx.strokeStyle = `rgba(18, 50, 112, ${0.24 * heroState.reveal})`;
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawDust(t) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const particle of dustParticles) {
      const z = frac(particle.z + t * particle.speed);
      const p = project(z);
      const center = riverCenter(z, t);
      const valleyGap = p.riverWidth / width + 0.06;
      const xNorm = particle.x < center ? mix(0.03, center - valleyGap, particle.x / Math.max(center, 0.01)) : mix(center + valleyGap, 0.97, (particle.x - center) / Math.max(1 - center, 0.01));
      const x = xNorm * width + Math.sin(t * 0.5 + particle.seed * 17) * 10 * dpr;
      const y = p.y - p.wallSpan * 0.18 + (particle.seed - 0.5) * p.wallSpan * 0.34;
      const fog = clamp01(1 - Math.abs(xNorm - center) * 1.8);
      ctx.font = `${Math.round(mix(4.5 * dpr, 8 * dpr, p.v))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.fillStyle = `rgba(194, 222, 220, ${heroState.reveal * mix(0.04, 0.14, fog)})`;
      ctx.fillText(glyphFrom(dustGlyphs, fog, particle.seed, t), x, y);
    }
    ctx.restore();
  }

  function drawCanyon(t) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const particle of canyonParticles) {
      const z = frac(particle.z + t * particle.speed);
      const p = project(z);
      const center = riverCenter(z, t);
      const shelf = Math.pow(particle.shelf, 1.8);
      const wall = p.riverWidth * mix(1.15, 1.52, shelf) + p.wallSpan * particle.wall;
      const stratum = Math.sin(z * 60 + particle.wall * 12 + particle.side * 0.8) * p.wallSpan * 0.02;
      const x = center * width + particle.side * (wall + stratum);
      const y = p.y - p.wallSpan * mix(0.02, 0.34, particle.wall) + Math.sin(particle.seed * 20 + t * 0.25) * 4 * dpr;
      if (x < -20 || x > width + 20 || y < 0 || y > height + 20) continue;
      const depth = smooth(p.v);
      const brightness = clamp01((1 - particle.wall * 0.58) * 0.72 + shelf * 0.22);
      const alpha = heroState.reveal * mix(0.08, 0.52, depth) * brightness;
      const r = Math.round(mix(122, 230, brightness));
      const g = Math.round(mix(168, 224, brightness));
      const b = Math.round(mix(180, 219, brightness));
      ctx.font = `${Math.round(p.font)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.fillText(glyphFrom(canyonGlyphs, brightness, particle.seed, t), x, y);
    }
    ctx.restore();
  }

  function drawRiver(t) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const particle of riverParticles) {
      const z = frac(particle.z + t * particle.speed);
      const p = project(z);
      const center = riverCenter(z, t);
      const lane = particle.lane * p.riverWidth * mix(0.34, 0.98, p.v);
      const braid = Math.sin(z * 54 + particle.seed * 16 - t * 6.4) * p.riverWidth * 0.1;
      const x = center * width + lane + braid + particle.wobble * p.riverWidth * 0.08;
      const y = p.y + Math.sin(t * 7 + particle.seed * 20) * p.font * 0.25;
      if (x < -20 || x > width + 20 || y < 0 || y > height + 20) continue;
      const laneCenter = 1 - clamp01(Math.abs(particle.lane));
      const streak = Math.sin(z * 90 - t * 10 + particle.seed * 9) * 0.5 + 0.5;
      const amount = clamp01(laneCenter * 0.58 + streak * 0.42);
      const alpha = heroState.reveal * mix(0.2, 0.86, amount) * mix(0.44, 1, p.v);
      ctx.font = `${Math.round(p.font * mix(0.86, 1.2, amount))}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.fillStyle = `rgba(${Math.round(mix(174, 236, amount))}, ${Math.round(mix(218, 248, amount))}, ${Math.round(mix(224, 255, amount))}, ${alpha})`;
      ctx.fillText(glyphFrom(riverGlyphs, amount, particle.seed, t), x, y);
    }
    ctx.restore();
  }

  function draw(now) {
    if (now - lastDraw < frameInterval) {
      requestAnimationFrame(draw);
      return;
    }
    lastDraw = now;

    const t = (now - heroState.startedAt) * 0.001;
    const revealStart = 3.0;
    heroState.reveal = prefersReduced ? 1 : smooth((now - heroState.startedAt - revealStart * 1000) / 1800);

    fillBackdrop(t);
    drawDust(t);
    drawCanyon(t);
    drawEdgeLines(t);
    drawRiver(t);

    typeText(now);
    if (now - heroState.startedAt > 1550) showChrome();
    requestAnimationFrame(draw);
  }

  size();
  window.addEventListener("resize", size);
  requestAnimationFrame(draw);
}

function initStack() {
  const viz = document.querySelector(".stack-viz");
  const scene = document.querySelector(".stack-scene");
  const layers = Array.from(document.querySelectorAll(".stack-layer"));
  const readout = document.getElementById("stackReadout");
  if (!viz || !scene || layers.length === 0) return;

  function activate(layer) {
    const index = layers.indexOf(layer);
    viz.classList.add("is-hovering");
    layers.forEach((item, itemIndex) => {
      item.classList.toggle("is-active", item === layer);
      item.style.setProperty("--k", String(itemIndex - index));
    });
    readout.textContent = layer.textContent.trim();
  }

  function reset() {
    viz.classList.remove("is-hovering");
    layers.forEach((item) => {
      item.classList.remove("is-active");
      item.style.setProperty("--k", "0");
    });
  }

  if (window.matchMedia("(hover: hover)").matches) {
    scene.addEventListener("pointerover", (event) => {
      const layer = event.target.closest(".stack-layer");
      if (layer) activate(layer);
    });
    scene.addEventListener("pointerleave", reset);
  }
}

function initFooterRiver() {
  const stage = document.getElementById("riverStage");
  const ctx = footerCanvas.getContext("2d");
  const ripples = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let lastDraw = 0;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const rect = stage.getBoundingClientRect();
    width = Math.max(2, Math.round(rect.width * dpr));
    height = Math.max(2, Math.round(rect.height * dpr));
    footerCanvas.width = width;
    footerCanvas.height = height;
    footerCanvas.style.width = `${rect.width}px`;
    footerCanvas.style.height = `${rect.height}px`;
  }

  function addRipple(event) {
    const rect = stage.getBoundingClientRect();
    ripples.push({
      x: (event.clientX - rect.left) * dpr,
      y: (event.clientY - rect.top) * dpr,
      born: performance.now(),
    });
  }

  function draw(now) {
    if (now - lastDraw < frameInterval) {
      requestAnimationFrame(draw);
      return;
    }
    lastDraw = now;

    ctx.clearRect(0, 0, width, height);
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "rgba(255,255,255,0.06)");
    grad.addColorStop(1, "rgba(132,198,207,0.18)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 1 * dpr;
    for (let y = 20 * dpr; y < height; y += 18 * dpr) {
      ctx.beginPath();
      for (let x = 0; x <= width; x += 16 * dpr) {
        const wave = Math.sin(x * 0.015 + y * 0.02 + now * 0.0014) * 7 * dpr;
        if (x === 0) ctx.moveTo(x, y + wave);
        else ctx.lineTo(x, y + wave);
      }
      ctx.strokeStyle = `rgba(255,255,255,${0.12 + (y / height) * 0.22})`;
      ctx.stroke();
    }

    for (let i = ripples.length - 1; i >= 0; i -= 1) {
      const age = now - ripples[i].born;
      const p = age / 1200;
      if (p > 1) {
        ripples.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(ripples[i].x, ripples[i].y, p * 170 * dpr, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${(1 - p) * 0.58})`;
      ctx.lineWidth = (1.5 + p * 2) * dpr;
      ctx.stroke();
    }

    requestAnimationFrame(draw);
  }

  size();
  stage.addEventListener("pointerdown", addRipple);
  window.addEventListener("resize", size);
  requestAnimationFrame(draw);
}

window.addEventListener("scroll", updateNav, { passive: true });

let snapTimer = 0;
window.addEventListener(
  "scroll",
  () => {
    if (prefersReduced || window.innerWidth < 900 || window.scrollY > window.innerHeight * 0.42) return;
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => {
      if (window.scrollY > 0 && window.scrollY < window.innerHeight * 0.36) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 900);
  },
  { passive: true },
);

initHeroCanvas();
initStack();
initFooterRiver();
