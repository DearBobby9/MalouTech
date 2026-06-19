# River AI Homepage Motion Study

This folder is a local snapshot of the public `river.ai` homepage for motion and shader study.

Snapshot date: 2026-06-18

Mirrored public resources:

- `https://river.ai/`
- `https://river.ai/styles.css?v=43`
- `https://river.ai/script.js?v=89`
- `https://river.ai/assets/hero-static.jpg`
- public font, favicon, and touch-icon assets referenced by the page

The snapshot is useful for studying:

- WebGL canyon and river rendering
- halftone particle fields
- boot timing
- typed hero text
- delayed navigation reveal
- footer water interaction

Production MalouTech work should replace the River branding, copy, assets, links, and exact shader with an owned AI art, motion, and XR visual system.

Run from the project root with the normal dev server, or run a plain static server from `public/`:

```sh
cd public
python3 -m http.server 4188
```

Then open `http://127.0.0.1:4188/river-ai-replica/`.

## Pixel Check

Run the visual parity check against the live River page and the deployed GitHub Pages copy:

```sh
npm run verify:river
```

The script compares the static hero mode and the main downstream scroll positions. It reports mean absolute error for each viewport and fails when full-frame or center-region MAE exceeds `0.75`.
