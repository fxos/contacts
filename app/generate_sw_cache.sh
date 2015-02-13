#!/bin/bash

echo "'use strict'"
echo "var kCacheFiles = ["
find . -type f |
while read i; do
  if [ "${i:2}" != "$(basename $0)" ]; then
    if [[ $i == \./* ]]; then
      echo "'/contacts/app/${i:2}',"
    else
      echo "'/contacts/app/$i',"
    fi
  fi
done
echo "];"
