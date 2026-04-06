#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

failures=0

pass() {
  printf 'PASS %s\n' "$1"
}

fail() {
  printf 'FAIL %s\n' "$1"
  failures=$((failures + 1))
}

section() {
  printf '\n== %s ==\n' "$1"
}

section "Tooling"

if command -v bun >/dev/null 2>&1; then
  pass "bun is installed"
else
  fail "bun is missing"
fi

if [[ -d node_modules ]]; then
  pass "dependencies are installed"
else
  fail "node_modules is missing; run bun install"
fi

section "Hooks"

if [[ -f .git/hooks/pre-commit ]]; then
  pass "pre-commit hook exists"
else
  fail "pre-commit hook missing; run bun run collab:setup"
fi

if [[ -f .git/hooks/pre-push ]]; then
  pass "pre-push hook exists"
else
  fail "pre-push hook missing; run bun run collab:setup"
fi

section "Agent Wiring"

if bash scripts/validate-agent-system.sh >/tmp/colourmap-agent-system-check.$$ 2>&1; then
  pass "agent instruction wiring is valid"
else
  fail "agent instruction wiring check failed"
  cat /tmp/colourmap-agent-system-check.$$
fi
rm -f /tmp/colourmap-agent-system-check.$$

section "Branch Safety"

current_branch="$(git branch --show-current 2>/dev/null || true)"

if [[ -z "$current_branch" ]]; then
  fail "not on a git branch"
elif [[ "$current_branch" == "main" ]]; then
  fail "currently on main; create a branch before working"
else
  pass "currently on branch: $current_branch"
fi

section "Guide"

if [[ -f docs/collaboration.md ]]; then
  pass "plain-language collaboration guide exists"
else
  fail "docs/collaboration.md is missing"
fi

printf '\n'

if [[ "$failures" -eq 0 ]]; then
  echo "SAFE: local collaboration guardrails look active."
  exit 0
fi

echo "UNSAFE: fix the failures above before working with agents."
exit 1
