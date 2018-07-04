#!/bin/bash
cd ..
while true
do
  val=$(git pull) &>/dev/null
  echo $val
  if [ "$val" != "Déjà à jour." ]
  then
    echo "test"
    pkill -f node &>/dev/null
    (node app.js &) &>/dev/null
  fi
done
