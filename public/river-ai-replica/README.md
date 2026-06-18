# River AI Homepage Motion Study

This is a local static prototype that studies the public river.ai homepage interaction pattern.

It recreates the main observed behaviors with original code:

- full-screen blue hero
- projected particle river / canyon field
- typed headline and subline
- text slide on desktop after the type-in
- delayed nav and scroll cue reveal
- cream editorial mission section
- stack layer hover interaction
- footer water canvas with click ripples

It does not copy River AI's private source, shader source, logo SVG, or media assets.

Run with the project dev server and open `/river-ai-replica/`, or run a plain
static server from `public/`:

```sh
cd public
python3 -m http.server 4188
```

Then open `http://127.0.0.1:4188/river-ai-replica/`.
