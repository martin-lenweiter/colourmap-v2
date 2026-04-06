#!/usr/bin/env bash

# Assumptions:
# - This repository uses Bun as the only supported package manager lockfile.
# - The script must work both in CI and locally without git metadata.
# - A committed or generated package-lock.json is always considered a policy violation.

set -euo pipefail

if [[ -f "package-lock.json" ]]; then
  echo "Violation: package-lock.json exists. This repo must not contain both bun.lock and package-lock.json."
  exit 1
fi

echo "OK: no package-lock.json detected."

