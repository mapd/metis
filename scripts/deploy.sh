#!/bin/bash
set -ex

CODECOV_TOKEN="3ec979ab-0d76-4383-91ae-68a214fc0156" npm run coverage

if [ "$TRAVIS_BRANCH" = "master" ]; then
  REPO_PATH=git@github.com:mapd/mapd-data-layer.git
  DOWNLOAD_PATH=examples
  COMMIT_USER="mapd-bot"
  COMMIT_EMAIL="machines@mapd.com"

  git config --global user.name "${COMMIT_USER}"
  git config --global user.email "${COMMIT_EMAIL}"
  rm -rf ${DOWNLOAD_PATH}
  git clone "${REPO_PATH}" ${DOWNLOAD_PATH}

  cd ${DOWNLOAD_PATH}
    ./scripts/install.sh
    ./scripts/build.sh

    pushd examples/dc
    yarn
    popd

    pushd examples/vega
    yarn
    popd

    yarn webpack -- --config ./examples/dc/webpack.config.js
    yarn webpack -- --config ./examples/vega/webpack.config.js

    git fetch --all
    git checkout gh-pages
    git pull --rebase origin master

    git add examples -f
    CHANGESET=$(git rev-parse --verify HEAD)

    git commit -m "Automated build for changeset ${CHANGESET}."
    git push origin gh-pages
  cd ..
  rm -rf ${DOWNLOAD_PATH}
fi
