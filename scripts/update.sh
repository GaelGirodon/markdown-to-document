#!/usr/bin/env bash

if [[ -z "$1" ]]; then echo -e "\033[1;31mUsage: update.sh <target>\033[0m"; exit 1; fi

set -e; trap 'echo -e "\033[1;36m$ $BASH_COMMAND\033[0m"' debug

npx --min-release-age 7 npm-check-updates -u -c 3d -t "$1"
npm install
npm update --min-release-age 3
npm audit fix || read -rp "Press Enter to continue anyway..."
npm run format:check
npm run lint
npm run build:assets
npm test
