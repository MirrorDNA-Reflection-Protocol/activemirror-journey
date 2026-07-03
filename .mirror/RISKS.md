# Active Mirror Risks

## Product Risks

- Confusing users by explaining the system instead of giving them a useful first action.
- Making privacy controls feel like punishment.
- Overusing internal words such as kernel, route, receipt, vault, glyph, protocol, sovereign, and model worker on consumer screens.
- Overpromising owned memory/model behavior before implementation.
- Letting artifacts become advice rather than finished useful outputs.

## Engineering Risks

- Two-repo deploy path can hide stale live pages.
- GitHub Pages can report a successful build while the legacy Pages deployment remains stale or errored.
- Browser-local state can be cleared by the user/browser.
- Generated code/file features need sandbox and file export controls before public expansion.
- Local and hosted model routes need shared gates so identity and safety do not depend on model personality.

## Scope Risks

- SWFI/client work can contaminate Active Mirror product language.
- ActiveMirrorOS architecture can bloat the public front door if exposed too early.
- Research claims can become stale quickly; public current-market claims need fresh source checks.

## Mitigations

- Check the public bundle hash after every deploy.
- Run mobile and desktop browser smoke for the exact friction being fixed.
- Keep consumer copy short and normal.
- Promote only verified decisions into durable docs.
- Route current-market claims to source checks.

