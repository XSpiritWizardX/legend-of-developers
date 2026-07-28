.PHONY: test test-python test-javascript coverage

test: test-python test-javascript

test-python:
	python -m pytest

test-javascript:
	npm --prefix react-vite test

coverage:
	python -m pytest --cov=app --cov-report=term-missing
	npm --prefix react-vite run test:coverage
