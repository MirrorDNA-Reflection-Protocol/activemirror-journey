# Active Mirror Canonical Site Source

This repo is the canonical editable source for the public Active Mirror app
experience.

## Role

- Build the product surface users touch first: `/`, `/mirror`, `/start`,
  `/privacy`, and `/terms`.
- Keep the homepage usable as the demo: one real input, one reflected output,
  follow-up questions, and a path into MirrorSeed.
- Do not expose provider or model names in consumer-facing UI.
- Do not log prompt text, file names, private notes, receipts, or user content.

## Deployment Flow

1. Edit and test here: `/Users/mirror-pro/repos/activemirror-journey`.
2. Run `npm run build`.
3. Copy the generated `dist/` bundle into
   `/Users/mirror-pro/repos/active-mirror-site/public/app/`.
4. In `/Users/mirror-pro/repos/active-mirror-site`, run
   `npm run build && npm run copy:audit`.
5. Deploy/push from `/Users/mirror-pro/repos/active-mirror-site`.

## Gateway Contract

The app calls `https://gateway.activemirror.ai/v1/mirror/create`.
The gateway/kernel contract lives in:

`/Users/mirror-pro/repos/active-mirror-site/worker/KERNEL.md`

If the app needs a new response field or visual kind, update that contract first.
