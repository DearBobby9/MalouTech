#!/usr/bin/env node
import { execFile, spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { get } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";

const REMOTE_URL = process.env.RIVER_REMOTE_URL || "https://river.ai/?riverStatic&pixelVerify=1";
const LOCAL_URL =
  process.env.RIVER_LOCAL_URL ||
  "https://dearbobby9.github.io/MalouTech/river-ai-replica/?riverStatic&pixelVerify=1";
const PORT = Number(process.env.RIVER_CDP_PORT || 9260);
const VIEWPORT = { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false };
const SCROLL_STEP = Number(process.env.RIVER_SCROLL_STEP || 550);
const FULL_MAE_LIMIT = Number(process.env.RIVER_FULL_MAE_LIMIT || 0.75);
const CENTER_MAE_LIMIT = Number(process.env.RIVER_CENTER_MAE_LIMIT || 0.75);
const FULL_PAGE_MAE_LIMIT = Number(process.env.RIVER_FULL_PAGE_MAE_LIMIT || 0.75);

function chromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ].filter(Boolean);
  const found = candidates.find((path) => existsSync(path));
  if (!found) {
    throw new Error("Chrome not found. Set CHROME_PATH to a Chrome executable.");
  }
  return found;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requestJson(url, method = "GET") {
  return new Promise((resolve, reject) => {
    const req = get(url, { method }, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error(data || error.message));
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

async function waitForCdp() {
  const deadline = Date.now() + 12000;
  while (Date.now() < deadline) {
    try {
      await requestJson(`http://127.0.0.1:${PORT}/json/version`);
      return;
    } catch {
      await wait(200);
    }
  }
  throw new Error(`Chrome CDP did not open on port ${PORT}`);
}

async function openPage(url) {
  const target = await requestJson(
    `http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`,
    "PUT",
  );
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data.toString());
    if (!msg.id || !pending.has(msg.id)) return;
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(JSON.stringify(msg.error)));
    else resolve(msg.result);
  });
  await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const callId = ++id;
      pending.set(callId, { resolve, reject });
      ws.send(JSON.stringify({ id: callId, method, params }));
    });
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Network.setCacheDisabled", { cacheDisabled: true });
  await send("Emulation.setDeviceMetricsOverride", VIEWPORT);
  await send("Page.navigate", { url });
  return { ws, send };
}

async function captureAt(page, y, outputBase) {
  await page.send("Runtime.evaluate", { expression: `window.scrollTo(0, ${y}); undefined;` });
  await wait(850);
  const info = await page.send("Runtime.evaluate", {
    expression: `(() => {
      const canvas = document.querySelector("#asciiRiver");
      const gl = canvas && (canvas.getContext("webgl2") || canvas.getContext("webgl"));
      const still = document.querySelector("#heroStill");
      const de = document.documentElement;
      return {
        url: location.href,
        scrollY,
        bodyClass: document.body.className,
        doc: [de.clientWidth, de.clientHeight, de.scrollWidth, de.scrollHeight],
        glError: gl ? gl.getError() : null,
        stillComplete: !!still && still.complete,
        headline: document.querySelector("#heroHeadlineLive")?.textContent || ""
      };
    })()`,
    returnByValue: true,
  });
  const screenshot = await page.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
  });
  writeFileSync(`${outputBase}.png`, Buffer.from(screenshot.data, "base64"));
  writeFileSync(`${outputBase}.json`, JSON.stringify(info.result.value, null, 2));
  return info.result.value;
}

async function pageInfo(page) {
  const info = await page.send("Runtime.evaluate", {
    expression: `(() => {
      const de = document.documentElement;
      const canvas = document.querySelector("#asciiRiver");
      const gl = canvas && (canvas.getContext("webgl2") || canvas.getContext("webgl"));
      return {
        scrollY,
        bodyClass: document.body.className,
        doc: [de.clientWidth, de.clientHeight, de.scrollWidth, de.scrollHeight],
        maxScrollY: Math.max(0, de.scrollHeight - innerHeight),
        glError: gl ? gl.getError() : null,
        title: document.title
      };
    })()`,
    returnByValue: true,
  });
  return info.result.value;
}

async function captureFullPage(page, outputBase) {
  await page.send("Runtime.evaluate", { expression: "window.scrollTo(0, 0); undefined;" });
  await wait(850);
  const info = await pageInfo(page);
  const screenshot = await page.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: true,
  });
  writeFileSync(`${outputBase}.png`, Buffer.from(screenshot.data, "base64"));
  writeFileSync(`${outputBase}.json`, JSON.stringify(info, null, 2));
  return info;
}

