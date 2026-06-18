# River AI Public Source Notes

Observed public files:

- `https://river.ai/`
- `https://river.ai/styles.css?v=43`
- `https://river.ai/script.js?v=89`

Source maps were not available. The public JavaScript is readable and heavily commented, but it is still a delivered website asset rather than an explicitly licensed source repository.

## Transferable Architecture

The homepage is organized around a short boot state machine:

1. Force scroll to top.
2. Hide navigation and scroll cue.
3. Start a full-viewport procedural canvas scene.
4. Type the hero headline and subline in DOM text.
5. Reveal the scene behind the text.
6. Slide or fade the text depending on viewport.
7. Reveal navigation and scroll cue.
8. Fade hero text on scroll so it does not collide with navigation.

This pattern is more important than the exact shader. It can be rethemed by swapping the procedural field, copy, palette, and section content.

## Visible Behaviors To Preserve

- The first viewport feels like an environment, not a layout block.
- Text enters before the full scene becomes visually dense.
- Navigation appears after the page has established its mood.
- The scroll cue is small and late.
- The next cream section contrasts sharply with the blue hero.
- A tactile footer canvas rewards clicking water.

## What To Avoid Copying Directly

- River AI logo SVG paths.
- Exact long shader source.
- Exact copywriting.
- Static media assets.
- Full debug panel code.

## MalouTech Mapping

For MalouTech, this same pattern can become:

- Boot canvas: generated motion field, pose skeletons, XR frustums.
- Typed headline: `AI Art. Human Motion. XR Systems.`
- Scene reveal: signals split into motion and appearance routes.
- Navigation reveal: after the research field stabilizes.
- Second section: nonprofit research method or publication evidence.
- Footer canvas: motion wave or particle field instead of literal water.
