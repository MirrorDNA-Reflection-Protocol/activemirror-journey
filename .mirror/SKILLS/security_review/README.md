# Security Review Skill

Use before file export, dependency, deploy, network, auth, or model-route changes.

## Checks

- Run `npm run guard:mirror`.
- Run `npm run guard:redaction`.
- Check `.mirror/FILE_EXPORT_REGISTRY.md` before any downloadable artifact work.
- Create an approval request before risky or irreversible actions.

## Stop If

- A raw secret, private key, unsafe path, or unapproved dependency appears.
