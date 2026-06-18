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
    document.documentElement.style.setProperty("--hero-text-offset-x", `${(-25 * slide).toFixed(2)}vw`);
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

function initHero2DCanvas() {
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

function createHeroShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || "Shader compile failed");
  }
  return shader;
}

function createHeroProgram(gl, vertexSource, fragmentSource) {
  const program = gl.createProgram();
  gl.attachShader(program, createHeroShader(gl, gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, createHeroShader(gl, gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || "Program link failed");
  }
  return program;
}

function createGlyphTexture(gl) {
  const glyphs = " .:-=+*#%@";
  const cell = 48;
  const cols = glyphs.length;
  const rows = 1;
  const atlas = document.createElement("canvas");
  atlas.width = cols * cell;
  atlas.height = rows * cell;
  const atlasCtx = atlas.getContext("2d");
  atlasCtx.clearRect(0, 0, atlas.width, atlas.height);
  atlasCtx.fillStyle = "#fff";
  atlasCtx.textAlign = "center";
  atlasCtx.textBaseline = "middle";
  atlasCtx.font = "700 34px ui-monospace, SFMono-Regular, Menlo, monospace";

  for (let i = 0; i < glyphs.length; i += 1) {
    const col = i;
    const row = 0;
    atlasCtx.fillText(glyphs[i], col * cell + cell / 2, row * cell + cell / 2 + 1);
  }

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}

function initHeroWebGL() {
  const gl = heroCanvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
  });

  if (!gl) return false;

  const vertexSource = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragmentSource = `
    precision highp float;

    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_reveal;
    uniform sampler2D u_glyphs;

    const float GLYPH_COLS = 10.0;
    const float GLYPH_ROWS = 1.0;
    const float GLYPH_COUNT = 10.0;

    float saturate(float v) {
      return clamp(v, 0.0, 1.0);
    }

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amp = 0.5;
      for (int i = 0; i < 5; i++) {
        value += noise(p) * amp;
        p = p * 2.03 + vec2(17.7, 9.2);
        amp *= 0.5;
      }
      return value;
    }

    float riverCenter(float z, float t) {
      return 0.5
        + sin(z * 6.1 - t * 0.16) * 0.048
        + sin(z * 15.3 + t * 0.07) * 0.018
        + (fbm(vec2(z * 3.2, 2.7)) - 0.5) * 0.035;
    }

    float horizonAt(float x) {
      float bend = x - 0.5;
      return 0.245 + bend * bend * 0.23;
    }

    float leftWallEdge(float y) {
      float rise = pow(smoothstep(0.0, 0.62, y), 1.18);
      return 0.082 + rise * 0.52 + sin(y * 7.4 - 0.5) * 0.014;
    }

    float rightWallEdge(float y) {
      float fall = pow(smoothstep(0.0, 0.58, y), 0.86);
      return 0.982 - fall * 0.35 + sin(y * 6.0 + 0.7) * 0.016;
    }

    float wallUpper(float y) {
      return 1.0 - smoothstep(0.62, 0.92, y);
    }

    float riverbedGate(float y) {
      return smoothstep(0.54, 0.72, y);
    }

    float terrainHeight(vec2 p) {
      float large = fbm(p * vec2(1.7, 1.1) + vec2(3.0, 7.0));
      float mid = fbm(p * vec2(4.6, 3.2) + vec2(11.0, 2.0));
      float fine = fbm(p * vec2(13.0, 9.0));
      return large * 0.55 + mid * 0.32 + fine * 0.13;
    }

    vec3 skyColor(vec2 uv) {
      vec3 top = vec3(0.055, 0.205, 0.505);
      vec3 mid = vec3(0.42, 0.66, 0.68);
      vec3 low = vec3(0.058, 0.190, 0.455);
      vec3 color = mix(top, mid, smoothstep(0.12, 0.64, uv.y));
      color = mix(color, low, smoothstep(0.66, 1.0, uv.y));
      float glow = exp(-distance(uv, vec2(0.52, 0.5)) * 4.2);
      color += vec3(0.08, 0.13, 0.11) * glow;
      return color;
    }

    float glyphMask(vec2 local, float glyphIndex) {
      float index = clamp(floor(glyphIndex), 0.0, GLYPH_COUNT - 1.0);
      float col = mod(index, GLYPH_COLS);
      float row = floor(index / GLYPH_COLS);
      vec2 pad = vec2(0.08);
      vec2 safeLocal = mix(pad, 1.0 - pad, local);
      vec2 uv = (vec2(col, row) + safeLocal) / vec2(GLYPH_COLS, GLYPH_ROWS);
      return texture2D(u_glyphs, uv).a;
    }

    void main() {
      vec2 frag = gl_FragCoord.xy;
      vec2 uv = frag / u_resolution;
      uv.y = 1.0 - uv.y;

      vec3 color = skyColor(uv);
      float leftEdge = leftWallEdge(uv.y);
      float rightEdge = rightWallEdge(uv.y);
      float upper = wallUpper(uv.y);
      float leftWall = (1.0 - smoothstep(leftEdge - 0.032, leftEdge + 0.052, uv.x)) * upper;
      float rightWall = smoothstep(rightEdge - 0.05, rightEdge + 0.035, uv.x) * (1.0 - smoothstep(0.76, 1.0, uv.y));
      float betweenWalls = smoothstep(leftEdge - 0.02, leftEdge + 0.16, uv.x)
        * (1.0 - smoothstep(rightEdge - 0.15, rightEdge + 0.035, uv.x))
        * (1.0 - smoothstep(0.52, 0.70, uv.y));
      float throat = exp(-abs(uv.x - mix(leftEdge, rightEdge, 0.53)) / 0.22)
        * smoothstep(0.34, 0.62, uv.y)
        * (1.0 - smoothstep(0.56, 0.72, uv.y));
      float leftRim = exp(-abs(uv.x - leftEdge) / 0.024) * upper * smoothstep(0.015, 0.42, uv.y);
      float rightRim = exp(-abs(uv.x - rightEdge) / 0.026)
        * upper
        * smoothstep(0.08, 0.64, uv.y)
        * (1.0 - smoothstep(0.50, 0.68, uv.y));
      float wallTexture = fbm(uv * vec2(6.2, 4.4) + vec2(0.0, u_time * 0.025));
      color = mix(color, vec3(0.23, 0.23, 0.35), betweenWalls * 0.64);
      color = mix(color, vec3(0.045, 0.15, 0.32), leftWall * (0.90 + wallTexture * 0.08));
      color = mix(color, vec3(0.08, 0.24, 0.45), rightWall * (0.82 + wallTexture * 0.09));
      color = mix(color, vec3(0.33, 0.31, 0.40), throat * 0.28);
      color += vec3(0.30, 0.46, 0.50) * leftRim * 0.20;
      color += vec3(0.58, 0.76, 0.74) * rightRim * 0.17;

      vec2 sunP = vec2((uv.x - 0.468) * (u_resolution.x / u_resolution.y), uv.y - 0.428);
      float sunCore = smoothstep(0.043, 0.026, length(sunP));
      float sunGlow = exp(-dot(sunP, sunP) * 52.0) * betweenWalls;
      float sunHalo = exp(-dot(sunP, sunP) * 14.0) * betweenWalls;
      color = mix(color, vec3(1.0, 0.96, 0.78), sunCore * 0.92);
      color += vec3(0.92, 0.58, 0.34) * sunGlow * 0.42;
      color += vec3(0.42, 0.28, 0.25) * sunHalo * 0.18;

      float horizon = horizonAt(uv.x);
      float depthRaw = (uv.y - horizon) / (1.0 - horizon);
      float depth = saturate(depthRaw);
      float z = pow(depth, 1.27);

      float cellSize = 6.0;
      vec2 cell = floor(frag / cellSize);
      vec2 local = fract(frag / cellSize);
      vec2 cellCenter = (cell + 0.5) * cellSize / u_resolution;
      cellCenter.y = 1.0 - cellCenter.y;

      float cHorizon = horizonAt(cellCenter.x);
      float cDepthRaw = (cellCenter.y - cHorizon) / (1.0 - cHorizon);
      float cDepth = saturate(cDepthRaw);
      float cz = pow(cDepth, 1.27);
      float worldZ = cz * 1.18 + u_time * 0.055;
      float center = riverCenter(worldZ, u_time);
      float riverWidth = mix(0.0045, 0.122, pow(cz, 1.38));
      float wallSpan = mix(0.105, 0.44, pow(cz, 1.06));
      float dx = abs(cellCenter.x - center);
      float side = sign(cellCenter.x - center + 0.0001);

      float riverEdgeNoise = (fbm(vec2(worldZ * 10.0, side * 4.0 + u_time * 0.08)) - 0.5) * riverWidth * 0.28;
      float riverLimit = riverWidth + riverEdgeNoise;
      float riverCore = 1.0 - smoothstep(riverLimit * 0.10, riverLimit * 0.74, dx);
      float riverBody = 1.0 - smoothstep(riverLimit * 0.58, riverLimit * 1.04, dx);
      float flow = sin(worldZ * 135.0 - u_time * 7.4 + (cellCenter.x - center) * 34.0);
      float braid = sin(worldZ * 68.0 + (cellCenter.x - center) * 55.0 - u_time * 4.0);
      float riverNoise = fbm(vec2((cellCenter.x - center) * 42.0, worldZ * 32.0 - u_time * 2.1));
      float farFade = smoothstep(0.08, 0.44, cDepth);
      float bedGate = riverbedGate(cellCenter.y);
      float river = riverBody * (0.22 + 0.46 * riverNoise + 0.22 * smoothstep(-0.28, 0.95, flow) + 0.15 * smoothstep(0.2, 1.0, braid));
      river += riverCore * 0.18;
      river *= mix(0.34, 1.0, farFade);
      river *= mix(0.008, 1.0, bedGate);

      float wallStart = riverLimit * 1.05;
      float wallEnd = riverLimit + wallSpan;
      float wallBand = smoothstep(wallStart, wallStart + 0.018, dx) * (1.0 - smoothstep(wallEnd, wallEnd + 0.08, dx));
      float wallPos = saturate((dx - wallStart) / max(wallSpan, 0.001));
      float shelves = sin(worldZ * 72.0 + wallPos * 22.0 + side * 1.7 + fbm(vec2(worldZ * 8.0, wallPos * 3.2)) * 4.0);
      vec2 terrainP = vec2((cellCenter.x - center) / max(wallSpan, 0.001) * 1.8 + side * 2.2, worldZ * 3.2);
      float terrain = terrainHeight(terrainP);
      float terrainE = terrainHeight(terrainP + vec2(0.025, 0.0));
      float terrainN = terrainHeight(terrainP + vec2(0.0, 0.025));
      vec2 slope = vec2(terrain - terrainE, terrain - terrainN) * vec2(8.0, 5.0);
      float hillShade = clamp(0.58 + dot(normalize(vec3(slope, 1.0)), normalize(vec3(-0.45, 0.42, 0.78))) * 0.58, 0.12, 1.32);
      float selfShadow = smoothstep(0.18, 0.78, wallPos) * smoothstep(0.16, 0.92, cDepth) * (1.0 - hillShade);
      float topo = 1.0 - smoothstep(0.015, 0.042, abs(fract((terrain + worldZ * 0.32 + wallPos * 0.42) * 9.0) - 0.5));
      float reliefInk = smoothstep(0.48, 0.88, terrain) * smoothstep(0.12, 0.92, wallPos);
      float canyon = wallBand * (0.18 + 0.56 * terrain + topo * 0.18 + reliefInk * 0.14) * (0.62 + 0.38 * smoothstep(-0.35, 1.0, shelves)) * smoothstep(0.03, 0.9, cDepth);
      canyon *= mix(0.76, 1.24, hillShade);
      canyon *= mix(0.08, 1.0, bedGate);

      float rimLeft = exp(-abs(dx - riverLimit) / (0.0028 + cz * 0.0045));
      float ridge = exp(-abs(dx - (riverLimit + wallSpan * 0.74)) / (0.004 + cz * 0.008));
      float skyDust = smoothstep(cHorizon - 0.08, cHorizon + 0.26, cellCenter.y)
        * (1.0 - smoothstep(0.58, 1.0, cellCenter.y))
        * fbm(vec2(cellCenter.x * 11.0, cellCenter.y * 8.0 + u_time * 0.07));
      float dust = skyDust * (1.0 - smoothstep(0.16, 0.42, dx)) * 0.24;
      dust *= mix(0.10, 1.0, bedGate);

      vec2 cSunP = vec2((cellCenter.x - 0.468) * (u_resolution.x / u_resolution.y), cellCenter.y - 0.428);
      float sunGlyphField = exp(-dot(cSunP, cSunP) * 42.0) * (0.40 + fbm(cellCenter * vec2(32.0, 22.0)) * 0.60);
      float topCloud = smoothstep(0.52, 0.66, cellCenter.x)
        * (1.0 - smoothstep(0.95, 1.0, cellCenter.x))
        * (1.0 - smoothstep(0.11, 0.20, cellCenter.y))
        * fbm(vec2(cellCenter.x * 25.0, cellCenter.y * 38.0 + u_time * 0.03));
      float upperMist = (sunGlyphField * 0.52 + topCloud * 0.34) * (1.0 - bedGate);

      float cLeftEdge = leftWallEdge(cellCenter.y);
      float cRightEdge = rightWallEdge(cellCenter.y);
      float cUpper = wallUpper(cellCenter.y);
      float cLeftWall = (1.0 - smoothstep(cLeftEdge - 0.035, cLeftEdge + 0.055, cellCenter.x)) * cUpper;
      float cRightWall = smoothstep(cRightEdge - 0.05, cRightEdge + 0.04, cellCenter.x) * (1.0 - smoothstep(0.76, 1.0, cellCenter.y));
      float cBetweenWalls = smoothstep(cLeftEdge - 0.02, cLeftEdge + 0.16, cellCenter.x)
        * (1.0 - smoothstep(cRightEdge - 0.15, cRightEdge + 0.035, cellCenter.x))
        * (1.0 - smoothstep(0.52, 0.70, cellCenter.y));
      float topStructureMask = saturate(cLeftWall * 0.85 + cRightWall * 0.68 + cBetweenWalls * 0.36);

      float groundGate = smoothstep(cHorizon - 0.02, cHorizon + 0.06, cellCenter.y) * smoothstep(0.035, 0.22, cDepth);
      float amount = max(max(river * 1.1, canyon * 0.82), dust);
      amount = max(amount, upperMist);
      amount += (rimLeft * 0.44 + ridge * 0.18) * groundGate * mix(0.02, 1.0, bedGate);
      amount *= smoothstep(cHorizon - 0.035, cHorizon + 0.055, cellCenter.y);
      amount *= 1.0 - topStructureMask * (1.0 - bedGate) * 0.82;
      amount += cBetweenWalls * (1.0 - bedGate) * 0.012;
      amount += (sunGlyphField * 0.24 + topCloud * 0.72) * (1.0 - bedGate);
      float mound = exp(-abs(cellCenter.x - 0.52) / mix(0.22, 0.70, bedGate));
      amount *= mix(0.22 + mound * 0.78, 1.0, smoothstep(0.34, 0.82, river));
      float particleGate = smoothstep(0.18, 0.86, amount + hash(cell + floor(u_time * vec2(2.0, 5.0))) * 0.42);
      amount *= particleGate;
      amount *= u_reveal;

      float jitter = hash(cell + floor(u_time * vec2(6.0, 3.0)));
      float glyphIndex = floor(clamp(pow(saturate(amount), 0.42) * (GLYPH_COUNT - 1.0) + jitter * 1.6, 0.0, GLYPH_COUNT - 1.0));
      float glyph = glyphMask(local, glyphIndex);
      float blurA = glyphMask(local + vec2(0.06, 0.0), glyphIndex);
      float blurB = glyphMask(local + vec2(-0.06, 0.0), glyphIndex);
      float blurC = glyphMask(local + vec2(0.0, 0.06), glyphIndex);
      float blurD = glyphMask(local + vec2(0.0, -0.06), glyphIndex);
      float softGlyph = mix(glyph, (glyph + blurA + blurB + blurC + blurD) * 0.2, 0.31);
      float bloomGlyph = (
        glyphMask(local + vec2(0.14, 0.0), glyphIndex) +
        glyphMask(local + vec2(-0.14, 0.0), glyphIndex) +
        glyphMask(local + vec2(0.0, 0.14), glyphIndex) +
        glyphMask(local + vec2(0.0, -0.14), glyphIndex)
      ) * 0.25;
      float dot = smoothstep(0.38, 0.15, length(local - 0.5)) * 0.035;
      float ink = saturate((softGlyph * 1.34 + dot) * amount);
      float glowInk = bloomGlyph * amount * 0.23;

      vec3 riverColor = mix(vec3(0.58, 0.80, 0.84), vec3(0.91, 0.99, 0.96), saturate(river * 0.74));
      vec3 canyonColor = mix(vec3(0.31, 0.49, 0.58), vec3(0.74, 0.86, 0.79), saturate(canyon + ridge));
      vec3 dustColor = vec3(0.74, 0.86, 0.84);
      vec3 inkColor = mix(canyonColor, riverColor, smoothstep(0.16, 0.48, river));
      inkColor = mix(inkColor, dustColor, smoothstep(0.02, 0.16, dust) * (1.0 - river));
      inkColor = mix(inkColor, vec3(0.98, 0.88, 0.68), smoothstep(0.06, 0.42, upperMist) * (1.0 - bedGate));

      color -= vec3(0.03, 0.08, 0.13) * wallBand * smoothstep(0.18, 0.9, cDepth) * (0.18 + wallPos * 0.32 + selfShadow * 0.52);
      color = mix(color, inkColor, ink);
      color += glowInk * mix(vec3(0.21, 0.45, 0.52), vec3(0.72, 0.91, 0.86), smoothstep(0.2, 0.72, river));
      color += vec3(0.28, 0.36, 0.32) * rimLeft * groundGate * u_reveal * (0.2 + 0.55 * riverBody) * mix(0.03, 1.0, bedGate);
      color -= vec3(0.04, 0.08, 0.16) * smoothstep(0.77, 1.0, length(uv - vec2(0.5, 0.5)));

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  let program;
  try {
    program = createHeroProgram(gl, vertexSource, fragmentSource);
  } catch (error) {
    console.warn("[river-study] WebGL hero unavailable", error);
    return true;
  }

  const positions = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positions);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );

  const glyphTexture = createGlyphTexture(gl);
  const aPosition = gl.getAttribLocation(program, "a_position");
  const uResolution = gl.getUniformLocation(program, "u_resolution");
  const uTime = gl.getUniformLocation(program, "u_time");
  const uReveal = gl.getUniformLocation(program, "u_reveal");
  const uGlyphs = gl.getUniformLocation(program, "u_glyphs");

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
    gl.viewport(0, 0, width, height);
  }

  function draw(now) {
    if (now - lastDraw < frameInterval) {
      requestAnimationFrame(draw);
      return;
    }
    lastDraw = now;

    const elapsed = now - heroState.startedAt;
    const t = elapsed * 0.001;
    heroState.reveal = prefersReduced ? 1 : smooth((elapsed - 2550) / 1700);

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, positions);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, glyphTexture);
    gl.uniform1i(uGlyphs, 0);
    gl.uniform2f(uResolution, width, height);
    gl.uniform1f(uTime, t);
    gl.uniform1f(uReveal, heroState.reveal);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    typeText(now);
    if (elapsed > 1550) showChrome();
    requestAnimationFrame(draw);
  }

  size();
  window.addEventListener("resize", size);
  requestAnimationFrame(draw);
  return true;
}

function initHeroCanvas() {
  if (!prefersReduced && initHeroWebGL()) return;
  initHero2DCanvas();
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
