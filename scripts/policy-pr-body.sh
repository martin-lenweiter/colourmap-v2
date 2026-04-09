#!/usr/bin/env bash

pr_body_has_active_token() {
  local pr_body="$1"
  local token="$2"
  local line=""

  while IFS= read -r line; do
    line="${line%$'\r'}"

    if grep -Eq '^[[:space:]]*(>[[:space:]]*)?([*+-]|[0-9]+\.)?[[:space:]]*\[[[:space:]]\][[:space:]]' <<<"${line}" \
      && grep -Fq "${token}" <<<"${line}"; then
      continue
    fi

    if grep -Fq "${token}" <<<"${line}"; then
      return 0
    fi
  done <<<"${pr_body}"

  return 1
}
