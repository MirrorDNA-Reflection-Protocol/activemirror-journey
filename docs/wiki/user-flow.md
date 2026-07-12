# User Flow

Last checked: 2026-07-12.

## First Screen

The first screen should lead with:

```text
Bring the unfinished thing.
```

Primary paths:

- The input is primary and lets the user type directly without setup.
- `Set a private context` opens `/id` as a secondary path.
- `Load saved context` imports an Active Mirror setup JSON file.
- `Start with a move` offers five low-friction starts: `Make`, `Decide`, `Fix`,
  `Understand`, and `Talk`.
- `How this works` opens a short guided explanation with personality,
  not a technical product tour.

The first useful response is a working read: what was heard, a bounded
observation, a first draft, explicit `Challenge` and `Improve` actions, and an
`Evidence and boundary` disclosure. `Public draft` creates a reviewable draft;
it must never imply publication.

## Setup Flow

Route: `/id`

Current visible setup copy:

1. `Set it up.`
2. `Four taps. No account.`
3. `What are you here for?`
4. `What tone helps?`
5. `What should it skip?`
6. `What should it give you?`

The result screen says:

- `Ready.`
- `Start chat`
- `Keep a copy`
- `Saved on this device`

The preference rows should read like plain user choices, for example:

- `Help me get unstuck`
- `Keep it short`
- `Skip long answers`
- `Give me a next step`

Avoid label-style rows such as `Tone:` or `Here for:` on the result screen.

## Storage Boundary

Setup writes browser-local state through `src/lib/mirror-state.js`.

The downloadable file is `active-mirror-id.json`.

Do not claim this is a full account, cloud sync, permanent identity, or complete memory system.

## Chat Handoff

After setup, `Start chat` returns to `/app/` with a short setup-ready reflection and the chat input available.

The user should not have to understand the storage, model, gateway, or receipt machinery to begin.
