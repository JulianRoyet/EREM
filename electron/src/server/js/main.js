"use strict";
exports.__esModule = true;
var _a = require('electron'), app = _a.app, BrowserWindow = _a.BrowserWindow;
var path = require('path');
var grpc = require("@grpc/grpc-js");
var EremApi_1 = require("./EremApi");
var EremApi_pb_1 = require("./EremApi_pb");
var WebSocket = require('ws');
// Set up server
var wss = new WebSocket.Server({ port: 8080 });
var spawn = require("child_process").spawn;
var api = new EremApi_1.EremApi('localhost:8765', grpc.credentials.createInsecure());
var backend = null;
var createWindow = function () {
    var win = new BrowserWindow({
        width: 1280,
        height: 720
    });
    win.maximize();
    win.loadFile('src/prototype.html');
};
function handleCandidates(message) {
    var candidates = new EremApi_pb_1.CandidateUpdate();
    var data = message.map(function (e) {
        var c = new EremApi_pb_1.Candidate();
        c.setIndex(e[0]);
        c.setScore(e[1]);
        return c;
    });
    console.log(data);
    candidates.setDataList(data);
    api.getSuggestions(candidates, function (err, response) {
        console.log('suggestions:', response);
    });
}
wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        var parsed = JSON.parse(message);
        switch (parsed.type) {
            case "getSuggestions":
                handleCandidates(parsed.content);
                break;
            case "setSentence":
                break;
            default:
                console.log("unknown message type: " + parsed.type);
                break;
        }
    });
});
app.whenReady().then(function () {
    // backend = spawn("cmd.exe", ["/C", "start /B python ..\\backend\\server.py"]);
    // backend.on('spawn', () => {
    //   createWindow()
    //   console.log("ready")
    // })
    // backend.stdout.on('data', (data) =>{
    //   console.log(`BACKEND: ${data}`)
    // });
    createWindow();
});
app.on('window-all-closed', function () {
    backend.kill();
    if (process.platform !== 'darwin')
        app.quit();
});
