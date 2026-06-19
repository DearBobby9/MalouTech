# Latent Choreography Field

Standalone homepage prototype for MalouTech.

Concept:

1. A quiet field of fine particles drifts in the first viewport.
2. The particles gather around a short dance phrase.
3. A motion skeleton appears through particle density and faint trails.
4. The field tightens into the MalouTech mark.
5. The mark releases back into the moving body.
6. Text stays small so the first impression comes from the moving field.
7. Research, publication, mission, and contact sections open below the fold.

Open locally through Vite:

```bash
npm run dev
```

Then visit:

```text
http://localhost:5173/latent-choreography-field/
```

The prototype uses a self-contained canvas scene for the hero. GSAP handles text entrance and scroll reveal. The canvas pauses when the hero leaves the viewport and falls back to `hero-still.svg` for reduced-motion, low-power touch devices, and `?static` verification.
