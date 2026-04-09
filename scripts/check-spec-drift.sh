#!/usr/bin/env bash

# Assumptions:
# - This script compares HEAD against origin/${GITHUB_BASE_REF:-main}.
# - CI passes the PR body through SPEC_PR_BODY, but local runs may omit it.
# - Behavior-changing code is any changed file under app/, components/, lib/, or pages/
#   except *.test.ts, *.test.tsx, *.md, and *.json files.
# - A docs/specs/** change satisfies the spec update requirement.
# - An active no-spec-impact declaration in SPEC_PR_BODY or any commit message in the diff range bypasses failure.
# - Unchecked PR-template checklist items do not count as active declarations.

set -euo pipefail

source "$(dirname "$0")/policy-pr-body.sh"

base_ref="origin/${GITHUB_BASE_REF:-main}"
diff_range="${base_ref}...HEAD"
pr_body="${SPEC_PR_BODY:-}"

behavior_files=()
spec_changed=false

while IFS= read -r file; do
  [[ -z "${file}" ]] && continue

  if [[ "${file}" == docs/specs/** ]]; then
    spec_changed=true
  fi

  case "${file}" in
    app/*|components/*|lib/*|pages/*)
      case "${file}" in
        *.test.ts|*.test.tsx|*.md|*.json) ;;
        *) behavior_files+=("${file}") ;;
      esac
      ;;
  esac
done < <(git diff --name-only "${diff_range}")

if [[ -z "${behavior_files[*]-}" ]]; then
  echo "OK: no behavior-changing files detected."
  exit 0
fi

if [[ "${spec_changed}" == "true" ]]; then
  echo "OK: behavior-changing files were accompanied by a spec update."
  exit 0
fi

commit_messages=$(git log --format=%B "${diff_range}" 2>/dev/null || true)

if pr_body_has_active_token "${pr_body}" "no-spec-impact" \
  || grep -q "no-spec-impact" <<<"${commit_messages}"; then
  echo "OK: no-spec-impact declaration detected."
  exit 0
fi

echo "Violation: behavior-changing files were modified without a docs/specs update or no-spec-impact declaration:"
printf ' - %s\n' "${behavior_files[@]}"
exit 1
