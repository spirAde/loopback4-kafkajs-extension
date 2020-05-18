#!/usr/bin/env bash

#!/bin/bash
BASE_DIR=`dirname "$0"`

pushd ${BASE_DIR} >/dev/null
docker-compose down
popd >/dev/null
