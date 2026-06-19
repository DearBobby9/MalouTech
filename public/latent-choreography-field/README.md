# Latent Choreography Field

Standalone homepage prototype for MalouTech.

Concept:

1. A quiet field of fine particles drifts in the first viewport.
2. The particles gather around a short dance phrase.
3. A pose-tracking layer adds landmarks, confidence rings, motion vectors, and detection brackets.
4. A motion skeleton appears through particle density and faint trails.
5. The field tightens into the MalouTech mark.
6. The mark releases back into the moving body.
7. Text stays small so the first impression comes from the moving field.
8. Research, publication, mission, and contact sections open below the fold.

Open locally through Vite:

```bash
npm run dev
```

Then visit:

```text
http://localhost:5173/latent-choreography-field/
```

The prototype uses a self-contained canvas scene for the hero. GSAP handles text entrance and scroll reveal. The canvas pauses when the hero leaves the viewport and falls back to `hero-still.svg` for reduced-motion, low-power touch devices, and `?static` verification.
