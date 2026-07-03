# File Export Registry

Status: design stub. No public downloadable file export is active from this registry.

## Rule

Active Mirror must not let a model create raw download authority.

Allowed future export shape:

```yaml
artifact_export:
  artifact_id: art_0001
  stored_path: sandbox_artifacts/report.pdf
  allowed_root: sandbox_artifacts/
  public_name: report.pdf
  content_type: application/pdf
  hash: sha256:pending
  signed_url: false
  expires_after_minutes: 60
  audited: true
```

## Required Checks Before Activation

- Canonicalize the path.
- Reject path traversal.
- Reject absolute user-supplied paths.
- Reject symlink escape.
- Enforce allowed root.
- Validate content type.
- Scan for secrets.
- Log every export.
- Require approval for files that include private, client, or source-sensitive content.

## Current Exports

None.

