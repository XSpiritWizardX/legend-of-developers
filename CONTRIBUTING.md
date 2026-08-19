# Contributing

This repository uses an issue-first, pull-request workflow so changes remain reviewable and the engineering process is visible.

## Workflow

1. Open or link a GitHub issue with the problem, scope, and acceptance criteria.
2. Create a focused branch from `main` (`feat/...`, `fix/...`, `test/...`, `docs/...`, or `chore/...`).
3. Keep application behavior, tests, documentation, and migrations together when they change together.
4. Run the same checks used by CI before opening a PR.
5. Open a PR that links the issue, explains validation, and identifies release impact.
6. Merge only after required checks pass and review comments are resolved.

## Local quality checks

```bash
pytest -q
npm --prefix react-vite ci
npm --prefix react-vite test
npm --prefix react-vite run lint
npm --prefix react-vite run build
```

For deployment-related changes, also verify the Docker build and complete a focused gameplay/API smoke test.

## Definition of done

A change is complete when the behavior is implemented, automated coverage is added or updated, CI is green, user/developer documentation is current, migrations are included where required, and the PR states its release impact.

## Commit and PR scope

Prefer small, coherent commits and PRs. Avoid mixing unrelated refactors with feature work. Never commit secrets, `.env` files, production database URLs, or local database contents.
