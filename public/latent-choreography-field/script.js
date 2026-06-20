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
  const embeddedMode = params.get("embed") === "1";
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
      motionCount: 560,
      logoCount: 720,
      logoSampleCount: 900,
      fps: 50,
      cv: false,
      gridGap: 150,
    },
    smooth: {
      dprCap: 1,
      motionCount: 980,
      logoCount: 1500,
      logoSampleCount: 1500,
      fps: 60,
      cv: true,
      gridGap: 128,
    },
    high: {
      dprCap: 1.15,
      motionCount: 1250,
      logoCount: 1500,
      logoSampleCount: 1500,
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
    logoLimit: profile.logoCount,
    logoLevel: 0,
    logoDisplayLevel: 0,
    logoDensity: 0,
    logoDisplayDensity: 0,
    logoTargets: [],
    motionParticles: [],
    logoParticles: [],
    phrase: "dance",
    resizeTimer: 0,
    pointer: {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      strength: 0,
      targetStrength: 0,
      active: false,
      lastMove: 0,
      waves: [],
      waveId: 0,
      lastWaveAt: 0,
      lastWaveX: 0,
      lastWaveY: 0,
    },
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
  const hashUnit = (value) => {
    const x = Math.sin(value * 12.9898) * 43758.5453;
    return x - Math.floor(x);
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
    const scale = Math.min(w, h) * (isMobile ? 0.42 : 0.5);
    const cx = w * (isMobile ? 0.39 : 0.29);
    const cy = h * (isMobile ? 0.37 : 0.405);
    return [cx + target[0] * scale + jitter, cy + target[1] * scale + jitter * 0.32];
  }

  function sampledLogoTargets() {
    const source = window.MALOU_LOGO_POINTS;
    if (!Array.isArray(source) || source.length < 4) return [];
    const sourceCount = Math.floor(source.length / 2);
    const count = Math.min(profile.logoSampleCount, sourceCount);
    const stride = sourceCount / count;
    const targets = [];
    for (let i = 0; i < count; i++) {
      const index = Math.floor(i * stride) * 2;
      targets.push([source[index] / 2000, source[index + 1] / 2000]);
    }
    return targets;
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
    const loop = 6400;
    const raw = (elapsed % loop) / loop;
    const cycleIndex = Math.floor(elapsed / loop);
    const firstCycle = cycleIndex === 0;
    const fieldOpen = firstCycle ? smooth(raw / 0.14) : 1;
    const toLogo = smooth((raw - 0.37) / 0.2) * (1 - smooth((raw - 0.74) / 0.08));
    const releaseIn = smooth((raw - 0.76) / 0.13);
    const releaseOut = 1 - smooth((raw - 0.93) / 0.06);
    const release = releaseIn * releaseOut;
    const logoWeight = clamp(toLogo * (1 - release), 0, 1);
    const bodyReveal = firstCycle ? smooth(raw / 0.14) : 1;
    const sweepCalm = smooth((raw - 0.42) / 0.2);
    const quietBody = lerp(0.62, 0.24, sweepCalm);
    const body = clamp(Math.max(quietBody, 1 - logoWeight * 0.76, release * 0.98), 0, 1) * bodyReveal;
    const depositWindow = smooth((raw - 0.39) / 0.16) * (1 - smooth((raw - 0.76) / 0.12));
    const commitProgress = smooth((raw - 0.57) / 0.16);
    const previousLevel = cycleIndex <= 0 ? 0 : clamp(0.62 + (cycleIndex - 1) * 0.13, 0, 1);
    const nextLevel = clamp(0.62 + cycleIndex * 0.13, 0, 1);
    const previousDensity = cycleIndex <= 0 ? 0 : clamp(0.55 + (cycleIndex - 1) * 0.15, 0, 1);
    const nextDensity = clamp(0.55 + cycleIndex * 0.15, 0, 1);
    const logoTargetLevel = lerp(previousLevel, nextLevel, commitProgress);
    const logoTargetDensity = lerp(previousDensity, nextDensity, commitProgress);
    const shake = clamp((1 - sweepCalm) * 0.95 + release * 0.7, 0, 1);
    const phrase = firstCycle && raw < 0.14
      ? "calibrate"
      : raw < 0.14
        ? "form"
        : raw < 0.37
          ? "dance"
          : raw < 0.61
            ? "sweep"
            : raw < 0.76
              ? "commit"
              : raw < 0.96
                ? "emit"
                : "form";
    return {
      raw,
      cycleIndex,
      firstCycle,
      fieldOpen,
      logoWeight,
      release,
      body,
      bodyReveal,
      logoTargetLevel,
      logoTargetDensity,
      depositWindow,
      shake,
      phrase,
    };
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
      particle.baseX = point[0];
      particle.baseY = point[1];
      particle.x = point[0];
      particle.y = point[1];
      particle.vx = 0;
      particle.vy = 0;
      particle.energy = 0;
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
        offset: (rand() - 0.5) * (band < 0.64 ? 24 : 62),
        logoIndex: Math.floor(rand() * 4000),
        logoJitter: (rand() - 0.5) * 2,
        seed: rand() * 1000,
        delay: rand() * 0.18,
        vx: 0,
        vy: 0,
        tone: rand() < 0.76 ? palette.paper : rand() < 0.92 ? palette.cyan : palette.amber,
        size: 1 + rand() * 1.55,
        alpha: 0.16 + rand() * 0.3,
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
      anchor: id % 3 === 0,
      reveal: rand(),
      tone: rand() < 0.84 ? palette.paper : rand() < 0.95 ? palette.cyan : palette.amber,
      size: 0.95 + rand() * 1.25,
      baseX: 0,
      baseY: 0,
      vx: 0,
      vy: 0,
      energy: 0,
      x: 0,
      y: 0,
    }));
    state.logoLimit = logoCount;
    refreshLogoTargets();
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    state.dpr = Math.min(window.devicePixelRatio || 1, profile.dprCap);
    state.width = Math.max(1, Math.floor(rect.width));
    state.height = Math.max(1, Math.floor(rect.height));
    if (!state.pointer.x && !state.pointer.y) {
      state.pointer.x = state.width * 0.58;
      state.pointer.y = state.height * 0.46;
      state.pointer.targetX = state.pointer.x;
      state.pointer.targetY = state.pointer.y;
    }
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

  function updatePointerField(now) {
    const pointer = state.pointer;
    if (staticMode || reduceMotion || coarsePointer) {
      pointer.strength = 0;
      pointer.waves.length = 0;
      return;
    }
    const idle = now - pointer.lastMove > 900;
    const targetStrength = pointer.active && !idle ? pointer.targetStrength : 0;
    pointer.x = lerp(pointer.x, pointer.targetX, 0.2);
    pointer.y = lerp(pointer.y, pointer.targetY, 0.2);
    pointer.strength = lerp(pointer.strength, targetStrength, 0.12);
    pointer.waves = pointer.waves.filter((wave) => (now - state.start) / 1000 - wave.start < wave.life);
  }

  function pushFieldWave(x, y, force, now, type = "drag") {
    if (staticMode || reduceMotion || coarsePointer) return;
    const pointer = state.pointer;
    const maxWaves = profile.cv ? 5 : 3;
    pointer.waves.push({
      id: pointer.waveId++,
      x,
      y,
      start: (now - state.start) / 1000,
      life: type === "press" ? 2.05 : 1.28,
      force: clamp(force, 0.12, 0.82),
      spin: hashUnit(x * 0.037 + y * 0.021 + pointer.waveId) > 0.5 ? 1 : -1,
      type,
    });
    if (pointer.waves.length > maxWaves) {
      pointer.waves.splice(0, pointer.waves.length - maxWaves);
    }
  }

  function fieldDisplacement(x, y, time) {
    const pointer = state.pointer;
    const diagonal = Math.hypot(state.width, state.height);
    let dx = 0;
    let dy = 0;
    let z = 0;
    let energy = 0;

    if (pointer.strength > 0.02) {
      const vx = x - pointer.x;
      const vy = y - pointer.y;
      const distance = Math.hypot(vx, vy) || 1;
      const nx = vx / distance;
      const ny = vy / distance;
      const wide = pointer.strength / (1 + Math.pow(distance / 470, 2));
      const core = Math.exp(-(distance * distance) / (300 * 300)) * pointer.strength;
      const pull = wide * 28 + core * 44;
      const spiral = Math.sin(time * 0.82 + distance * 0.008) * core * 7;
      dx -= nx * pull;
      dy -= ny * (pull * 0.64);
      dx += -ny * spiral;
      dy += nx * spiral * 0.45;
      z += core * 0.86 + wide * 0.24;
      energy += core * 0.62 + wide * 0.22;
    }

    for (const wave of pointer.waves) {
      const age = time - wave.start;
      if (age < 0 || age > wave.life) continue;
      const progress = clamp(age / wave.life, 0, 1);
      const vx = x - wave.x;
      const vy = y - wave.y;
      const distance = Math.hypot(vx, vy) || 1;
      const radius = diagonal * (0.012 + progress * 0.56);
      const bandWidth = 72 + progress * 146;
      const band = Math.max(0, 1 - Math.abs(distance - radius) / bandWidth);
      if (band <= 0) continue;
      const falloff = Math.pow(1 - progress, 0.94);
      const phase = Math.sin((distance - radius) * 0.042 - progress * Math.PI * 0.74);
      const pulse = phase * smooth(band) * falloff * wave.force;
      const nx = vx / distance;
      const ny = vy / distance;
      dx += nx * pulse * 38;
      dy += ny * pulse * 24;
      z += Math.abs(pulse) * 0.24;
      energy += Math.abs(pulse) * 0.32;
    }

    return { dx, dy, z, energy: clamp(energy, 0, 1.5) };
  }

  function warpBackgroundPoint(x, y, time, depth = 1) {
    const field = fieldDisplacement(x, y, time);
    const vanishingX = state.width * 0.55;
    const vanishingY = state.height * 0.36;
    const perspective = 1 + field.z * 0.009 * depth;
    return {
      x: vanishingX + (x - vanishingX) * perspective + field.dx * depth,
      y: vanishingY + (y - vanishingY) * perspective + field.dy * depth,
      energy: field.energy,
    };
  }

  function waveStrainAt(x, y, time) {
    const pointer = state.pointer;
    if (!pointer.waves.length) return 0;
    const diagonal = Math.hypot(state.width, state.height);
    let strain = 0;
    for (const wave of pointer.waves) {
      const age = time - wave.start;
      if (age < 0 || age > wave.life) continue;
      const progress = clamp(age / wave.life, 0, 1);
      const distance = Math.hypot(x - wave.x, y - wave.y);
      const radius = diagonal * (0.012 + progress * 0.56);
      const bandWidth = 84 + progress * 156;
      const band = Math.max(0, 1 - Math.abs(distance - radius) / bandWidth);
      if (band <= 0) continue;
      const falloff = Math.pow(1 - progress, 0.98);
      const phase = Math.sin((distance - radius) * 0.042 - progress * Math.PI * 0.74);
      strain += smooth(band) * falloff * wave.force * (0.45 + Math.abs(phase) * 0.55);
    }
    return clamp(strain, 0, 1);
  }

  function drawWarpedGridLine(points, time, depth, baseAlpha) {
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const strain = waveStrainAt((a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5, time);
      const start = warpBackgroundPoint(a[0], a[1], time, depth);
      const end = warpBackgroundPoint(b[0], b[1], time, depth);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.strokeStyle = `rgba(${strain > 0.04 ? palette.cyan : palette.paper}, ${baseAlpha + strain * 0.12})`;
      ctx.lineWidth = 1 + strain * 0.75;
      ctx.stroke();
    }
  }

  function drawLensCore() {
    const pointer = state.pointer;
    const strength = pointer.strength;
    if (strength <= 0.025) return;
    const x = pointer.x;
    const y = pointer.y;
    const radius = Math.min(210, Math.max(110, Math.min(state.width, state.height) * 0.16));

    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    const core = ctx.createRadialGradient(x, y, 0, x, y, radius);
    core.addColorStop(0, `rgba(2, 5, 6, ${0.24 * strength})`);
    core.addColorStop(0.48, `rgba(2, 5, 6, ${0.07 * strength})`);
    core.addColorStop(1, "rgba(2, 5, 6, 0)");
    ctx.fillStyle = core;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    ctx.restore();
  }

  function drawLensDust(time) {
    const pointer = state.pointer;
    const strength = pointer.strength;
    if (strength <= 0.03) return;
    const count = qualityName === "low" ? 10 : 16;
    const radius = Math.min(340, Math.max(190, Math.min(state.width, state.height) * 0.28));

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < count; i++) {
      const seed = i + 31;
      const base = hashUnit(seed * 3.4);
      const angle = base * Math.PI * 2 + time * (0.05 + hashUnit(seed) * 0.08);
      const orbit = radius * (0.18 + hashUnit(seed * 5.3) * 0.8);
      const collapse = strength * (0.35 + hashUnit(seed * 7.9) * 0.45);
      const px = pointer.x + Math.cos(angle) * orbit * (1 - collapse * 0.32);
      const py = pointer.y + Math.sin(angle) * orbit * (0.5 - collapse * 0.12);
      const tone = i % 7 === 0 ? palette.amber : i % 3 === 0 ? palette.cyan : palette.paper;
      ctx.fillStyle = `rgba(${tone}, ${strength * (0.012 + hashUnit(seed * 9.1) * 0.024)})`;
      ctx.fillRect(px, py, 1.1, 1.1);
    }
    ctx.restore();
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

    drawLensCore();

    if (!embeddedMode) {
      ctx.save();
      const gap = Math.max(110, profile.gridGap);
      for (let x = (time * 8) % gap - gap; x < w + gap; x += gap) {
        const points = [];
        const steps = qualityName === "low" ? 8 : 13;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          points.push([x + w * 0.08 * t, h * t]);
        }
        drawWarpedGridLine(points, time, 0.62, 0.018 + state.logoDisplayLevel * 0.01);
      }
      for (let y = h * 0.2; y < h; y += gap) {
        const points = [];
        const steps = qualityName === "low" ? 8 : 14;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          points.push([w * t, y + Math.sin(time * 0.3 + y + t * Math.PI) * 8]);
        }
        drawWarpedGridLine(points, time, 0.58, 0.016 + state.logoDisplayLevel * 0.01);
      }
      ctx.restore();
    }
    drawLensDust(time);
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
      const towardLogo = clamp((logoWeight - particle.delay) * 1.45, 0, 1);
      const targetX = lerp(bodyX, particle.logoX, towardLogo);
      const targetY = lerp(bodyY, particle.logoY, towardLogo);
      const pull = 0.085 + towardLogo * 0.075 + release * 0.04;
      const drift = (1 - towardLogo) * 0.14;
      const flowX = Math.sin(time * 0.55 + particle.seed) * drift + release * Math.cos(particle.seed) * 0.48;
      const flowY = Math.cos(time * 0.42 + particle.seed * 0.7) * drift + release * Math.sin(particle.seed) * 0.38;
      particle.vx = particle.vx * 0.82 + (targetX - particle.x) * pull + flowX;
      particle.vy = particle.vy * 0.82 + (targetY - particle.y) * pull + flowY;
      particle.x += particle.vx;
      particle.y += particle.vy;
    }
  }

  function drawBodyVolume(time, geometry, cycle) {
    if (cycle.body <= 0.04) return;
    const alpha = clamp(cycle.body * (1.2 - cycle.logoWeight * 0.04), 0, 0.94);
    if (alpha <= 0.01) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const broadBones = [
      ["neck", "spine", 18],
      ["lShoulder", "lElbow", 13],
      ["lElbow", "lHand", 11],
      ["rShoulder", "rElbow", 13],
      ["rElbow", "rHand", 11],
      ["spine", "lHip", 14],
      ["spine", "rHip", 14],
      ["lHip", "lKnee", 15],
      ["lKnee", "lFoot", 13],
      ["rHip", "rKnee", 15],
      ["rKnee", "rFoot", 13],
    ];

    for (const [aName, bName, width] of broadBones) {
      const a = geometry.points[aName];
      const b = geometry.points[bName];
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const length = Math.hypot(dx, dy) || 1;
      const nx = -dy / length;
      const ny = dx / length;
      for (let j = 0; j < 30; j++) {
        const t = (j + 0.5) / 30;
        const seed = j * 12.989 + a[0] * 0.013 + b[1] * 0.017;
        const spread = Math.sin(seed + time * 0.9) * width * 0.62;
        const jitter = Math.cos(seed * 1.7 + time * 0.7) * width * 0.18;
        const x = a[0] + dx * t + nx * spread + Math.sin(seed) * jitter;
        const y = a[1] + dy * t + ny * spread + Math.cos(seed) * jitter;
        const dotAlpha = alpha * (0.2 + 0.24 * Math.sin(seed + time * 1.3) ** 2);
        const tone = j % 5 === 0 ? palette.cyan : palette.paper;
        const size = 1.75 + (j % 4) * 0.42 + width * 0.02;
        ctx.fillStyle = `rgba(${tone}, ${dotAlpha})`;
        ctx.fillRect(x, y, size, size);
      }
    }

    const head = geometry.points.head;
    for (let j = 0; j < 44; j++) {
      const a = (j / 44) * Math.PI * 2;
      const radius = 11 + Math.sin(j * 1.7 + time) * 9;
      const x = head[0] + Math.cos(a) * radius;
      const y = head[1] + Math.sin(a) * radius;
      ctx.fillStyle = `rgba(${j % 6 === 0 ? palette.amber : palette.paper}, ${alpha * 0.22})`;
      ctx.fillRect(x, y, 1.7, 1.7);
    }
    ctx.restore();
  }

  function drawMotionParticles(cycle) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < state.motionLimit; i++) {
      const particle = state.motionParticles[i];
      const towardLogo = clamp((cycle.logoWeight - particle.delay) * 1.45, 0, 1);
      const transit = Math.sin(Math.PI * towardLogo);
      const bodyPresence = cycle.body * (1 - cycle.logoWeight * 0.28);
      const transferPresence = cycle.depositWindow * (0.16 + transit * 0.7);
      const releasePresence = cycle.release * (0.12 + (1 - towardLogo) * 0.3);
      const alpha = particle.alpha * (0.03 * cycle.bodyReveal + bodyPresence * 1.05 + transferPresence + releasePresence);
      if (alpha <= 0.006) continue;
      const size = particle.size * (1 + transit * 0.45 + cycle.release * 0.16);
      ctx.fillStyle = `rgba(${particle.tone}, ${alpha})`;
      ctx.fillRect(particle.x, particle.y, size, size);
    }
    ctx.restore();
  }

  function updateLogoParticles(time, cycle) {
    const logoAlpha = state.logoDisplayLevel;
    const logoDensity = state.logoDisplayDensity;
    if (staticMode || logoAlpha <= 0.002 || logoDensity <= 0.002) return;

    const center = logoPoint([0, 0], 0);
    const precision = smooth((logoDensity - 0.34) / 0.54);
    const pointer = state.pointer;
    const spring = 0.046 + precision * 0.052;
    const damping = 0.86 - precision * 0.026;
    const livingRange = lerp(13.5, 4.6, precision) * (0.62 + logoAlpha * 0.62);

    for (let i = 0; i < state.logoLimit; i++) {
      const particle = state.logoParticles[i];
      const revealAlpha = smooth((logoDensity - particle.reveal) / 0.12);
      if (revealAlpha <= 0.004) continue;

      const dx = particle.baseX - center[0];
      const dy = particle.baseY - center[1];
      const radius = Math.hypot(dx, dy) || 1;
      const nx = dx / radius;
      const ny = dy / radius;
      const tx = -ny;
      const ty = nx;
      const phase = time * 1.9 + radius * 0.024 + particle.seed * 0.033;
      const anchorHold = particle.anchor ? 0.38 : 1;
      const pulse = Math.sin(phase) * livingRange * anchorHold;
      const counterPulse = Math.sin(time * 0.83 + particle.seed * 0.19) * livingRange * 0.36 * anchorHold;
      let homeX = particle.baseX + nx * pulse + tx * counterPulse;
      let homeY = particle.baseY + ny * pulse * 0.72 + ty * counterPulse;
      let kickX = 0;
      let kickY = 0;
      let energy = 0;

      if (pointer.strength > 0.02) {
        const vx = particle.x - pointer.x;
        const vy = particle.y - pointer.y;
        const distance = Math.hypot(vx, vy) || 1;
        const pull = pointer.strength / (1 + Math.pow(distance / 390, 2));
        const response = particle.anchor ? 0.42 : 1;
        const pnx = vx / distance;
        const pny = vy / distance;
        homeX -= pnx * pull * 13 * response;
        homeY -= pny * pull * 9 * response;
        kickX -= pnx * pull * 2.15 * response;
        kickY -= pny * pull * 1.55 * response;
        kickX += -pny * pull * 1.2 * response * Math.sin(time * 0.78 + particle.seed);
        kickY += pnx * pull * 0.82 * response * Math.sin(time * 0.78 + particle.seed);
        energy += pull * 0.86;
      }

      for (const wave of pointer.waves) {
        const age = time - wave.start;
        if (age < 0 || age > wave.life) continue;
        const progress = clamp(age / wave.life, 0, 1);
        const vx = particle.x - wave.x;
        const vy = particle.y - wave.y;
        const distance = Math.hypot(vx, vy) || 1;
        const diagonal = Math.hypot(state.width, state.height);
        const radiusAtWave = diagonal * (0.012 + progress * 0.56);
        const bandWidth = 112 + progress * 172;
        const band = Math.max(0, 1 - Math.abs(distance - radiusAtWave) / bandWidth);
        if (band <= 0) continue;
        const falloff = Math.pow(1 - progress, 0.92);
        const phaseWave = Math.sin((distance - radiusAtWave) * 0.038 - progress * Math.PI * 0.72);
        const waveForce = phaseWave * smooth(band) * falloff * wave.force;
        const response = particle.anchor ? 0.46 : 1;
        const wnx = vx / distance;
        const wny = vy / distance;
        kickX += wnx * waveForce * 6.2 * response;
        kickY += wny * waveForce * 4.8 * response;
        homeX += wnx * Math.abs(waveForce) * 11.5 * response;
        homeY += wny * Math.abs(waveForce) * 8.7 * response;
        energy += Math.abs(waveForce) * 1.24;
      }

      const particleSpring = particle.anchor ? spring * 1.45 : spring;
      const particleDamping = particle.anchor ? damping * 0.92 : damping;
      particle.vx = (particle.vx + (homeX - particle.x) * particleSpring + kickX) * particleDamping;
      particle.vy = (particle.vy + (homeY - particle.y) * particleSpring + kickY) * particleDamping;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.energy = lerp(particle.energy, clamp(energy, 0, 1.8), 0.24);
    }
  }

  function drawLogoParticles(time, cycle) {
    const logoAlpha = state.logoDisplayLevel;
    const logoDensity = state.logoDisplayDensity;
    if (logoAlpha <= 0.002 || logoDensity <= 0.002) return;
    const center = logoPoint([0, 0], 0);
    const precision = smooth((logoDensity - 0.34) / 0.54);
    const cloudMotion = lerp(1.4, 0.34, precision) + cycle.depositWindow * 0.36;
    const logoGlow = 0.92 + logoDensity * 0.22;
    const breath = 0.5 + 0.5 * Math.sin(time * 2.15);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    if (precision > 0.04) {
      for (let i = 0; i < state.logoLimit; i++) {
        const particle = state.logoParticles[i];
        if (!particle.anchor) continue;
        const revealAlpha = smooth((logoDensity - particle.reveal) / 0.14);
        if (revealAlpha <= 0.006) continue;
        const dx = particle.baseX - center[0];
        const dy = particle.baseY - center[1];
        const radius = Math.hypot(dx, dy) || 1;
        const nx = dx / radius;
        const ny = dy / radius;
        const anchorPulse = Math.sin(time * 1.08 + radius * 0.014 + particle.seed) * (0.42 + precision * 0.82);
        const anchorSweep = Math.cos(time * 0.62 + particle.seed * 0.31) * (0.22 + precision * 0.36);
        const px = particle.baseX + nx * anchorPulse - ny * anchorSweep;
        const py = particle.baseY + ny * anchorPulse * 0.72 + nx * anchorSweep;
        const anchorAlpha = logoAlpha * revealAlpha * (0.16 + precision * 0.26) * (particle.tone === palette.paper ? 1 : 1.18);
        const anchorSize = particle.size * (0.68 + precision * 0.34);
        ctx.fillStyle = `rgba(${particle.tone}, ${anchorAlpha})`;
        ctx.fillRect(px, py, anchorSize, anchorSize);
      }
    }

    for (let i = 0; i < state.logoLimit; i++) {
      const particle = state.logoParticles[i];
      const revealAlpha = smooth((logoDensity - particle.reveal) / 0.12);
      if (revealAlpha <= 0.006) continue;
      const shimmer = 0.86 + 0.14 * Math.sin(time * 1.2 + particle.seed);
      const dx = particle.x - center[0];
      const dy = particle.y - center[1];
      const radius = Math.hypot(dx, dy) || 1;
      const orbit = Math.min(5.8, radius * lerp(0.024, 0.008, precision));
      const orbitX = (-dy / radius) * Math.sin(time * 0.7 + particle.seed) * orbit;
      const orbitY = (dx / radius) * Math.sin(time * 0.7 + particle.seed) * orbit;
      const breathe = Math.sin(time * 1.34 + radius * 0.018 + particle.seed * 0.04) * (0.78 + logoDensity * 1.2);
      const breatheX = (dx / radius) * breathe;
      const breatheY = (dy / radius) * breathe;
      const motionScale = particle.anchor ? 0.42 : 1;
      const jitterX =
        (Math.sin(time * 1.16 + particle.seed) * cloudMotion +
        Math.sin(time * 2.1 + particle.seed * 0.37) * cloudMotion * 0.42) * motionScale;
      const jitterY =
        (Math.cos(time * 0.94 + particle.seed * 0.72) * cloudMotion +
        Math.cos(time * 1.8 + particle.seed * 0.51) * cloudMotion * 0.34) * motionScale;
      const alpha = logoAlpha * revealAlpha * shimmer * logoGlow * (0.86 + breath * 0.22 + particle.energy * 0.22) * (particle.tone === palette.paper ? 1.02 : 1.24) * (particle.anchor ? 1.14 : 1);
      const size = particle.size * (0.9 + state.logoDisplayLevel * 0.42 + breath * 0.14 + particle.energy * 0.22);
      ctx.fillStyle = `rgba(${particle.tone}, ${alpha})`;
      ctx.fillRect(particle.x + jitterX + orbitX + breatheX, particle.y + jitterY + orbitY + breatheY, size, size);
    }
    ctx.restore();
  }

  function poseBounds(geometry) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const key of landmarkKeys) {
      const point = geometry.points[key];
      minX = Math.min(minX, point[0]);
      minY = Math.min(minY, point[1]);
      maxX = Math.max(maxX, point[0]);
      maxY = Math.max(maxY, point[1]);
    }
    const pad = Math.max(28, Math.min(state.width, state.height) * 0.035);
    return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
  }

  function drawCalibrationField(time, geometry, cycle) {
    if (!cycle.firstCycle) return;
    const presence = 1 - smooth((cycle.raw - 0.165) / 0.055);
    if (presence <= 0.01) return;

    const bounds = poseBounds(geometry);
    const w = state.width;
    const h = state.height;
    const phaseIn = smooth(cycle.raw / 0.045);
    const attract = smooth((cycle.raw - 0.036) / 0.082);
    const alpha = presence * (0.18 + phaseIn * 0.82);
    const left = Math.max(0, bounds.x - bounds.w * 0.32);
    const right = Math.min(w, bounds.x + bounds.w * 1.16);
    const top = Math.max(0, bounds.y - bounds.h * 0.22);
    const bottom = Math.min(h, bounds.y + bounds.h * 1.16);
    const corner = Math.min(32, bounds.w * 0.2, bounds.h * 0.18);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "square";

    ctx.strokeStyle = `rgba(${palette.cyan}, ${alpha * 0.12})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = lerp(top, bottom, (i + 1) / 6);
      ctx.beginPath();
      ctx.moveTo(left, y + Math.sin(time * 1.1 + i) * 2);
      ctx.lineTo(right, y + Math.cos(time * 0.9 + i) * 2);
      ctx.stroke();
    }
    for (let i = 0; i < 4; i++) {
      const x = lerp(left, right, (i + 1) / 5);
      ctx.beginPath();
      ctx.moveTo(x + Math.sin(time * 0.8 + i) * 2, top);
      ctx.lineTo(x + Math.cos(time * 0.7 + i) * 2, bottom);
      ctx.stroke();
    }

    const scanY = lerp(top, bottom, (cycle.raw * 9.4) % 1);
    const scanAlpha = alpha * (0.24 + 0.18 * Math.sin(time * 7) ** 2);
    const gradient = ctx.createLinearGradient(left, scanY, right, scanY);
    gradient.addColorStop(0, `rgba(${palette.cyan}, 0)`);
    gradient.addColorStop(0.5, `rgba(${palette.cyan}, ${scanAlpha})`);
    gradient.addColorStop(1, `rgba(${palette.cyan}, 0)`);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(left, scanY);
    ctx.lineTo(right, scanY);
    ctx.stroke();

    ctx.strokeStyle = `rgba(${palette.cyan}, ${alpha * 0.42})`;
    ctx.lineWidth = 1.15;
    const bx = bounds.x;
    const by = bounds.y;
    const br = bounds.x + bounds.w;
    const bb = bounds.y + bounds.h;
    const corners = [
      [bx, by, bx + corner, by, bx, by + corner],
      [br, by, br - corner, by, br, by + corner],
      [bx, bb, bx + corner, bb, bx, bb - corner],
      [br, bb, br - corner, bb, br, bb - corner],
    ];
    for (const [x1, y1, x2, y2, x3, y3] of corners) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x3, y3);
      ctx.stroke();
    }

    const count = state.width < 720 ? 92 : profile.cv ? 184 : 116;
    for (let i = 0; i < count; i++) {
      const segment = geometry.segments[i % geometry.segments.length];
      const seed = i + 11;
      const sourceX = lerp(left, right, hashUnit(seed * 1.7)) + Math.sin(time * 1.2 + seed) * 10;
      const sourceY = lerp(top, bottom, hashUnit(seed * 2.1)) + Math.cos(time * 1.1 + seed) * 8;
      const normal = (hashUnit(seed * 3.3) - 0.5) * 38;
      const boneT = hashUnit(seed * 4.7);
      const targetX = segment.ax + segment.dx * boneT + segment.nx * normal;
      const targetY = segment.ay + segment.dy * boneT + segment.ny * normal;
      const localAttract = smooth(attract - hashUnit(seed * 5.9) * 0.18);
      const vibration = (1 - localAttract) * 5 + 1.5;
      const x = lerp(sourceX, targetX, localAttract) + Math.sin(time * 2 + seed) * vibration;
      const y = lerp(sourceY, targetY, localAttract) + Math.cos(time * 1.7 + seed) * vibration;
      const dotAlpha = alpha * (0.08 + localAttract * 0.4 + hashUnit(seed * 7.1) * 0.18);
      const tone = i % 11 === 0 ? palette.amber : i % 4 === 0 ? palette.cyan : palette.paper;
      const size = 1 + localAttract * 1.2 + hashUnit(seed * 8.3) * 0.8;
      ctx.fillStyle = `rgba(${tone}, ${dotAlpha})`;
      ctx.fillRect(x, y, size, size);
    }

    const keyAlpha = alpha * smooth((cycle.raw - 0.06) / 0.045);
    if (keyAlpha > 0.01) {
      ctx.strokeStyle = `rgba(${palette.cyan}, ${keyAlpha * 0.62})`;
      ctx.lineWidth = 0.8;
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
        const extremity = i === 0 || i === 7 || i === 8 || i === 13 || i === 14;
        ctx.strokeStyle = extremity
          ? `rgba(${palette.amber}, ${keyAlpha * 0.72})`
          : `rgba(${palette.paper}, ${keyAlpha * 0.56})`;
        ctx.beginPath();
        ctx.arc(point[0], point[1], extremity ? 5 : 3.4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    if (w >= 780) {
      const conf = 0.18 + smooth((cycle.raw - 0.035) / 0.09) * 0.76;
      ctx.font = "10px SFMono-Regular, Menlo, Consolas, monospace";
      ctx.fillStyle = `rgba(${palette.cyan}, ${alpha * 0.72})`;
      ctx.fillText("POSE FIELD", bounds.x, bounds.y - 32);
      ctx.fillStyle = `rgba(${palette.paper}, ${alpha * 0.5})`;
      ctx.fillText(`CONF ${conf.toFixed(2)}`, bounds.x + 86, bounds.y - 32);
      ctx.fillText("15PT TRACK", bounds.x, bounds.y - 15);
    }
    ctx.restore();
  }

  function drawPoseOverlay(time, geometry, previousGeometry, cycle) {
    if (!profile.cv || cycle.body <= 0.08) return;
    const alpha = clamp(cycle.body * (0.2 + cycle.depositWindow * 0.1) * (1 - cycle.logoWeight * 0.12), 0, 0.3);
    if (alpha <= 0.012) return;
    const bounds = poseBounds(geometry);
    const corner = Math.min(34, bounds.w * 0.22, bounds.h * 0.18);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.strokeStyle = `rgba(${palette.cyan}, ${alpha * 0.36})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([7, 11]);
    for (let i = 1; i < 4; i++) {
      const y = bounds.y + (bounds.h * i) / 4 + Math.sin(time * 1.1 + i) * 2;
      ctx.beginPath();
      ctx.moveTo(bounds.x + 8, y);
      ctx.lineTo(bounds.x + bounds.w - 8, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    ctx.strokeStyle = `rgba(${palette.cyan}, ${alpha * 0.72})`;
    ctx.lineWidth = 1.25;
    const bx = bounds.x;
    const by = bounds.y;
    const br = bounds.x + bounds.w;
    const bb = bounds.y + bounds.h;
    const corners = [
      [bx, by, bx + corner, by, bx, by + corner],
      [br, by, br - corner, by, br, by + corner],
      [bx, bb, bx + corner, bb, bx, bb - corner],
      [br, bb, br - corner, bb, br, bb - corner],
    ];
    for (const [x1, y1, x2, y2, x3, y3] of corners) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x3, y3);
      ctx.stroke();
    }

    ctx.strokeStyle = `rgba(${palette.paper}, ${alpha * 0.18})`;
    ctx.lineWidth = 1.4;
    for (const [aName, bName] of bones) {
      const a = previousGeometry.points[aName];
      const b = previousGeometry.points[bName];
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    }

    ctx.strokeStyle = `rgba(${palette.cyan}, ${alpha})`;
    ctx.lineWidth = 0.72;
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
      const dx = point[0] - previous[0];
      const dy = point[1] - previous[1];
      const isExtremity = i === 0 || i === 7 || i === 8 || i === 13 || i === 14;
      const radius = isExtremity ? 5.6 : 3.8;
      ctx.strokeStyle = isExtremity
        ? `rgba(${palette.amber}, ${alpha * 0.92})`
        : `rgba(${palette.paper}, ${alpha * 0.72})`;
      ctx.lineWidth = isExtremity ? 1 : 0.8;
      ctx.beginPath();
      ctx.arc(point[0], point[1], radius + Math.sin(time * 1.9 + i) * 0.6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(${palette.paper}, ${alpha * 0.42})`;
      ctx.fillRect(point[0] - 1, point[1] - 1, 2, 2);

      ctx.strokeStyle = `rgba(${palette.cyan}, ${alpha * 0.24})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(previous[0], previous[1]);
      ctx.lineTo(point[0], point[1]);
      ctx.stroke();

      if (isExtremity) {
        ctx.strokeStyle = `rgba(${palette.amber}, ${alpha * 0.48})`;
        ctx.lineWidth = 0.9;
        const vectorLength = Math.hypot(dx, dy) || 1;
        const vectorScale = Math.min(3.4, 82 / vectorLength);
        ctx.beginPath();
        ctx.moveTo(point[0], point[1]);
        ctx.lineTo(point[0] + dx * vectorScale, point[1] + dy * vectorScale);
        ctx.stroke();
      }
    }

    if (state.width >= 780) {
      const head = geometry.points.head;
      ctx.fillStyle = `rgba(${palette.cyan}, ${alpha * 0.72})`;
      ctx.font = "10px SFMono-Regular, Menlo, Consolas, monospace";
      ctx.fillText("POSE FIELD 15PT", bounds.x + 6, bounds.y - 10);
      ctx.fillStyle = `rgba(${palette.paper}, ${alpha * 0.5})`;
      ctx.fillText("CONF .94", head[0] + 16, head[1] - 18);
    }
    ctx.restore();
  }

  function render(now, force = false) {
    const elapsed = staticMode ? 4700 : now - state.start;
    const time = elapsed / 1000;
    const cycle = cycleInfo(elapsed);
    const poseTime = time * 0.34 + Math.sin(time * 0.34) * 0.08;
    const pose = poseGeometry(currentPose(poseTime));
    const previousPose = poseGeometry(currentPose(poseTime - 0.16));

    updatePointerField(now);
    state.logoLevel = Math.max(state.logoLevel, cycle.logoTargetLevel);
    state.logoDensity = Math.max(state.logoDensity, cycle.logoTargetDensity);
    const logoEase = staticMode ? 1 : 0.105 + cycle.depositWindow * 0.035;
    state.logoDisplayLevel = lerp(state.logoDisplayLevel, state.logoLevel, logoEase);
    state.logoDisplayDensity = lerp(state.logoDisplayDensity, state.logoDensity, logoEase);
    setPhrase(cycle.phrase);
    drawBackground(time, cycle);
    if (!staticMode || force) updateMotionParticles(time, cycle, pose);
    updateLogoParticles(time, cycle);
    drawCalibrationField(time, pose, cycle);
    drawLogoParticles(time, cycle);
    drawBodyVolume(time, pose, cycle);
    drawMotionParticles(cycle);
    drawPoseOverlay(time, pose, previousPose, cycle);
  }

  function adaptToFrameCost(delta) {
    if (qualityName === "low" || staticMode) return;
    if (delta > 26) state.slowFrames += 1;
    else state.slowFrames = Math.max(0, state.slowFrames - 1);
    if (
      state.slowFrames > 18 &&
      (
        state.motionLimit > profiles.low.motionCount ||
        state.logoLimit > profiles.low.logoCount
      )
    ) {
      state.motionLimit = Math.max(profiles.low.motionCount, Math.floor(state.motionLimit * 0.78));
      state.logoLimit = Math.max(profiles.low.logoCount, Math.floor(state.logoLimit * 0.82));
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

  function setupPointerField() {
    if (staticMode || reduceMotion || coarsePointer) return;
    const hero = document.getElementById("hero") || canvas;
    const updateFromEvent = (event, type = "move") => {
      const rect = hero.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!inside) {
        state.pointer.active = false;
        state.pointer.targetStrength = 0;
        return;
      }
      const canvasRect = canvas.getBoundingClientRect();
      const x = clamp(event.clientX - canvasRect.left, 0, state.width);
      const y = clamp(event.clientY - canvasRect.top, 0, state.height);
      const now = performance.now();
      const travel = Math.hypot(x - state.pointer.lastWaveX, y - state.pointer.lastWaveY);
      const cadence = now - state.pointer.lastWaveAt;
      state.pointer.targetX = x;
      state.pointer.targetY = y;
      state.pointer.targetStrength = 1;
      state.pointer.active = true;
      state.pointer.lastMove = now;

      if (type === "press") {
        const velocityForce = 1.1 + clamp(travel / 260, 0, 0.22);
        pushFieldWave(x, y, velocityForce, now, "press");
        state.pointer.lastWaveX = x;
        state.pointer.lastWaveY = y;
        state.pointer.lastWaveAt = now;
      }
    };

    window.addEventListener("pointermove", (event) => {
      updateFromEvent(event, "move");
    }, { passive: true });

    window.addEventListener("pointerdown", (event) => {
      updateFromEvent(event, "press");
    }, { passive: true });

    window.addEventListener("pointerleave", () => {
      state.pointer.active = false;
      state.pointer.targetStrength = 0;
    }, { passive: true });
  }

  function setupEmbeddedScrollBridge() {
    if (!embeddedMode) return;
    window.addEventListener("wheel", (event) => {
      if (!window.parent || window.parent === window) return;
      event.preventDefault();
      window.parent.scrollBy({
        top: event.deltaY,
        left: event.deltaX,
        behavior: "auto",
      });
    }, { passive: false });
  }

  function setupLogoTargets() {
    state.logoTargets = sampledLogoTargets();
    if (!state.logoTargets.length) state.logoTargets = fallbackLogoTargets();
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
      [".hero-title span", 2.05],
      [".reveal-line", 2.22],
      [".hero-readout", 2.38],
      [".scroll-cue", 2.58],
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
  setupPointerField();
  setupEmbeddedScrollBridge();
  setupObserver();
  setupScrollReveals();
  if (staticMode) render(performance.now(), true);
})();
