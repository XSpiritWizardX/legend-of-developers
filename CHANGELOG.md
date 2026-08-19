# Changelog

Notable product and engineering changes are recorded here. Releases use semantic version tags and GitHub generated release notes.

## Unreleased

### Engineering
- Add GitHub Actions quality gates for backend tests, frontend tests/lint/build, and Docker image verification.
- Add tag-driven GitHub Release automation.
- Add structured issue forms, pull-request checklist, dependency update automation, contribution guidance, security policy, and architecture/release documentation.

### Documentation
- Establish a recruiter-visible issue → branch → CI → PR → release workflow.

## Release policy

- **Patch** (`vX.Y.Z`): bug fixes, security fixes, small compatibility changes.
- **Minor** (`vX.Y.0`): backward-compatible gameplay or platform features.
- **Major** (`vX.0.0`): intentionally breaking save/API/platform changes.

See `docs/RELEASES.md` for the release checklist.
