#!/bin/bash

echo "'use strict'"
echo "var kCacheFiles = ["
find . -type f |
while read i; do
  if [ "${i:2}" != "$(basename $0)" ]; then
    if [[ $i == \./* ]]; then
      echo "'/${i:2}',"
    else
      echo "'/$i',"
    fi
  fi
done
echo "];"
