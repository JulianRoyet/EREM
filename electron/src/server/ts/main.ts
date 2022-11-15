const { app, BrowserWindow } = require('electron')
const path = require('path')

import * as grpc from '@grpc/grpc-js'
import {EremApi} from "./EremApi"
import { CandidateUpdate, Candidate, Suggestions, Sentence, Void } from "./EremApi_pb";

const WebSocket = require('ws');
// Set up server
const wss = new WebSocket.Server({ port: 8080 });
let client;
let spawn = require("child_process").spawn;

let api;
let backend = null;
const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 720
  }) 
  win.maximize();
  win.loadFile('src/prototype.html')
}

function handleCandidates(message){
  let candidates = new CandidateUpdate();
  let data = message.map(e => {
    console.log("elem: ", e);
    let c = new Candidate();
    c.setKey(e[0]);
    c.setIndex(e[1]);
    c.setScore(e[2]);
    return c;
  });
  candidates.setDataList(data);

  api.getSuggestions(candidates, function(err, response) {
    console.log('suggestions:', response);
  });
}

function ready(){
  api = new EremApi('localhost:8765', grpc.credentials.createInsecure())
  
  let message = {
    type: "ready",
    content: null
  }
  client.send(JSON.stringify(message));  
}

function setSentence(sentence: string){
  api.setSentence(sentence, function (err, response){

  });
}
wss.on('connection', function connection(ws) {
  client = ws;
  
  ws.on('message', function incoming(message) {
    let parsed = JSON.parse(message)
    switch (parsed.type) {
      case "getSuggestions":
        handleCandidates(parsed.content);
        break;
      case "setSentence":
        setSentence(parsed.content);
        break;
      default:
        console.log("unknown message type: " + parsed.type);
        break;
    }
  });
});


app.whenReady().then(() => {
  backend = spawn("cmd.exe", ["/C", "start /B python -u ..\\backend\\server.py"]);
  
  backend.on('spawn', () => {
    createWindow()
    
  })

  
  backend.stdout.on('data', (data) =>{
    
    if(`${data}`.trim().includes("<READY>"))
      ready();
    else
      console.log(`BACKEND: ${data}`)
  });
  
})

app.on('window-all-closed', () => {
  backend.kill();
  if (process.platform !== 'darwin') app.quit()
})

export{};