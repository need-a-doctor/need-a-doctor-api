#!/bin/bash

if ! [ $NODE_ENV ] ; then
  echo "NODE_ENV wasn't set. Use default "development". To set type next: \"export NODE_ENV=production start-api.sh\""
  NODE_ENV = development
fi

echo NODE_ENV = $NODE_ENV

mkdir ~/need-a-doctor/logs
touch ~/need-a-doctor/logs/api-error.log
touch ~/need-a-doctor/logs/api-output.log


forever \
  -e ~/need-a-doctor/logs/error.log \
  -o ~/need-a-doctor/logs/output.log \
  start ~/need-a-doctor/src/app.js
