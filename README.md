# Aim Trainer

A small Next.js canvas aim trainer with three game modes:

- **Quick Play:** a fixed 60-second score challenge.
- **Survival:** an endless run with three lives.
- **Chaos:** an infinite escalating challenge with waves and an overload meter.

## Running locally

```bash
npm ci
npm run dev
```

## Useful checks

```bash
npm test
npm run lint
npm run build
```

## Gameplay

Hits earn points from four factors:

1. Base hit value
2. Centre precision
3. Reaction speed
4. Combo multiplier, capped at x2

Quick Play has a warm-up, a steady build, and a final rush. Survival adds targets and speed every 15 seconds. Chaos uses repeating ten-second build, surge, and breath waves while increasing target density and reducing reaction time.

Personal bests are stored in the browser with `localStorage`. No account or database is required.

## Architecture

```text
features/game/modes.ts
  Difficulty curves and mode rules.

features/game/model
  Pure rules for scoring, spawning, hit testing, runtime metrics, and pooling.

features/game/canvas
  Animation loop, Canvas 2D rendering, pointer input, and visual effects.

features/game/components
  React adapter and the player HUD.

features/results
  Results presentation and PDF export.
```

React controls menus, countdowns, modes, and results. The canvas engine owns active targets and frame-by-frame gameplay, so large Chaos rounds do not create a React component for every target.

## Performance safeguards

- Active Chaos targets are capped at 64.
- Target objects are reused through an object pool.
- Hit and miss effects use a fixed pool.
- HUD updates are limited to ten per second.
- Canvas pixel density is capped at 2.
- Target removal uses swap removal instead of `splice`.
- Reaction-time percentiles use a fixed histogram instead of an ever-growing attempt list.
