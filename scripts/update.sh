#!/usr/bin/env bash

if [[ -z "$1" ]]; then echo -e "\033[1;31mUsage: update.sh <target>\033[0m"; exit 1; fi

set -e; trap 'echo -e "\033[1;36m$ $BASH_COMMAND\033[0m"' debug

npx npm-check-updates -u -t "$1"
npm install
npm update
npm audit fix
npm run format:check
npm run lint
npm run build:assets
npm test
