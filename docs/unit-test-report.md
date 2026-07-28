# Unit Test Report

Run on July 28, 2026 with Python 3.9.4, pytest 8.3.4, and Jest 30.4.2.

## Test results

Command: `make test`

- pytest: 6 passed
- Jest: 5 passed
- Total: 11 passed, 0 failed, 0 skipped

## Coverage results

Command: `make coverage`

- Python application: 70% statement coverage
- Game-save API routes: 95% statement coverage
- JavaScript files loaded by the session reducer suite: 23.21% statement coverage
- Session reducer module: 30.23% statement coverage

pytest reports one SQLAlchemy 1.4 legacy API warning from `User.query.get`. It does
not fail the suite; SQLAlchemy is intentionally pinned to 1.4 by the application.
