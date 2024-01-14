#!/bin/bash
set -ex

if [ -p /tmp/hansel.sock ]; then
  rm /tmp/hansel.sock
fi

mkfifo /tmp/hansel.sock
logfile=`date +%s`.jsonl

tail -f /tmp/hansel.sock |
  websocat wss://wrm.blottn.ie/hansel |
  tee $logfile |
  while IFS= read -r line; do echo "$line" |
    jd -f merge -p /dev/stdin db.json; done
#  tee db.json > /tmp/hansel.sock
