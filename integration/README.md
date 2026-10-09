# Amana Cosmos — Integration Guide

Standalone Astro component to drop into `amana-agency/website`.

## Files

- `AmanaCosmos.astro` — the component (Three.js, particle system, scroll listener)

## Install

1. **Copy the component:**
   ```bash
   cp integration/AmanaCosmos.astro <website-repo>/src/components/AmanaCosmos.astro
   ```

2. **Ensure Three.js is installed:**
   ```bash
   cd <website-repo>
   npm install three
   npm install -D @types/three
   ```

3. **Mount in a page** (e.g., `src/pages/index.astro` or `src/layouts/Layout.astro`):
   ```astro
   ---
   import AmanaCosmos from '../components/AmanaCosmos.astro';
   ---
   <body>
     <AmanaCosmos />
     <main>...</main>
   </body>
   ```

## What it does

- Fixed canvas behind all content (`z-index: -1`, `pointer-events: none`)
- 6000 particles in 3 roles: dust nebulae (60%), flowing currents (35%), bright stars (5%)
- Two nebula centers anchor the field — violet (top-left) + pink (bottom-right)
- Streams flow between them with violet→pink gradient
- Scroll drives a subtle vertical parallax
- `prefers-reduced-motion` halves opacity and freezes time

## Tuning

Open the component and adjust these constants:

| Constant            | Default | Effect                                        |
|---------------------|---------|-----------------------------------------------|
| `PARTICLE_COUNT`    | 6000    | More = denser but slower                      |
| `material.size`     | 0.12    | Larger = chunkier dots                        |
| `material.opacity`  | 0.85    | Per-particle alpha                            |
| CSS `opacity`       | 0.65    | Whole-canvas fade against page background     |
| `mix-blend-mode`    | screen  | `screen` glows on dark, try `overlay` if bg is light |
| Camera `z`          | 28      | Further = field appears smaller               |

## Symbiosis with the existing `.particle-section` (animated A logo)

Because this canvas is global and behind all sections (`z-index: -1`), it does
not collide with the existing `.particle-section`. The "A" logo canvas is local
to its section and renders on top.

If you want the cosmos to fade out around the signature section (so the A
stands alone), add this CSS to your page:

```css
.particle-section { background: rgb(13, 11, 32); position: relative; z-index: 1; }
```

That section's solid background occludes the cosmos behind it for a clean
spotlight on the A.

## Performance notes

- 6000 particles × 60fps ≈ 360k position updates/sec — comfortable on mid mobile
- All math runs on CPU (Float32Array updates each frame). For higher counts,
  port the role logic into a vertex shader (TODO).
- Canvas does not capture pointer events, so it never blocks scroll/click.

## Scroll-driven extensions (if needed later)

Currently `scrollProg` only drives a subtle vertical parallax. To unlock more:

- **Density modulation**: hide particles when `scrollProg` is in a given band
  (e.g., dim cosmos around the A signature section).
- **Section-aware morph**: snap a fraction of particles to letter-formations
  ("Notre signature", "Services", "Souveraineté") when their section is in view.
- **Mouse interaction**: add a `mousemove` listener that gently attracts/repels
  nearby particles for a subtle interaction reward.

These are out-of-scope for v1 but easy follow-ups.
