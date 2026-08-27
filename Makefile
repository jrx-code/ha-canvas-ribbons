# Canvas Ribbons Background — Build & Publish
#
# Usage:
#   make test     Run tests locally
#   make push     Push to Forgejo (origin) and GitHub

SHELL := /bin/bash
.SHELLFLAGS := -euo pipefail -c

# ---------------------------------------------------------------------------
# test: run tests locally
# ---------------------------------------------------------------------------
.PHONY: test
test:
	node canvas-ribbons.test.js

# ---------------------------------------------------------------------------
# push: main branch to both remotes. CI is GitHub Actions (.github/workflows/
# validate.yml, HACS validation) — there is no local pipeline to poll for.
# GitLab CE (git.example.com) is retired; Forgejo (origin) has no Actions
# runner configured for this repo.
# ---------------------------------------------------------------------------
.PHONY: push
push:
	git push origin main
	git push github main
