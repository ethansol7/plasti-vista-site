#!/bin/bash
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -d "$DIR/../presentation-out" ]; then
  cd "$DIR/.."
  node scripts/serve-presentation.mjs --open
elif [ -d "$DIR/../out" ]; then
  cd "$DIR/.."
  node scripts/serve-presentation.mjs --open
else
  cd "$DIR"
  node serve-presentation.mjs --open
fi
