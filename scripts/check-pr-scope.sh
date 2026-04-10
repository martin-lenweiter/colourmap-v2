#!/usr/bin/env bash

# Assumptions:
# - This script compares HEAD against origin/${GITHUB_BASE_REF:-main}.
# - PR scope is advisory only; CI should always pass while still surfacing size warnings.

set -euo pipefail

base_ref="origin/${GITHUB_BASE_REF:-main}"
diff_range="${base_ref}...HEAD"
changed_files=$(git diff --name-only "${diff_range}" | wc -l | tr -d ' ')
lines_summary=$(git diff --stat "${diff_range}" | tail -1)
changed_lines=$(awk '{print $4}' <<<"${lines_summary}")

if [[ -z "${changed_lines}" || ! "${changed_lines}" =~ ^[0-9]+$ ]]; then
  changed_lines=0
fi

warn_messages=()

if (( changed_files > 15 )); then
  warn_messages+=("changed files ${changed_files} > warn threshold 15")
fi
if (( changed_files > 25 )); then
  warn_messages+=("changed files ${changed_files} > strong warn threshold 25")
fi
if (( changed_lines > 500 )); then
  warn_messages+=("changed lines ${changed_lines} > warn threshold 500")
fi
if (( changed_lines > 1000 )); then
  warn_messages+=("changed lines ${changed_lines} > strong warn threshold 1000")
fi

if [[ ${#warn_messages[@]} -gt 0 ]]; then
  echo "WARNING: PR scope is above the recommended size:"
  printf ' - %s\n' "${warn_messages[@]}"
  echo "OK: policy-pr-scope is warning-only."
  exit 0
fi

echo "OK: PR scope is within policy thresholds."
