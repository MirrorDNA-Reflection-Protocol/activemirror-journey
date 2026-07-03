# Context Pack Skill

Use when starting or handing off Active Mirror product work.

## Inputs

- `.mirror/CONTEXT_PACK.yaml`
- `.mirror/TASK_CONTRACT.yaml`
- `.mirror/STATUS.md`
- `.mirror/PLAN.md`

## Output

- Run `npm run mirror:context`.
- Use the generated checked and unchecked scope before editing.

## Stop If

- The pack includes provider secrets, private vault material, or unrelated client work.
- A referenced file is missing.
