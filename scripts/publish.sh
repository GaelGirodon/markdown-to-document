#!/usr/bin/env bash

set -e; trap '[[ ! $BASH_COMMAND =~ (read|\[\[) ]] && echo -e "\033[1;36m$ $BASH_COMMAND\033[0m"' debug

git switch main
npm run build:assets
npm pack
read -rp "Valid package? [Yn] " yn && [[ $yn != Y* ]] && exit 0
rm ./*.tgz
npm login
read -rp "Ready to publish? [Yn] " yn && [[ $yn != Y* ]] && exit 0
npm publish
npm logout
git switch develop
