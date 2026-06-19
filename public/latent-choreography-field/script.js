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
    logoTargets: [],
    logoReady: false,
    pointer: { x: -999, y: -999, active: false },
    phrase: "drift",
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
    {
      head: [0.5, -0.36],
      neck: [0.5, -0.18],
      spine: [0.5, 0.12],
      lShoulder: [0.36, -0.14],
      rShoulder: [0.64, -0.14],
      lElbow: [0.18, 0.12],
      rElbow: [0.82, 0.12],
      lHand: [0.1, 0.32],
      rHand: [0.9, 0.32],
      lHip: [0.42, 0.24],
      rHip: [0.58, 0.24],
      lKnee: [0.34, 0.5],
      rKnee: [0.66, 0.5],
      lFoot: [0.2, 0.7],
      rFoot: [0.8, 0.7],
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

  function logoPoint(point, jitter = 0) {
    const w = state.width;
    const h = state.height;
    const isMobile = w < 720;
    const scale = Math.min(w, h) * (isMobile ? 0.36 : 0.34);
    const centerX = w * (isMobile ? 0.58 : 0.62);
    const centerY = h * (isMobile ? 0.46 : 0.45);
    return [
      centerX + point[0] * scale + jitter,
      centerY + point[1] * scale + jitter * 0.36,
    ];
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

    pushCircle(0.52, 260);
    pushCircle(0.38, 190);
    pushLine(-0.32, 0.02, 0.32, 0.02, 170);
    pushLine(0, 0.02, 0, 0.46, 130);
    pushLine(-0.5, -0.18, -0.36, 0.08, 90);
    pushLine(0.5, -0.18, 0.36, 0.08, 90);
    return targets;
  }

  function sampleLogoTargets(image) {
    const size = 512;
    const offscreen = document.createElement("canvas");
    offscreen.width = size;
    offscreen.height = size;
    const sampleCtx = offscreen.getContext("2d", { willReadFrequently: true });
    if (!sampleCtx) return fallbackLogoTargets();

    sampleCtx.clearRect(0, 0, size, size);
    sampleCtx.drawImage(image, 0, 0, size, size);
    const pixels = sampleCtx.getImageData(0, 0, size, size).data;
    const targets = [];
    const step = 4;

    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        const i = (y * size + x) * 4;
        const alpha = pixels[i + 3];
        const visible = alpha > 34 && (pixels[i] + pixels[i + 1] + pixels[i + 2]) > 96;
        if (!visible) continue;
        targets.push([(x / size - 0.5) * 1.18, (y / size - 0.5) * 1.18]);
      }
    }

    return targets.length > 300 ? targets : fallbackLogoTargets();
  }

  function loadLogoTargets() {
    state.logoTargets = fallbackLogoTargets();
    state.logoReady = true;

    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      try {
        state.logoTargets = sampleLogoTargets(image);
      } catch (error) {
        state.logoTargets = fallbackLogoTargets();
      }
      state.logoReady = true;
    };
    image.onerror = () => {
      state.logoTargets = fallbackLogoTargets();
      state.logoReady = true;
    };
    image.src = "../assets/brand/malou-mark.svg";
  }

  function buildParticles() {
    const rand = mulberry32(8721);
    const area = state.width * state.height;
    const base = coarsePointer ? 2800 : 9200;
    const target = staticMode ? 2600 : Math.floor(area / (coarsePointer ? 190 : 118));
    const count = clamp(target, coarsePointer ? 2200 : base, coarsePointer ? 5200 : 13200);

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
        logoIndex: Math.floor(rand() * 5000),
        logoJitter: (rand() - 0.5) * 3.2,
        phraseOffset: (rand() - 0.5) * 0.16,
        offset: (rand() - 0.5) * (band < 0.88 ? 15 : 48),
        affinity: band < 0.78 ? 1 : band < 0.94 ? 0.6 : 0.18,
        logoAffinity: band < 0.82 ? 1 : band < 0.96 ? 0.58 : 0.22,
        radius: 0.13 + rand() * (coarsePointer ? 0.66 : 0.46),
        alpha: 0.07 + rand() * 0.28,
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
    scanner.addColorStop(0, `rgba(${palette.paper}, ${0.1 + cycleData.body * 0.035 + cycleData.logo * 0.045})`);
    scanner.addColorStop(0.26, `rgba(${palette.cyan}, ${0.06 + cycleData.body * 0.035 + cycleData.logo * 0.04})`);
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
    const loop = 28000;
    const raw = (elapsed % loop) / loop;
    const gather = smooth((raw - 0.08) / 0.16);
    const logoIn = smooth((raw - 0.58) / 0.1);
    const logoOut = smooth((raw - 0.8) / 0.1);
    const logo = clamp(logoIn * (1 - logoOut), 0, 1);
    const follow = clamp(smooth((raw - 0.42) / 0.12) * (1 - smooth((raw - 0.66) / 0.08)), 0, 1);
    const release = clamp(smooth((raw - 0.82) / 0.08) * (1 - smooth((raw - 0.94) / 0.06)), 0, 1);
    const returnDance = smooth((raw - 0.9) / 0.08);
    const body = clamp(Math.max(gather * (1 - logo * 0.94), returnDance), 0, 1);
    const logoHold = logo * (1 - release * 0.86);
    const flow = 1 - clamp(body * 0.5 + logoHold * 0.94, 0, 0.94);
    const phrase = raw < 0.24
      ? "drift"
      : raw < 0.38
        ? "gather"
        : raw < 0.58
          ? "dance"
          : raw < 0.7
            ? "trace"
            : raw < 0.82
            ? "mark"
              : raw < 0.94
                ? "release"
                : "dance";
    return { raw, body, follow, logo, logoHold, release, flow, phrase };
  }

  function drawMotionHints(pose, prevPose, cycleData) {
    const { body, follow, logoHold } = cycleData;
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
      const alpha = (0.022 * body + 0.052 * follow) * (1 - logoHold * 0.72);
      ctx.strokeStyle = `rgba(${palette.paper}, ${alpha})`;
      ctx.lineWidth = 0.8 + follow * 0.55;
      ctx.beginPath();
      ctx.moveTo(pa[0], pa[1]);
      ctx.quadraticCurveTo((a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5, pb[0], pb[1]);
      ctx.stroke();

      ctx.strokeStyle = `rgba(${palette.cyan}, ${(0.032 * body + 0.074 * follow) * (1 - logoHold * 0.76)})`;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    }
    ctx.restore();
  }

  function poseBounds(pose) {
    const points = Object.values(pose).map(posePoint);
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const [x, y] of points) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }

    const pad = Math.min(state.width, state.height) * 0.055;
    return {
      x: minX - pad,
      y: minY - pad,
      width: maxX - minX + pad * 2,
      height: maxY - minY + pad * 2,
    };
  }

  function drawCornerBox(bounds, alpha) {
    const x = bounds.x;
    const y = bounds.y;
    const w = bounds.width;
    const h = bounds.height;
    const corner = Math.min(w, h) * 0.14;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = `rgba(${palette.cyan}, ${0.18 * alpha})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(x, y + corner);
    ctx.lineTo(x, y);
    ctx.lineTo(x + corner, y);
    ctx.moveTo(x + w - corner, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + corner);
    ctx.moveTo(x + w, y + h - corner);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w - corner, y + h);
    ctx.moveTo(x + corner, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + h - corner);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawCvLabel(text, x, y, alpha, color = palette.paper) {
    if (state.width < 720) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = `rgba(${color}, ${alpha})`;
    ctx.font = "10px SFMono-Regular, Menlo, Consolas, monospace";
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function drawCvPoseOverlay(time, pose, prevPose, cycleData) {
    const { body, follow, logoHold, release } = cycleData;
    const alpha = clamp((body * 0.32 + follow * 0.78) * (1 - logoHold * 0.96) * (1 - release * 0.72), 0, 1);
    if (alpha <= 0.045) return;

    const bounds = poseBounds(pose);
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
    const vectorKeys = ["lHand", "rHand", "lFoot", "rFoot", "head"];

    drawCornerBox(bounds, alpha);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (let i = 0; i < landmarkKeys.length; i++) {
      const key = landmarkKeys[i];
      const [x, y] = posePoint(pose[key]);
      const pulse = 0.68 + 0.32 * Math.sin(time * 2.1 + i * 0.9);
      const confidence = 0.72 + 0.22 * Math.sin(time * 0.8 + i * 1.7);
      const ring = 3.4 + confidence * 2.2 + follow * 1.4;
      const tone = i % 5 === 0 ? palette.amber : palette.cyan;

      ctx.strokeStyle = `rgba(${tone}, ${(0.2 + confidence * 0.22) * alpha})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(x, y, ring * pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = `rgba(${palette.paper}, ${0.24 * alpha + confidence * 0.22 * alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, 1.7 + follow * 0.8, 0, Math.PI * 2);
      ctx.fill();

      if (state.width >= 720 && (i === 0 || i === 7 || i === 8 || i === 13 || i === 14)) {
        ctx.fillStyle = `rgba(${palette.cyan}, ${0.28 * alpha})`;
        ctx.font = "9px SFMono-Regular, Menlo, Consolas, monospace";
        ctx.fillText(String(i + 1).padStart(2, "0"), x + 8, y - 7);
      }
    }

    for (const key of vectorKeys) {
      const [x, y] = posePoint(pose[key]);
      const [px, py] = posePoint(prevPose[key]);
      const vx = (x - px) * 3.2;
      const vy = (y - py) * 3.2;

      ctx.strokeStyle = `rgba(${palette.amber}, ${0.18 * alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(x + vx, y + vy);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x + vx, y + vy, 2.2, 0, Math.PI * 2);
      ctx.stroke();
    }

    const scanY = bounds.y + bounds.height * (0.42 + Math.sin(time * 1.4) * 0.18);
    ctx.strokeStyle = `rgba(${palette.cyan}, ${0.1 * alpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bounds.x, scanY);
    ctx.lineTo(bounds.x + bounds.width, scanY);
    ctx.stroke();
    ctx.restore();

    const frame = String(Math.floor((cycleData.raw * 280) % 280)).padStart(3, "0");
    drawCvLabel(`CV POSE TRACK 03  FRAME ${frame}`, bounds.x, bounds.y - 12, 0.34 * alpha, palette.cyan);
    drawCvLabel("15 LANDMARKS  CONF 0.92", bounds.x + bounds.width - 178, bounds.y + bounds.height + 18, 0.26 * alpha);
  }

  function updateParticles(time, cycleData, pose) {
    const w = state.width;
    const h = state.height;
    const pointerActive = state.pointer.active && !coarsePointer;
    const { body, follow, logoHold, release } = cycleData;
    const targets = state.logoTargets;

    for (const particle of state.particles) {
      const current = flowAt(particle.x, particle.y, time, particle.seed);
      let dx = current[0] * cycleData.flow;
      let dy = current[1] * cycleData.flow;

      const target = boneTarget(pose, particle.bone, particle.boneT, particle.offset * (1 - follow * 0.34));
      const pull = body * particle.affinity * (0.026 + follow * 0.012 + particle.radius * 0.004);
      dx += (target[0] - particle.x) * pull;
      dy += (target[1] - particle.y) * pull;

      if (logoHold > 0.01) {
        const logoTarget = targets[particle.logoIndex % targets.length];
        const mark = logoPoint(logoTarget, particle.logoJitter);
        const logoPull = logoHold * particle.logoAffinity * (0.074 + particle.radius * 0.008);
        dx += (mark[0] - particle.x) * logoPull;
        dy += (mark[1] - particle.y) * logoPull;
      }

      if (release > 0.01) {
        const centerX = w * (w < 720 ? 0.58 : 0.62);
        const centerY = h * (w < 720 ? 0.46 : 0.45);
        const vx = particle.x - centerX;
        const vy = particle.y - centerY;
        const dist = Math.hypot(vx, vy) || 1;
        const burst = release * (0.82 + particle.logoAffinity * 0.86);
        dx += (vx / dist) * burst + Math.cos(time * 1.6 + particle.seed) * release * 0.34;
        dy += (vy / dist) * burst + Math.sin(time * 1.4 + particle.seed) * release * 0.34;
      }

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

      const damping = 0.89 - logoHold * 0.05;
      const response = 0.11 + logoHold * 0.04 + release * 0.05;
      particle.vx = particle.vx * damping + dx * response;
      particle.vy = particle.vy * damping + dy * response;
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -18) particle.x = w + 18;
      if (particle.x > w + 18) particle.x = -18;
      if (particle.y < -18) particle.y = h + 18;
      if (particle.y > h + 18) particle.y = -18;
    }
  }

  function drawParticles(time, cycleData) {
    const { body, follow, logoHold, release } = cycleData;
    const isMobile = state.width < 720;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const particle of state.particles) {
      const shimmer = 0.72 + 0.28 * Math.sin(time * 1.8 + particle.seed);
      const form = Math.max(body, logoHold);
      const alpha = particle.alpha * shimmer * (0.5 + form * 0.82 + follow * 0.18) * (1 + release * 0.12);
      const r = particle.radius * (isMobile ? 1.08 : 1) * (1 + form * particle.affinity * 0.24 + logoHold * 0.34);
      ctx.fillStyle = `rgba(${particle.tone}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawSoftContours(time, cycleData) {
    const { body, logoHold, release } = cycleData;
    const w = state.width;
    const h = state.height;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let c = 0; c < 5; c++) {
      ctx.lineWidth = 0.55 + c * 0.06;
      const tone = c === 3 ? palette.cyan : c === 4 ? palette.amber : palette.paper;
      ctx.strokeStyle = `rgba(${tone}, ${(0.03 + body * 0.026 + release * 0.024) * (1 - logoHold * 0.62)})`;
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

  function drawLogoConstellation(cycleData) {
    const { logoHold, release } = cycleData;
    if (logoHold <= 0.02 || !state.logoTargets.length || release > 0.18) return;

    const alpha = logoHold * Math.max(0, 1 - release * 4);
    const step = Math.max(1, Math.ceil(state.logoTargets.length / (state.width < 720 ? 780 : 1300)));
    const pointRadius = state.width < 720 ? 0.75 : 0.62;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < state.logoTargets.length; i += step) {
      const target = state.logoTargets[i];
      const [x, y] = logoPoint(target, Math.sin(i * 0.17) * 0.6);
      const tone = i % 17 === 0 ? palette.cyan : i % 23 === 0 ? palette.amber : palette.paper;
      ctx.fillStyle = `rgba(${tone}, ${0.055 + alpha * 0.22})`;
      ctx.beginPath();
      ctx.arc(x, y, pointRadius * (0.75 + alpha * 0.7), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function setPhrase(text) {
    if (!phaseReadout || text === state.phrase) return;
    state.phrase = text;
    phaseReadout.textContent = text;
  }

  function render(now, force = false) {
    const elapsed = staticMode ? 20300 : now - state.start;
    const time = elapsed / 1000;
    const cycleData = cycleInfo(elapsed);
    const cycle = cycleData.raw;
    const poseTime = cycle * 2.45 + Math.sin(time * 0.28) * 0.08;
    const pose = currentPose(poseTime);
    const prevPose = currentPose(poseTime - 0.18);

    setPhrase(cycleData.phrase);
    drawAtmosphere(time, cycleData);
    drawSoftContours(time, cycleData);
    drawMotionHints(pose, prevPose, cycleData);
    if (!staticMode || force) updateParticles(time, cycleData, pose);
    drawParticles(time, cycleData);
    drawCvPoseOverlay(time, pose, prevPose, cycleData);
    drawLogoConstellation(cycleData);
  }

  function loop(now) {
    if (!state.visible) {
      state.running = false;
      return;
    }
    const elapsed = now - state.start;
    const targetGap = elapsed < 16000 ? 1000 / 38 : 1000 / 28;
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

  loadLogoTargets();
  resize();
  setupGsap();
  setupObserver();
  if (staticMode) render(performance.now(), true);
})();