function runPython(args) {
  return new Promise((resolve, reject) => {
    execFile("python3", args, { encoding: "utf8" }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || stdout || error.message));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

async function compareImages(a, b) {
  const script = `
from PIL import Image, ImageChops, ImageStat
import json, sys
a = Image.open(sys.argv[1]).convert("RGB")
b = Image.open(sys.argv[2]).convert("RGB")
regions = {
  "full": (0, 0, 1440, 1100),
  "viewport": (0, 0, 1425, 1100),
  "center": (180, 160, 1240, 940),
  "right_scrollbar": (1425, 0, 1440, 1100),
}
out = {}
for name, box in regions.items():
  diff = ImageChops.difference(a.crop(box), b.crop(box))
  stat = ImageStat.Stat(diff)
  out[name] = {
    "mae": sum(stat.mean) / 3.0,
    "rms": sum(stat.rms) / 3.0,
  }
print(json.dumps(out))
`;
  const scriptPath = join(tmpdir(), `river-compare-${process.pid}.py`);
  writeFileSync(scriptPath, script);
  try {
    return JSON.parse(await runPython([scriptPath, a, b]));
  } finally {
    rmSync(scriptPath, { force: true });
  }
}

async function compareFullPageImages(a, b) {
  const script = `
from PIL import Image, ImageChops, ImageStat
import json, sys
a = Image.open(sys.argv[1]).convert("RGB")
b = Image.open(sys.argv[2]).convert("RGB")
w = min(a.width, b.width)
h = min(a.height, b.height)
regions = {
  "full_page": (0, 0, w, h),
  "page_without_scrollbar": (0, 0, min(1425, w), h),
}
out = {"size": [a.width, a.height, b.width, b.height]}
for name, box in regions.items():
  diff = ImageChops.difference(a.crop(box), b.crop(box))
  stat = ImageStat.Stat(diff)
  out[name] = {
    "mae": sum(stat.mean) / 3.0,
    "rms": sum(stat.rms) / 3.0,
  }
print(json.dumps(out))
`;
  const scriptPath = join(tmpdir(), `river-full-compare-${process.pid}.py`);
  writeFileSync(scriptPath, script);
  try {
    return JSON.parse(await runPython([scriptPath, a, b]));
  } finally {
    rmSync(scriptPath, { force: true });
  }
}

function scrollPoints(maxScrollY) {
  const points = new Set([0, maxScrollY]);
  for (let y = 0; y < maxScrollY; y += SCROLL_STEP) points.add(y);
  return [...points].sort((a, b) => a - b);
}

async function main() {
  const profile = mkdtempSync(join(tmpdir(), "river-pixel-cdp-"));
  const outDir = mkdtempSync(join(tmpdir(), "river-pixel-out-"));
  const chrome = spawn(chromePath(), [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    "--disable-background-networking",
    "--disable-sync",
    "--disable-extensions",
    "--no-first-run",
    `--user-data-dir=${profile}`,
    "about:blank",
  ], { stdio: "ignore" });

  let failed = false;
  try {
    await waitForCdp();
    const remote = await openPage(REMOTE_URL);
    const local = await openPage(LOCAL_URL);
    await wait(7600);

    const remoteFullBase = join(outDir, "remote-full-page");
    const localFullBase = join(outDir, "local-full-page");
    const remotePageInfo = await captureFullPage(remote, remoteFullBase);
    const localPageInfo = await captureFullPage(local, localFullBase);
    const fullPageDiff = await compareFullPageImages(
      `${remoteFullBase}.png`,
      `${localFullBase}.png`,
    );
    const fullPageMae = fullPageDiff.page_without_scrollbar.mae;
    if (
      remotePageInfo.glError !== 0 ||
      localPageInfo.glError !== 0 ||
      fullPageMae > FULL_PAGE_MAE_LIMIT
    ) {
      failed = true;
    }
    console.log(
      `fullPage size=${fullPageDiff.size.join("/")} mae=${fullPageMae.toFixed(4)} gl=${remotePageInfo.glError}/${localPageInfo.glError}`,
    );

    const maxScrollY = Math.min(remotePageInfo.maxScrollY, localPageInfo.maxScrollY);
    const points = scrollPoints(maxScrollY);
    const rows = [];
    for (const y of points) {
      const remoteBase = join(outDir, `remote-${y}`);
      const localBase = join(outDir, `local-${y}`);
      const remoteInfo = await captureAt(remote, y, remoteBase);
      const localInfo = await captureAt(local, y, localBase);
      const diff = await compareImages(`${remoteBase}.png`, `${localBase}.png`);
      const row = {
        y,
        scrollY: [remoteInfo.scrollY, localInfo.scrollY],
        glError: [remoteInfo.glError, localInfo.glError],
        fullMae: diff.full.mae,
        centerMae: diff.center.mae,
      };
      rows.push(row);
      const bad =
        row.glError.some((value) => value !== 0) ||
        row.fullMae > FULL_MAE_LIMIT ||
        row.centerMae > CENTER_MAE_LIMIT;
      if (bad) failed = true;
      console.log(
        `y=${y} scroll=${row.scrollY.join("/")} fullMae=${row.fullMae.toFixed(4)} centerMae=${row.centerMae.toFixed(4)} gl=${row.glError.join("/")}`,
      );
    }

    remote.ws.close();
    local.ws.close();
    if (failed) {
      console.error(
        `Pixel verification failed. Limits: full <= ${FULL_MAE_LIMIT}, center <= ${CENTER_MAE_LIMIT}`,
      );
      process.exitCode = 1;
    }
  } finally {
    chrome.kill("SIGTERM");
    await wait(500);
    if (!chrome.killed) chrome.kill("SIGKILL");
    rmSync(profile, { recursive: true, force: true });
    rmSync(outDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
