const {EremApi} = require("./EremApi.ts");
var grpc = require('@grpc/grpc-js');
const { app, BrowserWindow } = require('electron')
const path = require('path')

var api = new EremApi('localhost:8765', grpc.credentials.createInsecure())

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 1200
  })  
  win.loadFile('prototype.html')
}

app.whenReady().then(() => {
  createWindow()
  console.log("ready")
  api.getHelloMsg({}, function(err, value) {
    if (err) {
      console.log(err)
    } else {
      console.log(value)
    }
  });
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})