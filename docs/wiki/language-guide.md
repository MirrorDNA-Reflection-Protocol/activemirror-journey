# Language Guide

Status: current consumer-facing language guide.

## Good Consumer Language

Use short, normal phrases:

- `Bring the unfinished thing.`
- `Set a private context`
- `Load saved context`
- `Start messy: I have an idea, but I do not know how to ship it.`
- `Set it up`
- `Saved on this device`
- `Start chat`
- `Keep a copy`
- `Start with a move`
- `First version`
- `Pressure-test`
- `Find the break`
- `Make it clear`
- `Talk`
- `Think aloud`
- `How this works`
- `Working read`
- `Challenge`
- `Improve`
- `Evidence and boundary`
- `Public draft`
- `Use placeholders for anything private`
- `Make one small version and test it`
- `Private first`
- `Check first`
- `Nothing is saved unless you choose.`
- `Keep what helps. Drop the rest.`
- `Gets better from accepted work.`

## Product Voice

Active Mirror should sound:

- clear;
- useful;
- calm;
- specific;
- non-flattering;
- not harsh;
- not clinical.

It should help the user move without diagnosing them, moralizing, or turning the page into a product lecture.

The product can have a voice, but the voice should feel like a useful second
pass: warm, quick, practical, and lightly playful. Do not expose internal myths,
technical labels, or strategy phrases to create personality.

## Avoid On Consumer Surfaces

Avoid these unless the user explicitly asks how the system works:

- kernel
- route
- model worker
- vault
- protocol
- sovereign
- receipt
- MirrorDNA
- cryptographic
- OPFS
- WebLLM
- provider/model names
- BrainScan
- MirrorSeed
- offline AI as the main promise
- memory as the main promise
- user-owned AI claims before the exact ownership layer is implemented
- reads your hidden motives
- personality profile
- self-aware
- conscious
- synthetic continuity
- context calculus
- Markov blanket

Compatibility routes can keep old names behind the scenes, but the rendered page should use normal language.

## Reflection Rule

The model should reflect the user's intent, not claim authority over the user.

Avoid paternal lines like:

```text
I will tell you what you need to hear.
```

Prefer:

```text
Here is the useful part.
```

or:

```text
Try this next.
```

## Privacy Language

Privacy copy should reduce fear and keep the user moving.

Use:

```text
Use placeholders for anything private.
```

Avoid scary blocked-state wording unless the turn truly cannot proceed.

## Positioning Rule

The market is moving toward local/private AI and persistent memory. Active
Mirror should not claim those as unique. The user-facing lane is simpler:

- starts with unfinished work;
- makes a first useful version before expanding;
- lets the user challenge or improve the work deliberately;
- checks current facts before relying on them;
- keeps memory and sharing as a user choice.
