# River AI Source Study Notes

This directory mirrors the public River AI homepage as a study artifact. The snapshot is intended for visual inspection, shader reading, and pixel comparison.

## Public Snapshot

- Page: `https://river.ai/`
- Stylesheet: `https://river.ai/styles.css?v=43`
- Script: `https://river.ai/script.js?v=89`
- Static hero still: `https://river.ai/assets/hero-static.jpg`
- Fonts and icons referenced by the page are stored under `assets/`.

Source maps were unavailable. The delivered JavaScript is readable and heavily commented.

## Transferable Architecture

The homepage uses a short boot sequence:

1. Force scroll to the top.
2. Hide navigation, debug controls, and scroll cue during boot.
3. Start a full-viewport WebGL scene.
4. Render the canyon, river, clouds, sun, and particle fields in shader passes.
5. Type the hero headline and subline as DOM text.
6. Reveal navigation and scroll cue after the visual system stabilizes.
7. Fade hero text on scroll.
8. Transition into a cream editorial section.

## Visual Principles

- Treat the first viewport as an environment.
- Use hard terrain silhouettes to keep hierarchy clear.
- Use particle density to describe depth, water, cloud, and atmospheric layers.
- Keep product text outside the densest visual areas.
- Let motion encode the subject matter instead of adding decorative movement.

## MalouTech Mapping

For MalouTech, the same structure can become:

- Hero scene: AI art, generated human motion, and XR space in one procedural field.
- Visual language: pose skeletons, motion trails, camera frustums, model routes, and artifact particles.
- Research narrative: signal to motion model to appearance routing to XR artifact.
- Publications: real paper evidence in one section with clean thumbnails and links.
- Mission: nonprofit research position and collaboration principles.
- Contact: direct email and necessary social links.

## Production Boundary

This folder keeps the River snapshot isolated under `public/river-ai-replica/`. MalouTech production pages should use owned copy, assets, links, logo, and shader code derived from the learned architecture.

## Verification

`npm run verify:river` captures `river.ai` and the deployed GitHub Pages study copy at a matching viewport. It compares one full-page screenshot plus dense scroll samples. The default comparison uses `?riverStatic` because the live hero shader and footer water are time-based. Current threshold: full-page MAE <= `0.75`, full-frame MAE <= `0.75`, center-region MAE <= `0.75`.
