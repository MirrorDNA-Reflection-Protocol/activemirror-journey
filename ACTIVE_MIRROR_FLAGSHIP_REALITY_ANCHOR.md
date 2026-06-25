# Active Mirror Flagship Reality Anchor

This redesign is anchored to the current buildable site, not an aspirational future stack.

## Current Reality

- Runtime: Vite + React + React Router + Tailwind
- Deploy model: static build to `dist/`, published via `gh-pages`
- Current browser workspace already exists at `/app`
- Current public flagship already exists as `Chetana`

## Buildable Spine In This Pass

- Reframe `/` around one clear flagship-led company story
- Add `/chetana` as the public wedge route
- Add `/platform` as the umbrella system route
- Rewrite `/trust` around limitations, proof, privacy stance, and review
- Rewrite `/pricing` around simple public / merchant / platform / enterprise tiers
- Keep the deeper ecosystem accessible below the flagship layer instead of leading with it

## Explicitly Deferred

These are real follow-on phases, not silently assumed present:

- Next.js App Router migration
- TypeScript conversion
- shadcn/ui adoption
- `@vercel/og` dynamic social card generation
- PostHog analytics and experiments
- Sentry instrumentation
- Formal Playwright screenshot test suite in the repo

## Content Guardrails

- Use conservative product claims already visible in the repo and site
- Treat `Chetana` as the first public action
- Frame the deeper stack under three verbs: verify, remember, govern
- Avoid turning the homepage into a catalog again

## Shipping Definition

This pass succeeds if a first-time visitor can understand:

1. what Active Mirror is
2. why Chetana is the clearest public entry
3. what the platform does under the hood
4. where to go next for trust, docs, or pricing
