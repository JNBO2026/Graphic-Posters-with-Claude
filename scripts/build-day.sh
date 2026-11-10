#!/usr/bin/env bash
# Usage: scripts/build-day.sh 02
# Poster, socials (light and dark), handover zips, then the website build in dist/.
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/render-poster.js "$1"
node scripts/render-social.js "$1"
node scripts/package-day.js "$1"
node scripts/build-site.js
