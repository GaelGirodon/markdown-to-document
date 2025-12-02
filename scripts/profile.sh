#!/usr/bin/env bash

set -e; trap '[[ ! $BASH_COMMAND =~ (for|cp) ]] && echo -e "\033[1;36m$ $BASH_COMMAND\033[0m"' debug

mkdir -p .clinic/data
grep -v "shields.io" README.md > .clinic/data/doc-1.md
for i in {2..50} ; do cp .clinic/data/doc-1.md .clinic/data/doc-$i.md; done
NO_INSIGHT=true npx clinic flame -- node src/cli.js ".clinic/data/doc-*.md" \
    -l page -t github -s atom-one-light -n -c -x test/data/extension/uppercase_title.js
