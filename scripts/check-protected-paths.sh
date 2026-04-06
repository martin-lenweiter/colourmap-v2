#!/usr/bin/env bash

# Assumptions:
# - This script compares HEAD against origin/${GITHUB_BASE_REF:-main}.
# - CI must fetch enough git history for the base ref to exist locally.
# - Local runs default to the main branch when GITHUB_BASE_REF is unset.
# - Protected-path detection is intentionally strict and exits non-zero when matches are found.

set -euo pipefail

base_ref="origin/${GITHUB_BASE_REF:-main}"
diff_range="${base_ref}...HEAD"

changed_files=()
while IFS= read -r file; do
  changed_files+=("${file}")
done < <(git diff --name-only "${diff_range}")

if [[ -z "${changed_files[*]-}" ]]; then
  echo "OK: no files changed relative to ${diff_range}."
  exit 0
fi

protected_patterns=(
  ".github/workflows/**"
  "AGENTS.md"
  "rules/**"
  "skills/**"
  "docs/product.md"
  "docs/specs/**"
  "rules/guardrails.md"
  "docs/guardrails-plan.md"
  "package.json"
  "bun.lock"
  "biome.json"
  "lefthook.yml"
  "vitest.config.ts"
  "next.config.ts"
  "drizzle/migrations/**"
  "lib/db/schema.ts"
)

matched_files=()

for file in "${changed_files[@]}"; do
  for pattern in "${protected_patterns[@]}"; do
    if [[ "${file}" == ${pattern} ]]; then
      matched_files+=("${file}")
      break
    fi
  done
done

if [[ -n "${matched_files[*]-}" ]]; then
  echo "WARNING: protected files changed. These paths require Lane B handling:"
  printf ' - %s\n' "${matched_files[@]}" | sort -u
  exit 1
fi

echo "OK: no protected paths changed."
