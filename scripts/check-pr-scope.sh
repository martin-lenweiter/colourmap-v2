#!/usr/bin/env bash

# Assumptions:
# - This script compares HEAD against origin/${GITHUB_BASE_REF:-main}.
# - CI passes the PR body through PR_BODY, but local runs may omit it.
# - A LARGE_PR_APPROVED token in PR_BODY or any commit message in the diff range bypasses failure thresholds only.
# - Warning thresholds are always reported even when the bypass token is present.

set -euo pipefail

base_ref="origin/${GITHUB_BASE_REF:-main}"
diff_range="${base_ref}...HEAD"
pr_body="${PR_BODY:-}"

changed_files=$(git diff --name-only "${diff_range}" | wc -l | tr -d ' ')
lines_summary=$(git diff --stat "${diff_range}" | tail -1)
changed_lines=$(awk '{print $4}' <<<"${lines_summary}")

if [[ -z "${changed_lines}" || ! "${changed_lines}" =~ ^[0-9]+$ ]]; then
  changed_lines=0
fi

commit_messages=$(git log --format=%B "${diff_range}" 2>/dev/null || true)

approved=false
if grep -q "LARGE_PR_APPROVED" <<<"${pr_body}"; then
  approved=true
elif grep -q "LARGE_PR_APPROVED" <<<"${commit_messages}"; then
  approved=true
fi

warn_messages=()
fail_messages=()

if (( changed_files > 15 )); then
  warn_messages+=("changed files ${changed_files} > warn threshold 15")
fi
if (( changed_files > 25 )); then
  fail_messages+=("changed files ${changed_files} > fail threshold 25")
fi
if (( changed_lines > 500 )); then
  warn_messages+=("changed lines ${changed_lines} > warn threshold 500")
fi
if (( changed_lines > 1000 )); then
  fail_messages+=("changed lines ${changed_lines} > fail threshold 1000")
fi

if [[ ${#warn_messages[@]} -gt 0 ]]; then
  echo "WARNING: PR scope is above the recommended size:"
  printf ' - %s\n' "${warn_messages[@]}"
fi

if [[ ${#fail_messages[@]} -gt 0 ]]; then
  if [[ "${approved}" == "true" ]]; then
    echo "WARNING: PR scope exceeds fail thresholds, but LARGE_PR_APPROVED bypass is present:"
    printf ' - %s\n' "${fail_messages[@]}"
    exit 0
  fi

  echo "Violation: PR scope exceeds policy thresholds:"
  printf ' - %s\n' "${fail_messages[@]}"
  exit 1
fi

echo "OK: PR scope is within policy thresholds."

