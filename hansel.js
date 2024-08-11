#!/usr/local/bin/node

import { WebSocket } from 'ws'
import { open, readFile } from 'fs/promises';
import { join } from 'path';
import { apply } from 'json-patcher';

import { ArgumentParser } from 'argparse';

let parser = new ArgumentParser();

parser.add_argument('--data-dir', {default: './data'});
parser.add_argument('--ws-url', {default: 'ws://localhost:3141/hansel/test'});

let { data_dir, ws_url } = parser.parse_args();

// Open files
let db = JSON.parse(await readFile(`${data_dir}/db.json`));
let log = await open(`${data_dir}/diffs.jsonl`, 'a');

// Initialise websocket
const in_url = ws_url;
const out_url = join(ws_url, 'trail');
const ws_in = new WebSocket(in_url);
const ws_out = new WebSocket(out_url);
ws_in.on('error', console.error);

// Connect websockets
(await Promise.all([new Promise((res) => {
  ws_out.on('open', () => {
    res(`Connected to ws_out: ${out_url}`);
  });
}), new Promise((res) => {
  ws_in.on('open', () => {
    res(`Connected to ws_in: ${in_url}`);
  });
})])).forEach(m => console.log(m));


ws_in.on('close', (code, reason) => {
  console.log(code, reason.toString());
  console.log('Connection closed');
  // close
});

// handle diffs & persist db
ws_in.on('message', (m) => {
  try {
    let diff = JSON.parse(m);
    console.log(`received diff: ${JSON.stringify(diff)}`);
    log.appendFile(m + '\n');
    db = apply(db, diff);
    console.log(`new db state: ${JSON.stringify(db)}`);
  } catch (e) {
    console.error(e);
  }
  ws_out.send(JSON.stringify(db));
});

