import { WebSocket } from 'ws'
import { open, readFile } from 'fs/promises';
import { apply } from 'json-merge-patch';

let db = JSON.parse(await readFile('./db.json'));
let log = await open('./diffs.jsonl', 'a');

// TODO let id be a flag
let id = Math.floor(new Date().getTime() / 1000)

const url = `wss://wrm.blottn.ie/hansel/test`;
const ws = new WebSocket(url);

ws.on('error', console.error);
ws.on('open', () => {
  console.log(`Connected to wss: ${url}`)
});

ws.on('message', (m) => {
  let diff = JSON.parse(m);
  console.log(`received diff: ${JSON.stringify(diff)}`);

  log.appendFile(JSON.stringify(diff) + '\n');
  db = apply(db, diff);
  
  console.log(`new db state: ${JSON.stringify(db)}`);
  ws.send(JSON.stringify(db));
});
