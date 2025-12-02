#!/usr/bin/env bash

VERSION_FILE="./src/cli.js"

set -e; trap '[[ ! $BASH_COMMAND =~ (read|\[\[) ]] && echo -e "\033[1;36m$ $BASH_COMMAND\033[0m"' debug

git switch develop
old_version=$(grep -m 1 -oP '(?<="version": ")[0-9.]+(?=")' package.json)
v=(${old_version//./ })
new_version="${v[0]}.$((v[1] + 1)).${v[2]}"
git flow release start "$new_version"
npm version --no-git-tag-version "$new_version"
sed -i "s/$old_version/$new_version/g" $VERSION_FILE
[[ $(node $VERSION_FILE --version) == "$new_version" ]] || (echo "Version mismatch"; exit 1)
read -rp "Update the changelog..."
git add package*.json CHANGELOG.md $VERSION_FILE
read -rp "Commit? [Yn] " yn && [[ $yn != Y* ]] && exit 0
git commit -m "Bump the version number"
read -rp "Finish release? [Yn] " yn && [[ $yn != Y* ]] && exit 0
git flow release finish "$new_version"
echo -e "Push all  -> 'git push --all origin'\nPush tags -> 'git push --tags'"
