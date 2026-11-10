#!/usr/bin/env bash
# Usage: scripts/build-day.sh 02
# Renders the poster, the socials (light and dark) and rebuilds the wall data.
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/render-poster.js "$1"
node scripts/render-social.js "$1"
node scripts/build-wall.js
