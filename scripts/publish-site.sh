#!/usr/bin/env bash
# Usage: scripts/publish-site.sh "Day 02: Title"
# Copies dist/ into the site repo checkout and pushes. Vercel deploys on push.
# SITE_REPO_DIR defaults to ../thirty-posters-site (a clone of the site repo).
set -euo pipefail
cd "$(dirname "$0")/.."
SITE="${SITE_REPO_DIR:-../thirty-posters-site}"
[ -d "$SITE/.git" ] || { echo "No site repo at $SITE. Clone it first."; exit 1; }
# mirror dist/ into the site repo, keeping its .git and README.md
find "$SITE" -mindepth 1 -maxdepth 1 ! -name .git ! -name README.md -exec rm -rf {} +
cp -R dist/. "$SITE/"
cd "$SITE"
git add -A
git diff --cached --quiet && { echo "site: nothing changed"; exit 0; }
git commit -qm "${1:-Update the wall}"
git push -q origin HEAD
echo "site: pushed"
