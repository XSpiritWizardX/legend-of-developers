# Security Policy

## Reporting a vulnerability

Please do not open a public issue for an unpatched vulnerability, exposed credential, authentication bypass, or data-access problem. Use GitHub's private vulnerability reporting / Security Advisory flow for this repository when available.

Include the affected route or component, reproduction steps, impact, and any suggested mitigation. Do not include real credentials or production user data in the report.

## Security boundaries

The Flask application owns authentication, CSRF-aware session handling, user records, and cloud save persistence. Browser-local guest saves are not treated as a security boundary. Production secrets and database URLs must be supplied through deployment environment variables and must never be committed.

Changes affecting authentication, save ownership, CSRF behavior, database migrations, or production configuration require explicit tests and review in the pull request.

## Supported version

The actively maintained code on `main` is the supported version. Security fixes should be released as soon as validation is complete and called out in release notes.
