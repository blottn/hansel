#!/bin/bash

echo pushing to wss://wrm.blottn.ie/hansel/$1

cat merge.json | websocat wss://wrm.blottn.ie/hansel/$1
