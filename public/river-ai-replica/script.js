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
    document.documentElement.style.setProperty("--hero-text-offset-x", `${(-12 * slide).toFixed(2)}vw`);
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
  const glyphs = " .,:;irsXA253hMHGS#9B&@";
  let width = 0;
  let height = 0;
  let dpr = 1;
  let lastDraw = 0;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const rect = hero.getBoundingClientRect();
    width = Math.max(2, Math.round(rect.width * dpr));
    height = Math.max(2, Math.round(rect.height * dpr));
    heroCanvas.width = width;
    heroCanvas.height = height;
    heroCanvas.style.width = `${rect.width}px`;
    heroCanvas.style.height = `${rect.height}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
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

    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#103b88");
    sky.addColorStop(0.48, "#5d99aa");
    sky.addColorStop(1, "#123c82");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    const cell = Math.max(9, Math.round(13 * dpr));
    ctx.font = `${Math.round(cell * 1.08)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let y = 0; y < height; y += cell) {
      const ny = y / height;
      const horizon = 0.42;
      const valley = Math.max(0, ny - horizon);
      for (let x = 0; x < width; x += cell) {
        const nx = x / width;
        const center = 0.5 + Math.sin(t * 0.28 + ny * 7) * 0.07;
        const riverWidth = 0.06 + valley * 0.32;
        const river = 1 - clamp01(Math.abs(nx - center) / riverWidth);
        const canyon = Math.abs(nx - center) - riverWidth;
        const ridge = Math.max(0, 1 - Math.abs(canyon) * 4.6) * valley;
        const flow = Math.sin((nx * 11 + ny * 46 - t * 4.2)) * 0.5 + 0.5;
        const mist = Math.sin((nx + ny) * 18 + t * 0.8) * 0.5 + 0.5;
        const intensity = clamp01((river * 0.74 + ridge * 0.58 + mist * 0.18) * heroState.reveal);
        if (intensity < 0.04 && ny < horizon + 0.04) continue;
        const gi = Math.floor(intensity * (glyphs.length - 1));
        const alpha = clamp01(intensity * 0.86 + river * 0.16);
        const hueMix = river * 0.8 + flow * 0.2;
        ctx.fillStyle = `rgba(${Math.round(156 - hueMix * 36)}, ${Math.round(208 + hueMix * 30)}, ${Math.round(218 + hueMix * 22)}, ${alpha})`;
        ctx.fillText(glyphs[gi], x + cell / 2, y + cell / 2);
      }
    }

    const glow = ctx.createRadialGradient(width * 0.53, height * 0.42, 0, width * 0.53, height * 0.42, width * 0.4);
    glow.addColorStop(0, `rgba(206, 233, 223, ${0.22 * heroState.reveal})`);
    glow.addColorStop(1, "rgba(206, 233, 223, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

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
