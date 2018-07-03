#!/bin/bash
while true
do
  (val=$(git pull)) &>/dev/null
  if [ "$val" != "Déjà à jour." ]
  then
    pkill -f node &>/dev/null
    (node app.js &) &>/dev/null
  fi
  sleep 5s
done
