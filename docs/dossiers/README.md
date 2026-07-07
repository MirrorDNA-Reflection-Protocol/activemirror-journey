# Active Mirror Dossiers

Status: canonical build packets for scoped Active Mirror work.

A dossier is the file an agent should read before touching a task, build, route,
or handoff. It should contain enough context to act without rebuilding the whole
history from chat.

## Use A Dossier When

- changing the public front door, setup flow, chat loop, artifact behavior, or deploy path;
- moving work between `activemirror-journey` and `active-mirror-site`;
- adding a new feature slice, guard, receipt, or user-facing claim;
- handing work to another agent, model, thread, or future session.

## Rules

- One dossier per bounded slice.
- Name the exact repo, files, routes, and checks.
- State what is not in scope.
- Put bad news and limits in the packet, not only in chat.
- Do not include secrets, provider keys, private vault exports, or SWFI/client work.
- If a claim needs fresh verification, mark it unchecked.

## Active Dossiers

- [Active Mirror Front Door](./active-mirror-front-door.md)
- [Wiki And Continuity](./wiki-and-continuity.md)
- [Model Challenge Contract](./model-challenge-contract.md)
- [Offline Online Owned AI Position](./offline-online-owned-ai-position.md)
- [AMOS Proof Layer Intake](./amos-proof-layer-intake.md)
- [Decision Reason Mapper](./decision-reason-mapper.md)
- [Evolution Control Plane](./evolution-control-plane.md)
- [Context And Coordination Layer](./context-coordination-layer.md)
- [Memory Skill Layer](./memory-skill-layer.md)
- [Synthetic Continuity Boundary](./synthetic-continuity-boundary.md)
- [Governed Agent OS](./governed-agent-os.md)
- [AMOS Cognitive Mesh](./amos-cognitive-mesh.md)

## Template

Start from [TEMPLATE.md](./TEMPLATE.md).

## Required Check

Run:

```bash
npm run guard:dossiers
```
