# Release Process

Releases are intentionally visible in GitHub so the project shows how features move from backlog to shipped software.

## Before tagging

1. Link the change to an issue and merge it through a pull request.
2. Confirm the CI workflow is green on `main`.
3. Update `CHANGELOG.md` for notable user-facing or engineering changes.
4. Confirm database migrations are forward-safe when schema changed.
5. Complete a focused production smoke test for gameplay, auth, and saves when affected.

## Versioning

Use semantic version tags: `vMAJOR.MINOR.PATCH`.

- Patch: compatible fixes, security fixes, documentation corrections with release significance.
- Minor: backward-compatible gameplay/platform features.
- Major: intentionally breaking API/save/platform behavior.

## Publishing

Create and push an annotated tag from the intended `main` commit. `.github/workflows/release.yml` reruns the core automated quality gates and creates a GitHub Release with generated notes only if verification passes.

## Deployment

GitHub Release creation documents the software version; deployment is a separate concern. Verify the configured production service after release and record any deployment-specific remediation in an issue or follow-up PR.
