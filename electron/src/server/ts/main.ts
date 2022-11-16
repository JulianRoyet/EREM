const { app, BrowserWindow } = require('electron')
const path = require('path')

const WebSocket = require('ws');
// Set up server
const wss = new WebSocket.Server({ port: 8080 });
let client;
let spawn = require("child_process").spawn;

let backend = null;
const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 720
  }) 
  win.maximize();
  win.loadFile('src/prototype.html')
}

function low_send(message: string){
  backend.stdin.cork();
  backend.stdin.write(message + "\n");
  backend.stdin.uncork();
}

function send(type: string, message: any){
  let typed = {type: type, content: message}
  let asStr = JSON.stringify(typed);
  low_send(asStr)
}

function backendHandle(message: string){
  let typed = JSON.parse(message);
  let content = typed.content;
  switch (typed.type) {
    case "ready":
      client.send(message)
      break;
    
    case "suggestions":
      client.send(message)
      break;
    
    default:
      break;
  }
}

app.whenReady().then(() => {
  createWindow();
  /*backend = spawn("cmd.exe", ["/C", "python -u ..\\backend\\server.py"]);
  
  backend.on('spawn', () => {
    createWindow()
    
  })

  backend.stdin.setEncoding('utf-8');
  
  backend.stdout.on('data', (data) =>{
    let lines = `${data}`.split("\n");
    lines.forEach(line => {
      if(line.startsWith("<EREM.MSG>:"))
        backendHandle(line.substring(11));
      else
        console.log("BACKEND:" + line)  
    });
    
  });

  backend.stderr.on('data', (data) =>{
    console.log(`BACKEND: ${data}`)
  });*/
})

app.on('window-all-closed', () => {
  spawn("taskkill", ["/pid", backend.pid, '/f', '/t']);
  if (process.platform !== 'darwin') app.quit()
})

wss.on('connection', function connection(ws) {
  client = ws;
  client.send(JSON.stringify({
    type:"ready",
    content:null
  }));
  ws.on('message', function incoming(message) {
    let parsed = JSON.parse(message)
    switch (parsed.type) {
      case "candidates":
        //low_send(message)
        break;
      case "sentence":
        //low_send(message)
        break;
      default:
        console.log("unknown message type: " + parsed.type);
        break;
    }
  });
});

export{};