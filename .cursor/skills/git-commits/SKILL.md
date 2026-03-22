---
name: git-commits
description: Enforce Conventional Commits and repository pre-push validation. Use when creating commit messages, staging/committing code, or preparing to push.
---

# Git Commit Workflow

## Use this skill when

- A commit message needs to be generated.
- The user asks for commit-related guidance.
- You are about to push changes to the repository.

## Commit format

Use Conventional Commits:

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Accepted types:

- feat
- fix
- docs
- style
- refactor
- perf
- test
- build
- ci
- chore

Rules:

- type must be lowercase.
- use imperative description.
- include `BREAKING CHANGE:` only when needed.

## Suggested pre-push validation (Next.js/TypeScript stack)

- `npm run lint`
- `npm run format:check`
- `npx tsc --noEmit`
- `npm run test:run`
- `npm run build`
- For a single command, prefer `npm run check`.

## Commit and push sequence

- Review staged diff before commit (`git diff --staged`).
- Keep each commit scoped to one functional change.
- If the task was not explicitly requested by the user, ask before committing or pushing.

## Large changes

- For PR planning, avoid committing batches with >10 files or excessive scope in one atomic change unless requested.
