#!/usr/bin/env bash

if [ -z "$CI" ]; then
  BASE_DIR=`dirname "$0"`
  pushd ${BASE_DIR} >/dev/null

  ./stop-brokers.sh

  docker-compose up -d

  popd >/dev/null
fi
