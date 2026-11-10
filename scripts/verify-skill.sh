#!/usr/bin/env bash
# Usage: scripts/verify-skill.sh https://github.com/OWNER/REPO/tree/BRANCH/PATH/TO/SKILL
# Confirms a public skill's folder exists, with a SKILL.md, before it is linked on the site.
# Uses git (github.com web pages are blocked in this environment) and fetches no file contents.
set -euo pipefail
url="$1"
[[ "$url" =~ ^https://github\.com/([^/]+)/([^/]+)/tree/([^/]+)/(.+)$ ]] || { echo "not a github tree URL: $url"; exit 1; }
owner="${BASH_REMATCH[1]}" repo="${BASH_REMATCH[2]}" branch="${BASH_REMATCH[3]}" sub="${BASH_REMATCH[4]%/}"
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
git clone -q --depth 1 --filter=blob:none --no-checkout --branch "$branch" "https://github.com/$owner/$repo" "$tmp/r" 2>/dev/null || { echo "repo not public or not found: $owner/$repo"; exit 1; }
git -C "$tmp/r" ls-tree --name-only "HEAD" "$sub/SKILL.md" | grep -q . && echo "ok: $url" || { echo "no SKILL.md at $sub"; exit 1; }
