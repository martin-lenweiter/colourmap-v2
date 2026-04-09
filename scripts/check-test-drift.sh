#!/usr/bin/env bash

# Assumptions:
# - This script compares HEAD against origin/${GITHUB_BASE_REF:-main}.
# - CI passes the PR body through TEST_DRIFT_PR_BODY, but local runs may omit it.
# - A violation exists when test files changed without a docs/specs/** update and without an active no-spec-impact declaration.
# - Commit messages in the diff range are treated as part of the declaration/bypass surface.
# - Unchecked PR-template checklist items do not count as active declarations.

set -euo pipefail

source "$(dirname "$0")/policy-pr-body.sh"

base_ref="origin/${GITHUB_BASE_REF:-main}"
diff_range="${base_ref}...HEAD"
pr_body="${TEST_DRIFT_PR_BODY:-}"

test_files=()
spec_changed=false

while IFS= read -r file; do
  [[ -z "${file}" ]] && continue

  if [[ "${file}" == docs/specs/** ]]; then
    spec_changed=true
  fi

  case "${file}" in
    *.test.ts|*.test.tsx) test_files+=("${file}") ;;
  esac
done < <(git diff --name-only "${diff_range}")

if [[ -z "${test_files[*]-}" ]]; then
  echo "OK: no test files changed."
  exit 0
fi

if [[ "${spec_changed}" == "true" ]]; then
  echo "OK: test changes were accompanied by a spec update."
  exit 0
fi

commit_messages=$(git log --format=%B "${diff_range}" 2>/dev/null || true)

if pr_body_has_active_token "${pr_body}" "no-spec-impact" \
  || grep -q "no-spec-impact" <<<"${commit_messages}"; then
  echo "OK: no-spec-impact declaration detected."
  exit 0
fi

echo "Violation: test files changed without a docs/specs update or no-spec-impact declaration:"
printf ' - %s\n' "${test_files[@]}"
exit 1
