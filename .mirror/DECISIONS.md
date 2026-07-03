# Active Mirror Decisions

## Durable Decisions

1. Active Mirror product source is `activemirror-journey`.
2. `active-mirror-site` is the live deploy/gateway bridge, not the starting point for new consumer UI work.
3. Consumer experience is chat-first and outcome-first.
4. Consumer copy must hide internal architecture unless the user asks how it works.
5. Privacy warnings should be placeholder helpers, not scolding blocks.
6. Artifact actions must create usable outputs, not explain how to create outputs.
7. Model/provider names stay out of consumer copy until routing and public policy are settled.
8. SWFI remains separate from Active Mirror product language, memory, and UI.
9. ActiveMirrorOS is the governed control-plane direction; the public app is the simple front door into that direction.

## Imported From MirrorOS Download Pack

1. Context is not memory.
2. Skills are procedural memory.
3. Agents need durable workflows, checkpoints, replay, approvals, and audit.
4. File exports must use artifact IDs and allowed roots, not raw paths.
5. Risky generated code/browser automation belongs in sandboxed execution.
6. No single judge is enough for high-risk evaluation.
7. Generated UI should become trusted components from validated payloads, not arbitrary model-defined HTML/JavaScript.

