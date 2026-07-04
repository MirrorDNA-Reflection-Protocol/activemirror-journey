# Language Guide

Status: current consumer-facing language guide.

## Good Consumer Language

Use short, normal phrases:

- `What do you want?`
- `Start here`
- `Already have one?`
- `Set it up`
- `Saved on this device`
- `Start chat`
- `Keep a copy`
- `Use placeholders for anything private`
- `Make one small version and test it`

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
