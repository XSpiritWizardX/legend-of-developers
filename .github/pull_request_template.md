## Summary

Describe the user-facing or engineering change and why it is needed.

## Linked issue

Closes #

## Validation

- [ ] Backend tests pass (`pytest -q`)
- [ ] Frontend tests pass (`npm test`)
- [ ] Frontend lint passes (`npm run lint`)
- [ ] Frontend production build passes (`npm run build`)
- [ ] Docker image builds when deployment behavior is affected
- [ ] Manual gameplay/API smoke test completed when appropriate

## Review checklist

- [ ] No secrets, credentials, or local database files are included
- [ ] Schema changes include a migration
- [ ] New behavior has automated coverage or an explanation for why it cannot
- [ ] README/docs/changelog are updated when behavior or workflow changes
- [ ] Screenshots/video are attached for meaningful UI/gameplay changes

## Release impact

State whether this is a patch, feature/minor, breaking/major, or no-release change.
