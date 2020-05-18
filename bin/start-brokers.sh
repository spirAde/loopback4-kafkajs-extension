#!/bin/bash

BASE_DIR=`dirname "$0"`
pushd ${BASE_DIR} >/dev/null

./stop-brokers.sh

docker-compose up -d

popd >/dev/null
