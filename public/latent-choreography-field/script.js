(function () {
  const canvas = document.getElementById("fieldCanvas");
  const heroStill = document.getElementById("heroStill");
  const phaseReadout = document.getElementById("phaseReadout");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    document.body.classList.add("static-hero");
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const params = new URLSearchParams(window.location.search);
  const lowPowerDevice =
    coarsePointer &&
    ((navigator.deviceMemory && navigator.deviceMemory <= 4) ||
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4));
  const staticMode = reduceMotion || params.has("static") || lowPowerDevice;

  const palette = {
    ink: "#080c0d",
    paper: "238, 231, 217",
    dim: "178, 171, 158",
    cyan: "103, 197, 196",
    amber: "213, 163, 63",
  };

  const state = {
    width: 1,
    height: 1,
    dpr: 1,
    start: performance.now(),
    particles: [],
    visible: true,
    running: false,
    lastFrame: 0,
    pointer: { x: -999, y: -999, active: false },
    phrase: "quiet drift",
    firstPaint: true,
  };

  const bones = [
    ["head", "neck"],
    ["neck", "spine"],
    ["neck", "lShoulder"],
    ["neck", "rShoulder"],
    ["lShoulder", "lElbow"],
    ["lElbow", "lHand"],
    ["rShoulder", "rElbow"],
    ["rElbow", "rHand"],
    ["spine", "lHip"],
    ["spine", "rHip"],
    ["lHip", "lKnee"],
    ["lKnee", "lFoot"],
    ["rHip", "rKnee"],
    ["rKnee", "rFoot"],
  ];

  const phraseFrames = [
    {
      head: [0.5, -0.42],
      neck: [0.5, -0.26],
      spine: [0.5, 0.02],
      lShoulder: [0.36, -0.22],
      rShoulder: [0.64, -0.22],
      lElbow: [0.22, -0.08],
      rElbow: [0.76, -0.46],
      lHand: [0.12, 0.12],
      rHand: [0.86, -0.64],
      lHip: [0.42, 0.18],
      rHip: [0.58, 0.18],
      lKnee: [0.32, 0.48],
      rKnee: [0.7, 0.48],
      lFoot: [0.22, 0.78],
      rFoot: [0.78, 0.78],
    },
    {
      head: [0.54, -0.42],
      neck: [0.52, -0.25],
      spine: [0.48, 0.02],
      lShoulder: [0.38, -0.22],
      rShoulder: [0.66, -0.2],
      lElbow: [0.28, -0.5],
      rElbow: [0.78, -0.04],
      lHand: [0.2, -0.66],
      rHand: [0.88, 0.16],
      lHip: [0.42, 0.18],
      rHip: [0.58, 0.18],
      lKnee: [0.28, 0.46],
      rKnee: [0.62, 0.54],
      lFoot: [0.18, 0.74],
      rFoot: [0.68, 0.84],
    },
    {
      head: [0.47, -0.43],
      neck: [0.48, -0.25],
      spine: [0.54, 0.02],
      lShoulder: [0.34, -0.17],
      rShoulder: [0.62, -0.25],
      lElbow: [0.22, 0.08],
      rElbow: [0.76, -0.28],
      lHand: [0.1, 0.24],
      rHand: [0.88, -0.44],
      lHip: [0.43, 0.18],
      rHip: [0.59, 0.18],
      lKnee: [0.44, 0.54],
      rKnee: [0.74, 0.42],
      lFoot: [0.38, 0.84],
      rFoot: [0.9, 0.62],
    },
    {
      head: [0.5, -0.44],
      neck: [0.5, -0.27],
      spine: [0.5, 0.02],
      lShoulder: [0.34, -0.25],
      rShoulder: [0.66, -0.25],
      lElbow: [0.18, -0.36],
      rElbow: [0.82, -0.36],
      lHand: [0.12, -0.58],
      rHand: [0.88, -0.58],
      lHip: [0.42, 0.18],
      rHip: [0.58, 0.18],
      lKnee: [0.36, 0.54],
      rKnee: [0.66, 0.54],
      lFoot: [0.28, 0.82],
      rFoot: [0.72, 0.82],
    },
  ];

  function mulberry32(seed) {
    return function seeded() {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (value) => {
    const x = clamp(value, 0, 1);
    return x * x * (3 - 2 * x);
  };

  function interpolateFrame(a, b, t) {
    const pose = {};
    for (const key of Object.keys(a)) {
      pose[key] = [
        lerp(a[key][0], b[key][0], t),
        lerp(a[key][1], b[key][1], t),
      ];
    }
    return pose;
  }

  function currentPose(cycle, offset = 0) {
    const phrase = (cycle * phraseFrames.length + offset + phraseFrames.length) % phraseFrames.length;
    const index = Math.floor(phrase);
    const next = (index + 1) % phraseFrames.length;
    return interpolateFrame(phraseFrames[index], phraseFrames[next], smooth(phrase - index));
  }

  function posePoint(point) {
    const w = state.width;
    const h = state.height;
    const isMobile = w < 720;
    const scale = Math.min(w, h) * (isMobile ? 0.64 : 0.58);
    const centerX = w * (isMobile ? 0.58 : 0.63);
    const centerY = h * (isMobile ? 0.55 : 0.5);
    return [centerX + (point[0] - 0.5) * scale, centerY + point[1] * scale];
  }

  function boneTarget(pose, boneIndex, t, normalOffset) {
    const [aName, bName] = bones[boneIndex % bones.length];
    const a = posePoint(pose[aName]);
    const b = posePoint(pose[bName]);
    const x = lerp(a[0], b[0], t);
    const y = lerp(a[1], b[1], t);
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const length = Math.hypot(dx, dy) || 1;
    const nx = -dy / length;
    const ny = dx / length;
    return [x + nx * normalOffset, y + ny * normalOffset];
  }

  function buildParticles() {
    const rand = mulberry32(8721);
    const area = state.width * state.height;
    const base = coarsePointer ? 2400 : 7600;
    const target = staticMode ? 2200 : Math.floor(area / (coarsePointer ? 220 : 148));
    const count = clamp(target, coarsePointer ? 1900 : base, coarsePointer ? 4200 : 10800);

    state.particles = Array.from({ length: count }, (_, id) => {
      const band = rand();
      const x = rand() * state.width;
      const y = rand() * state.height;
      return {
        id,
        x,
        y,
        homeX: x,
        homeY: y,
        vx: (rand() - 0.5) * 0.22,
        vy: (rand() - 0.5) * 0.22,
        seed: rand() * 1000,
        bone: Math.floor(rand() * bones.length),
        boneT: rand(),
        offset: (rand() - 0.5) * (band < 0.86 ? 18 : 62),
        affinity: band < 0.72 ? 1 : band < 0.91 ? 0.52 : 0.12,
        radius: 0.16 + rand() * (coarsePointer ? 0.72 : 0.52),
        alpha: 0.08 + rand() * 0.26,
        tone: rand() < 0.8 ? palette.paper : rand() < 0.93 ? palette.cyan : palette.amber,
      };
    });
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = Math.max(1, Math.floor(rect.width));
    state.height = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    buildParticles();
    state.firstPaint = true;
    if (staticMode && heroStill) document.body.classList.add("static-hero");
    render(performance.now(), true);
  }

  function flowAt(x, y, time, seed) {
    const w = state.width;
    const h = state.height;
    const sx = x / w;
    const sy = y / h;
    const curl =
      Math.sin(sy * 7.2 + time * 0.46 + seed * 0.01) +
      Math.cos(sx * 5.8 - time * 0.34 + seed * 0.013);
    const angle = curl * Math.PI * 0.48 + Math.sin(time * 0.12 + seed) * 0.18;
    const speed = 0.26 + 0.22 * Math.sin(time * 0.2 + seed);
    const current = 0.12 + 0.18 * Math.sin(sy * 2.6 + time * 0.24);
    return [Math.cos(angle) * speed + current, Math.sin(angle) * speed];
  }

  function drawAtmosphere(time, cycleData) {
    const w = state.width;
    const h = state.height;
    if (state.firstPaint || staticMode) {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = palette.ink;
      ctx.fillRect(0, 0, w, h);
      state.firstPaint = false;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(8, 12, 13, 0.18)";
      ctx.fillRect(0, 0, w, h);
    }

    const lightX = w * (0.58 + Math.sin(time * 0.05) * 0.1);
    const lightY = h * (0.24 + Math.cos(time * 0.04) * 0.05);
    const scanner = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, Math.max(w, h) * 0.72);
    scanner.addColorStop(0, `rgba(${palette.paper}, ${0.12 + cycleData.body * 0.04})`);
    scanner.addColorStop(0.26, `rgba(${palette.cyan}, ${0.07 + cycleData.body * 0.04})`);
    scanner.addColorStop(1, "rgba(8, 12, 13, 0)");
    ctx.fillStyle = scanner;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = `rgba(${palette.paper}, 0.16)`;
    ctx.lineWidth = 1;
    const gap = Math.max(72, Math.min(116, w / 14));
    const horizon = h * 0.58;
    for (let x = -gap; x < w + gap; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x + Math.sin(time * 0.12 + x) * 7, 0);
      ctx.lineTo(lerp(x, w * 0.58, 0.2), h);
      ctx.stroke();
    }
    for (let y = h * 0.2; y < h; y += gap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y + (y - horizon) * 0.06);
      ctx.stroke();
    }
    ctx.restore();
  }

  function cycleInfo(elapsed) {
    const loop = 22000;
    const raw = (elapsed % loop) / loop;
    const gather = smooth((raw - 0.12) / 0.2);
    const dissolve = smooth((raw - 0.72) / 0.16);
    const body = clamp(gather * (1 - dissolve), 0, 1);
    const phrase = raw < 0.24
      ? "drift"
      : raw < 0.42
        ? "gather"
        : raw < 0.72
          ? "dance"
          : "release";
    return { raw, body, dissolve, phrase };
  }

  function drawMotionHints(pose, prevPose, body) {
    if (body <= 0.02) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const [aName, bName] of bones) {
      const a = posePoint(pose[aName]);
      const b = posePoint(pose[bName]);
      const pa = posePoint(prevPose[aName]);
      const pb = posePoint(prevPose[bName]);
      ctx.strokeStyle = `rgba(${palette.paper}, ${0.035 * body})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pa[0], pa[1]);
      ctx.quadraticCurveTo((a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5, pb[0], pb[1]);
      ctx.stroke();

      ctx.strokeStyle = `rgba(${palette.cyan}, ${0.055 * body})`;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    }
    ctx.restore();
  }

  function updateParticles(time, cycleData, pose) {
    const w = state.width;
    const h = state.height;
    const pointerActive = state.pointer.active && !coarsePointer;
    const body = cycleData.body;

    for (const particle of state.particles) {
      const flow = flowAt(particle.x, particle.y, time, particle.seed);
      let dx = flow[0];
      let dy = flow[1];

      const target = boneTarget(pose, particle.bone, particle.boneT, particle.offset);
      const pull = body * particle.affinity * (0.022 + particle.radius * 0.004);
      dx += (target[0] - particle.x) * pull;
      dy += (target[1] - particle.y) * pull;

      if (pointerActive) {
        const px = state.pointer.x * w;
        const py = state.pointer.y * h;
        const vx = particle.x - px;
        const vy = particle.y - py;
        const dist = Math.hypot(vx, vy);
        if (dist < 180 && dist > 0.01) {
          const force = (1 - dist / 180) * 0.56;
          dx += (-vy / dist) * force;
          dy += (vx / dist) * force;
        }
      }

      particle.vx = particle.vx * 0.9 + dx * 0.1;
      particle.vy = particle.vy * 0.9 + dy * 0.1;
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -18) particle.x = w + 18;
      if (particle.x > w + 18) particle.x = -18;
      if (particle.y < -18) particle.y = h + 18;
      if (particle.y > h + 18) particle.y = -18;
    }
  }

  function drawParticles(time, body) {
    const isMobile = state.width < 720;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const particle of state.particles) {
      const shimmer = 0.72 + 0.28 * Math.sin(time * 1.8 + particle.seed);
      const alpha = particle.alpha * shimmer * (0.52 + body * 0.72);
      const r = particle.radius * (isMobile ? 1.08 : 1) * (1 + body * particle.affinity * 0.26);
      ctx.fillStyle = `rgba(${particle.tone}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawSoftContours(time, body) {
    const w = state.width;
    const h = state.height;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let c = 0; c < 5; c++) {
      ctx.lineWidth = 0.55 + c * 0.06;
      const tone = c === 3 ? palette.cyan : c === 4 ? palette.amber : palette.paper;
      ctx.strokeStyle = `rgba(${tone}, ${0.035 + body * 0.028})`;
      ctx.beginPath();
      for (let i = 0; i <= 190; i++) {
        const t = i / 190;
        const x = w * (0.04 + t * 0.66);
        const wave = Math.sin(t * Math.PI * (3.1 + c * 0.3) + time * (0.5 + c * 0.08)) * (8 + c * 5);
        const y = h * (0.58 + (c - 2) * 0.025) + wave + Math.sin(t * 7 + time * 0.22 + c) * 14;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function setPhrase(text) {
    if (!phaseReadout || text === state.phrase) return;
    state.phrase = text;
    phaseReadout.textContent = text;
  }

  function render(now, force = false) {
    const elapsed = staticMode ? 7800 : now - state.start;
    const time = elapsed / 1000;
    const cycleData = cycleInfo(elapsed);
    const cycle = cycleData.raw;
    const pose = currentPose(cycle * 1.35);
    const prevPose = currentPose(cycle * 1.35 - 0.16);

    setPhrase(cycleData.phrase);
    drawAtmosphere(time, cycleData);
    drawSoftContours(time, cycleData.body);
    drawMotionHints(pose, prevPose, cycleData.body);
    if (!staticMode || force) updateParticles(time, cycleData, pose);
    drawParticles(time, cycleData.body);
  }

  function loop(now) {
    if (!state.visible) {
      state.running = false;
      return;
    }
    const elapsed = now - state.start;
    const targetGap = elapsed < 12000 ? 1000 / 42 : 1000 / 28;
    if (now - state.lastFrame >= targetGap) {
      state.lastFrame = now;
      render(now);
    }
    window.requestAnimationFrame(loop);
  }

  function startLoop() {
    if (state.running || staticMode) return;
    state.running = true;
    window.requestAnimationFrame(loop);
  }

  function setupObserver() {
    if (!("IntersectionObserver" in window)) {
      startLoop();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        state.visible = entries[0].isIntersecting;
        if (state.visible) startLoop();
      },
      { rootMargin: "160px 0px 160px 0px", threshold: 0 },
    );
    observer.observe(document.getElementById("hero") || canvas);
  }

  function setupGsap() {
    if (!window.gsap) return;
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    gsap.defaults({ ease: "power3.out" });
    if (staticMode || reduceMotion) {
      gsap.set(".hero-title span, .reveal-line, .scroll-cue, .hero-readout", {
        autoAlpha: 1,
        y: 0,
      });
      gsap.set(".reveal, .paper-row", {
        autoAlpha: 1,
        y: 0,
        scale: 1,
      });
      return;
    }

    gsap.set(".hero-title span, .reveal-line, .scroll-cue, .hero-readout", {
      autoAlpha: 0,
      y: 18,
    });

    gsap.timeline({ defaults: { duration: 0.95 } })
      .to(".hero-title span", { autoAlpha: 1, y: 0 }, 2.8)
      .to(".reveal-line", { autoAlpha: 1, y: 0 }, 3.02)
      .to(".hero-readout", { autoAlpha: 1, y: 0 }, 3.18)
      .to(".scroll-cue", { autoAlpha: 1, y: 0 }, 3.32);

    if (ScrollTrigger) {
      gsap.to(".hero-content", {
        yPercent: -6,
        autoAlpha: 0.45,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "68% top",
          end: "bottom top",
          scrub: 0.8,
        },
      });

      ScrollTrigger.batch(".reveal, .paper-row", {
        start: "top 82%",
        once: true,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { autoAlpha: 0, y: 42, scale: 0.99 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: reduceMotion ? 0 : 0.82,
              stagger: 0.08,
              overwrite: true,
            },
          );
        },
      });
    }
  }

  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    state.pointer.x = (event.clientX - rect.left) / rect.width;
    state.pointer.y = (event.clientY - rect.top) / rect.height;
    state.pointer.active = true;
  }, { passive: true });

  canvas.addEventListener("pointerleave", () => {
    state.pointer.active = false;
  });

  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    state.visible = !document.hidden;
    if (state.visible) startLoop();
  });

  resize();
  setupGsap();
  setupObserver();
  if (staticMode) render(performance.now(), true);
})();
