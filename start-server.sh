#!/bin/bash

if ! [ $NODE_ENV ] ; then
  echo "NODE_ENV wasn't set. To set type next:
  export NODE_ENV=production
  ./start-server.sh"
  exit 0
fi

echo NODE_ENV = $NODE_ENV

mkdir ~/need-a-doctor-api/logs
touch ~/need-a-doctor-api/logs/api-error.log
touch ~/need-a-doctor-api/logs/api-output.log


forever \
  -e ~/need-a-doctor-api/logs/api-error.log \
  -o ~/need-a-doctor-api/logs/api-output.log \
  start ~/need-a-doctor-api/src/app.js
