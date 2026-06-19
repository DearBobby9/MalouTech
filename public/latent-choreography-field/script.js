(function () {
  const canvas = document.getElementById("fieldCanvas");
  const heroStill = document.getElementById("heroStill");
  const phaseReadout = document.getElementById("phaseReadout");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  if (!ctx) {
    document.body.classList.add("static-hero");
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const params = new URLSearchParams(window.location.search);
  const hardwareLow =
    (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  const staticMode = reduceMotion || params.has("static");
  const requestedQuality = params.get("quality");
  const qualityName = requestedQuality === "high"
    ? "high"
    : requestedQuality === "low" || hardwareLow
      ? "low"
      : "smooth";

  const profiles = {
    low: {
      dprCap: 1,
      motionCount: 360,
      logoCount: 180,
      logoSampleCount: 560,
      fps: 50,
      cv: false,
      gridGap: 150,
    },
    smooth: {
      dprCap: 1,
      motionCount: 620,
      logoCount: 320,
      logoSampleCount: 900,
      fps: 60,
      cv: true,
      gridGap: 128,
    },
    high: {
      dprCap: 1.15,
      motionCount: 920,
      logoCount: 480,
      logoSampleCount: 1300,
      fps: 60,
      cv: true,
      gridGap: 112,
    },
  };
  const profile = profiles[qualityName];

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
    visible: true,
    running: false,
    firstPaint: true,
    lastFrame: 0,
    lastDelta: 16.7,
    slowFrames: 0,
    motionLimit: profile.motionCount,
    logoTargets: [],
    motionParticles: [],
    logoParticles: [],
    phrase: "dance",
    resizeTimer: 0,
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

  const landmarkKeys = [
    "head",
    "neck",
    "spine",
    "lShoulder",
    "rShoulder",
    "lElbow",
    "rElbow",
    "lHand",
    "rHand",
    "lHip",
    "rHip",
    "lKnee",
    "rKnee",
    "lFoot",
    "rFoot",
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
    {
      head: [0.44, -0.46],
      neck: [0.47, -0.28],
      spine: [0.54, 0.02],
      lShoulder: [0.32, -0.18],
      rShoulder: [0.64, -0.29],
      lElbow: [0.14, -0.02],
      rElbow: [0.74, -0.58],
      lHand: [0.04, 0.16],
      rHand: [0.8, -0.76],
      lHip: [0.43, 0.18],
      rHip: [0.6, 0.16],
      lKnee: [0.34, 0.58],
      rKnee: [0.84, 0.34],
      lFoot: [0.24, 0.86],
      rFoot: [0.98, 0.46],
    },
    {
      head: [0.56, -0.4],
      neck: [0.55, -0.23],
      spine: [0.48, 0.06],
      lShoulder: [0.4, -0.19],
      rShoulder: [0.7, -0.14],
      lElbow: [0.22, -0.44],
      rElbow: [0.86, 0.04],
      lHand: [0.1, -0.62],
      rHand: [0.94, 0.24],
      lHip: [0.42, 0.2],
      rHip: [0.58, 0.22],
      lKnee: [0.2, 0.42],
      rKnee: [0.56, 0.62],
      lFoot: [0.06, 0.62],
      rFoot: [0.48, 0.9],
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

  const rand = mulberry32(1947);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (value) => {
    const x = clamp(value, 0, 1);
    return x * x * (3 - 2 * x);
  };

  function currentPose(cycle) {
    const phrase = (cycle * phraseFrames.length + phraseFrames.length) % phraseFrames.length;
    const index = Math.floor(phrase);
    const next = (index + 1) % phraseFrames.length;
    const t = smooth(phrase - index);
    const pose = {};
    for (const key of Object.keys(phraseFrames[index])) {
      pose[key] = [
        lerp(phraseFrames[index][key][0], phraseFrames[next][key][0], t),
        lerp(phraseFrames[index][key][1], phraseFrames[next][key][1], t),
      ];
    }
    return pose;
  }

  function posePoint(point) {
    const w = state.width;
    const h = state.height;
    const isMobile = w < 720;
    const scale = Math.min(w, h) * (isMobile ? 0.55 : 0.5);
    const centerX = w * (isMobile ? 0.64 : 0.68);
    const centerY = h * (isMobile ? 0.55 : 0.5);
    return [centerX + (point[0] - 0.5) * scale, centerY + point[1] * scale];
  }

  function poseGeometry(pose) {
    const points = {};
    for (const key of Object.keys(pose)) points[key] = posePoint(pose[key]);
    const segments = bones.map(([aName, bName]) => {
      const a = points[aName];
      const b = points[bName];
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const length = Math.hypot(dx, dy) || 1;
      return { ax: a[0], ay: a[1], dx, dy, nx: -dy / length, ny: dx / length };
    });
    return { points, segments };
  }

  function boneTarget(geometry, particle, normalScale = 1) {
    const segment = geometry.segments[particle.bone % geometry.segments.length];
    const offset = particle.offset * normalScale;
    return [
      segment.ax + segment.dx * particle.boneT + segment.nx * offset,
      segment.ay + segment.dy * particle.boneT + segment.ny * offset,
    ];
  }

  function logoPoint(target, jitter = 0) {
    const w = state.width;
    const h = state.height;
    const isMobile = w < 720;
    const scale = Math.min(w, h) * (isMobile ? 0.26 : 0.29);
    const cx = w * (isMobile ? 0.42 : 0.31);
    const cy = h * (isMobile ? 0.43 : 0.48);
    return [cx + target[0] * scale + jitter, cy + target[1] * scale + jitter * 0.32];
  }

  function fallbackLogoTargets() {
    const targets = [];
    const pushCircle = (radius, count) => {
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        targets.push([Math.cos(a) * radius, Math.sin(a) * radius]);
      }
    };
    const pushLine = (x1, y1, x2, y2, count) => {
      for (let i = 0; i < count; i++) {
        const t = count <= 1 ? 0 : i / (count - 1);
        targets.push([lerp(x1, x2, t), lerp(y1, y2, t)]);
      }
    };
    pushCircle(0.5, 240);
    pushCircle(0.34, 180);
    pushCircle(0.18, 110);
    pushLine(-0.36, 0, 0.36, 0, 150);
    pushLine(0, -0.1, 0, 0.45, 150);
    pushLine(-0.48, -0.2, -0.32, 0.1, 80);
    pushLine(0.48, -0.2, 0.32, 0.1, 80);
    if (targets.length <= profile.logoSampleCount) return targets;
    const stride = targets.length / profile.logoSampleCount;
    return Array.from({ length: profile.logoSampleCount }, (_, index) => targets[Math.floor(index * stride)]);
  }

  function cycleInfo(elapsed) {
    const loop = 18000;
    const raw = (elapsed % loop) / loop;
    const cycleIndex = Math.floor(elapsed / loop);
    const toLogo = smooth((raw - 0.4) / 0.18) * (1 - smooth((raw - 0.7) / 0.08));
    const release = smooth((raw - 0.72) / 0.14);
    const logoWeight = clamp(toLogo * (1 - release), 0, 1);
    const body = clamp(Math.max(1 - logoWeight, release), 0, 1);
    const depositGrowth = raw < 0.4 ? 0 : raw < 0.66 ? smooth((raw - 0.4) / 0.26) : 1;
    const depositWindow = smooth((raw - 0.42) / 0.1) * (1 - smooth((raw - 0.64) / 0.12));
    const logoBase = clamp((cycleIndex + depositGrowth) * 0.055, 0, 0.42);
    const logoGlow = depositWindow * (0.14 + Math.min(cycleIndex, 4) * 0.025);
    const shake = clamp(Math.max(1 - logoWeight, release), 0, 1);
    const phrase = raw < 0.4
      ? "dance"
      : raw < 0.66
        ? "deposit"
        : raw < 0.72
          ? "mark"
          : raw < 0.92
            ? "emit"
            : "reform";
    return { raw, cycleIndex, logoWeight, release, body, logoBase, logoGlow, depositWindow, shake, phrase };
  }

  function refreshLogoTargets() {
    if (!state.logoTargets.length) state.logoTargets = fallbackLogoTargets();
    for (const particle of state.motionParticles) {
      const target = state.logoTargets[particle.logoIndex % state.logoTargets.length];
      const point = logoPoint(target, particle.logoJitter);
      particle.logoX = point[0];
      particle.logoY = point[1];
    }
    for (const particle of state.logoParticles) {
      const target = state.logoTargets[particle.logoIndex % state.logoTargets.length];
      const point = logoPoint(target, particle.logoJitter);
      particle.x = point[0];
      particle.y = point[1];
    }
  }

  function buildParticles() {
    const mobileScale = state.width < 720 ? 0.68 : 1;
    const motionCount = Math.max(180, Math.round(profile.motionCount * mobileScale));
    const logoCount = Math.max(100, Math.round(profile.logoCount * mobileScale));
    const seedPose = poseGeometry(currentPose(0));

    state.motionLimit = motionCount;
    state.motionParticles = Array.from({ length: motionCount }, (_, id) => {
      const band = rand();
      const particle = {
        id,
        bone: Math.floor(rand() * bones.length),
        boneT: rand(),
        offset: (rand() - 0.5) * (band < 0.78 ? 12 : 34),
        logoIndex: Math.floor(rand() * 4000),
        logoJitter: (rand() - 0.5) * 2,
        seed: rand() * 1000,
        delay: rand() * 0.18,
        vx: 0,
        vy: 0,
        tone: rand() < 0.76 ? palette.paper : rand() < 0.92 ? palette.cyan : palette.amber,
        size: 0.9 + rand() * 1.4,
        alpha: 0.18 + rand() * 0.32,
        logoX: 0,
        logoY: 0,
      };
      const body = boneTarget(seedPose, particle, 1);
      particle.x = body[0] + (rand() - 0.5) * 18;
      particle.y = body[1] + (rand() - 0.5) * 18;
      return particle;
    });

    state.logoParticles = Array.from({ length: logoCount }, (_, id) => ({
      id,
      logoIndex: Math.floor((id / logoCount) * Math.max(1, state.logoTargets.length)) + Math.floor(rand() * 5),
      logoJitter: (rand() - 0.5) * 1.2,
      seed: rand() * 1000,
      tone: rand() < 0.84 ? palette.paper : rand() < 0.95 ? palette.cyan : palette.amber,
      size: 0.7 + rand() * 1.15,
      x: 0,
      y: 0,
    }));
    refreshLogoTargets();
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    state.dpr = Math.min(window.devicePixelRatio || 1, profile.dprCap);
    state.width = Math.max(1, Math.floor(rect.width));
    state.height = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    state.firstPaint = true;
    buildParticles();
    if (staticMode && heroStill) {
      if (!heroStill.src && heroStill.dataset.src) heroStill.src = heroStill.dataset.src;
      document.body.classList.add("static-hero");
    }
    render(performance.now(), true);
  }

  function setPhrase(text) {
    if (!phaseReadout || state.phrase === text) return;
    state.phrase = text;
    phaseReadout.textContent = text;
  }

  function drawBackground(time, cycle) {
    const w = state.width;
    const h = state.height;
    ctx.globalCompositeOperation = "source-over";
    if (state.firstPaint || staticMode) {
      ctx.fillStyle = palette.ink;
      ctx.fillRect(0, 0, w, h);
      state.firstPaint = false;
    } else {
      ctx.fillStyle = "rgba(8, 12, 13, 0.38)";
      ctx.fillRect(0, 0, w, h);
    }

    ctx.save();
    ctx.globalAlpha = 0.08 + cycle.logoBase * 0.16;
    ctx.strokeStyle = `rgba(${palette.paper}, 0.14)`;
    ctx.lineWidth = 1;
    const gap = Math.max(110, profile.gridGap);
    for (let x = (time * 8) % gap - gap; x < w + gap; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + w * 0.08, h);
      ctx.stroke();
    }
    for (let y = h * 0.2; y < h; y += gap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y + Math.sin(time * 0.3 + y) * 8);
      ctx.stroke();
    }
    ctx.restore();
  }

  function updateMotionParticles(time, cycle, geometry) {
    const release = cycle.release;
    const logoWeight = cycle.logoWeight;
    for (let i = 0; i < state.motionLimit; i++) {
      const particle = state.motionParticles[i];
      const targetBody = boneTarget(geometry, particle, 1 - logoWeight * 0.44);
      const phase = time * (1.3 + particle.delay) + particle.seed;
      const sway = Math.sin(phase) * 8 * cycle.shake;
      const lift = Math.cos(phase * 0.72) * 5 * cycle.shake;
      const bodyX = targetBody[0] + sway;
      const bodyY = targetBody[1] + lift;
      const towardLogo = clamp((logoWeight - particle.delay) * 1.25, 0, 1);
      const targetX = lerp(bodyX, particle.logoX, towardLogo);
      const targetY = lerp(bodyY, particle.logoY, towardLogo);
      const pull = 0.07 + towardLogo * 0.055 + release * 0.035;
      const drift = (1 - towardLogo) * 0.18;
      const flowX = Math.sin(time * 0.55 + particle.seed) * drift + release * Math.cos(particle.seed) * 0.48;
      const flowY = Math.cos(time * 0.42 + particle.seed * 0.7) * drift + release * Math.sin(particle.seed) * 0.38;
      particle.vx = particle.vx * 0.82 + (targetX - particle.x) * pull + flowX;
      particle.vy = particle.vy * 0.82 + (targetY - particle.y) * pull + flowY;
      particle.x += particle.vx;
      particle.y += particle.vy;
    }
  }

  function drawMotionParticles(cycle) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const bodyAlpha = 0.18 + cycle.body * 0.56 + cycle.depositWindow * 0.18;
    for (let i = 0; i < state.motionLimit; i++) {
      const particle = state.motionParticles[i];
      const alpha = particle.alpha * bodyAlpha;
      const size = particle.size * (1 + cycle.depositWindow * 0.32);
      ctx.fillStyle = `rgba(${particle.tone}, ${alpha})`;
      ctx.fillRect(particle.x, particle.y, size, size);
    }
    ctx.restore();
  }

  function drawLogoParticles(time, cycle) {
    const logoAlpha = cycle.logoBase + cycle.logoGlow;
    if (logoAlpha <= 0.002) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const particle of state.logoParticles) {
      const shimmer = 0.66 + 0.34 * Math.sin(time * 1.2 + particle.seed);
      const alpha = logoAlpha * shimmer * (particle.tone === palette.paper ? 1.02 : 1.22);
      const size = particle.size * (1 + cycle.logoGlow * 3.6);
      ctx.fillStyle = `rgba(${particle.tone}, ${alpha})`;
      ctx.fillRect(particle.x, particle.y, size, size);
    }
    ctx.restore();
  }

  function drawPoseOverlay(time, geometry, previousGeometry, cycle) {
    if (!profile.cv || cycle.body <= 0.08 || cycle.logoWeight > 0.88) return;
    const alpha = clamp(cycle.body * 0.42 * (1 - cycle.logoWeight), 0, 0.46);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = `rgba(${palette.cyan}, ${alpha})`;
    ctx.lineWidth = 1;
    for (const [aName, bName] of bones) {
      const a = geometry.points[aName];
      const b = geometry.points[bName];
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    }
    for (let i = 0; i < landmarkKeys.length; i++) {
      const point = geometry.points[landmarkKeys[i]];
      const previous = previousGeometry.points[landmarkKeys[i]];
      const pulse = 1.5 + Math.sin(time * 1.7 + i) * 0.4;
      ctx.fillStyle = i % 5 === 0 ? `rgba(${palette.amber}, ${alpha * 1.2})` : `rgba(${palette.paper}, ${alpha})`;
      ctx.fillRect(point[0] - pulse, point[1] - pulse, pulse * 2, pulse * 2);
      if (i === 7 || i === 8 || i === 13 || i === 14) {
        ctx.strokeStyle = `rgba(${palette.amber}, ${alpha * 0.55})`;
        ctx.beginPath();
        ctx.moveTo(previous[0], previous[1]);
        ctx.lineTo(point[0] + (point[0] - previous[0]) * 2.4, point[1] + (point[1] - previous[1]) * 2.4);
        ctx.stroke();
      }
    }
    if (state.width >= 780) {
      const head = geometry.points.head;
      ctx.fillStyle = `rgba(${palette.cyan}, ${alpha * 0.72})`;
      ctx.font = "10px SFMono-Regular, Menlo, Consolas, monospace";
      ctx.fillText("CV POSE TRACK 03", head[0] - 48, head[1] - 38);
    }
    ctx.restore();
  }

  function render(now, force = false) {
    const elapsed = staticMode ? 13200 : now - state.start;
    const time = elapsed / 1000;
    const cycle = cycleInfo(elapsed);
    const poseTime = time * 0.2 + Math.sin(time * 0.26) * 0.08;
    const pose = poseGeometry(currentPose(poseTime));
    const previousPose = poseGeometry(currentPose(poseTime - 0.16));

    setPhrase(cycle.phrase);
    drawBackground(time, cycle);
    if (!staticMode || force) updateMotionParticles(time, cycle, pose);
    drawLogoParticles(time, cycle);
    drawMotionParticles(cycle);
    drawPoseOverlay(time, pose, previousPose, cycle);
  }

  function adaptToFrameCost(delta) {
    if (qualityName === "low" || staticMode) return;
    if (delta > 26) state.slowFrames += 1;
    else state.slowFrames = Math.max(0, state.slowFrames - 1);
    if (state.slowFrames > 18 && state.motionLimit > profiles.low.motionCount) {
      state.motionLimit = Math.max(profiles.low.motionCount, Math.floor(state.motionLimit * 0.78));
      state.slowFrames = 0;
    }
  }

  function loop(now) {
    if (!state.visible) {
      state.running = false;
      return;
    }
    const minGap = 1000 / profile.fps;
    if (now - state.lastFrame >= minGap) {
      state.lastDelta = now - state.lastFrame || 16.7;
      state.lastFrame = now;
      adaptToFrameCost(state.lastDelta);
      render(now);
    }
    window.requestAnimationFrame(loop);
  }

  function startLoop() {
    if (state.running || staticMode) return;
    state.running = true;
    state.lastFrame = performance.now();
    window.requestAnimationFrame(loop);
  }

  function setupObserver() {
    if (!("IntersectionObserver" in window)) {
      startLoop();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        state.visible = entries[0].isIntersecting && !document.hidden;
        if (state.visible) startLoop();
      },
      { rootMargin: "80px 0px 80px 0px", threshold: 0 },
    );
    observer.observe(document.getElementById("hero") || canvas);
  }

  function setupLogoTargets() {
    state.logoTargets = fallbackLogoTargets();
    refreshLogoTargets();
  }

  function introElements() {
    return [
      ...document.querySelectorAll(".hero-title span"),
      ...document.querySelectorAll(".reveal-line"),
      ...document.querySelectorAll(".hero-readout"),
      ...document.querySelectorAll(".scroll-cue"),
    ];
  }

  function setIntroInitial() {
    if (staticMode || reduceMotion) return;
    for (const element of introElements()) {
      element.style.opacity = "0";
      element.style.transform = "translateY(18px)";
    }
  }

  function showStaticMotion() {
    for (const element of introElements()) {
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
    }
    for (const element of document.querySelectorAll(".reveal, .paper-row")) {
      element.style.opacity = "1";
      element.style.transform = "translateY(0) scale(1)";
    }
  }

  function scheduleNativeIntro() {
    if (staticMode || reduceMotion) {
      showStaticMotion();
      return;
    }
    const elapsed = (performance.now() - state.start) / 1000;
    const items = [
      [".hero-title span", 2.8],
      [".reveal-line", 3.02],
      [".hero-readout", 3.18],
      [".scroll-cue", 3.32],
    ];
    for (const [selector, at] of items) {
      for (const element of document.querySelectorAll(selector)) {
        const delay = Math.max(0, at - elapsed) * 1000;
        window.setTimeout(() => {
          element.animate(
            [
              { opacity: 0, transform: "translateY(18px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { duration: 780, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" },
          );
        }, delay);
      }
    }
  }

  function setupScrollReveals() {
    if (staticMode || reduceMotion) {
      showStaticMotion();
      return;
    }
    scheduleNativeIntro();
    const elements = [...document.querySelectorAll(".reveal, .paper-row")];
    for (const element of elements) {
      element.style.opacity = "0";
      element.style.transform = "translateY(32px) scale(0.995)";
    }
    if (!("IntersectionObserver" in window)) {
      for (const element of elements) {
        element.style.opacity = "1";
        element.style.transform = "translateY(0) scale(1)";
      }
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          entry.target.animate(
            [
              { opacity: 0, transform: "translateY(32px) scale(0.995)" },
              { opacity: 1, transform: "translateY(0) scale(1)" },
            ],
            { duration: 700, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" },
          );
        }
      },
      { rootMargin: "0px 0px -16% 0px", threshold: 0 },
    );
    for (const element of elements) observer.observe(element);
  }

  window.addEventListener("resize", () => {
    window.clearTimeout(state.resizeTimer);
    state.resizeTimer = window.setTimeout(resize, 140);
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    state.visible = !document.hidden;
    if (state.visible) startLoop();
  });

  setIntroInitial();
  setupLogoTargets();
  resize();
  setupObserver();
  setupScrollReveals();
  if (staticMode) render(performance.now(), true);
})();
