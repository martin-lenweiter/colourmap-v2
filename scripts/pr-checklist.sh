#!/usr/bin/env bash

set -euo pipefail

base_ref="${GITHUB_BASE_REF:-main}"
diff_range="origin/${base_ref}...HEAD"

has_ui_changes=false
has_protected_changes=false
has_test_changes=false
changed_files=()
routes=()

protected_patterns=(
  ".github/workflows/"
  "AGENTS.md"
  "rules/"
  "skills/"
  "docs/product.md"
  "docs/specs/"
  "docs/guardrails-plan.md"
  "package.json"
  "bun.lock"
  "package-lock.json"
  "biome.json"
  "lefthook.yml"
  "vitest.config.ts"
  "next.config.ts"
  "drizzle/migrations/"
  "lib/db/schema.ts"
  "app/api/auth/"
  "lib/auth"
  "supabase/"
  "vercel.json"
  ".env"
  ".env.local"
  ".env.example"
)

while IFS= read -r file; do
  changed_files+=("${file}")
done < <(git diff --name-only "${diff_range}")

if ((${#changed_files[@]} > 0)); then
  for file in "${changed_files[@]}"; do
    if [[ "${file}" == app/* || "${file}" == components/* ]]; then
      has_ui_changes=true
      if [[ "${file}" == app/* ]]; then
        route="${file}"
        route="${route#app}"
        route="${route%/page.tsx}"
        route="${route%/layout.tsx}"
        route="${route%/loading.tsx}"
        route="${route%/error.tsx}"
        route="${route%/template.tsx}"
        route="${route%/default.tsx}"
        route="${route%/route.ts}"
        route="${route%/not-found.tsx}"
        route="${route%/page.ts}"
        route="${route%/layout.ts}"
        route="${route%/loading.ts}"
        route="${route%/error.ts}"
        route="${route%/template.ts}"
        route="${route%/default.ts}"
        route="${route%/route.ts}"
        route="${route%/not-found.ts}"
        route="$(printf '%s' "${route}" | sed -E 's@/\([^)]*\)@/@g; s@/\[[^]]+\]@/:param@g; s@/+@/@g')"
        if [[ -z "${route}" ]]; then
          route="/"
        fi
        routes+=("${route}")
      fi
    fi

    for pattern in "${protected_patterns[@]}"; do
      if [[ "${pattern}" == */ ]]; then
        if [[ "${file}" == "${pattern}"* ]]; then
          has_protected_changes=true
          break
        fi
      elif [[ "${file}" == "${pattern}" ]]; then
        has_protected_changes=true
        break
      fi
    done

    if [[ "${file}" == *.test.ts || "${file}" == *.test.tsx ]]; then
      has_test_changes=true
    fi
  done
fi

unique_routes=()
if ((${#routes[@]} > 0)); then
  while IFS= read -r route; do
    unique_routes+=("${route}")
  done < <(printf '%s\n' "${routes[@]}" | awk 'NF && !seen[$0]++')
fi

echo "== PR Checklist =="
echo "[ ] bun run lint passes"
echo "[ ] bun run typecheck passes"
echo "[ ] bun run test passes - all tests green"
echo "[ ] bun run build passes"

if [[ "${has_ui_changes}" == true ]]; then
  route_list="<list the changed routes here>"
  if ((${#unique_routes[@]} > 0)); then
    route_list="$(printf '%s, ' "${unique_routes[@]}")"
    route_list="${route_list%, }"
  fi
  echo "[ ] Routes verified: ${route_list}"
  echo "[ ] Console status: clean or exceptions noted"
  echo "[ ] Network status: clean or failures noted"
  echo "[ ] Screenshot attached or 'no visual change' noted"
fi

if [[ "${has_protected_changes}" == true ]]; then
  echo "[ ] LANE B: This PR touches protected paths - do not auto-merge"
  echo "[ ] Explicitly route for human review"
fi

if [[ "${has_test_changes}" == true ]]; then
  echo "[ ] Test changes are justified by spec, not drift"
  echo "[ ] If behavior unchanged: 'no-spec-impact' declared in PR body"
fi
