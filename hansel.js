#!/usr/local/bin/node

import { WebSocket } from 'ws'
import { open, readFile } from 'fs/promises';
import { apply } from 'json-merge-patch';

import { ArgumentParser } from 'argparse';

let parser = new ArgumentParser();

parser.add_argument('--data-dir', {default: './data'});
parser.add_argument('--ws-url', {default: 'wss://wrm.blottn.ie/hansel/test'});

let { data_dir, ws_url } = parser.parse_args();

// Open files
let db = JSON.parse(await readFile(`${data_dir}/db.json`));
let log = await open(`${data_dir}/diffs.jsonl`, 'a');

// Initialise websocket
const url = `${ws_url}`;
const ws = new WebSocket(url);
ws.on('error', console.error);
ws.on('open', () => {
  console.log(`Connected to wss: ${url}`)
});

// handle diffs & persist db
ws.on('message', (m) => {
  let diff = JSON.parse(m);
  console.log(`received diff: ${JSON.stringify(diff)}`);

  log.appendFile(JSON.stringify(diff) + '\n');
  db = apply(db, diff);
  
  console.log(`new db state: ${JSON.stringify(db)}`);
  ws.send(JSON.stringify(db));
});
