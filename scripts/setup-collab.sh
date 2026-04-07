#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "== Collaboration Setup =="

if ! command -v bun >/dev/null 2>&1; then
  echo "FAIL: Bun is required but not installed."
  echo "Install Bun first, then run: bun install && bun run collab:setup"
  exit 1
fi

if [[ ! -d node_modules ]]; then
  echo "Installing dependencies..."
  bun install
fi

echo "Installing git hooks with lefthook..."
bunx lefthook install

echo "Verifying agent wiring..."
bash scripts/validate-agent-system.sh

echo
echo "== Claude Code =="
if command -v claude >/dev/null 2>&1; then
  echo "Claude Code is installed."
  echo "Recommended launch: claude --dangerously-skip-permissions"
  echo "Custom commands available: /feature, /fix, /verify, /review"
else
  echo "Claude Code not found. To install:"
  echo "  npm install -g @anthropic-ai/claude-code"
  echo "  claude  (run once to log in)"
fi

echo
echo "Setup complete."
echo "Next step: bun run collab:doctor"
