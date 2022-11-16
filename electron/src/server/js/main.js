"use strict";
exports.__esModule = true;
var _a = require('electron'), app = _a.app, BrowserWindow = _a.BrowserWindow;
var path = require('path');
var WebSocket = require('ws');
// Set up server
var wss = new WebSocket.Server({ port: 8080 });
var client;
var spawn = require("child_process").spawn;
var backend = null;
var noServ = false;
var createWindow = function () {
    var win = new BrowserWindow({
        width: 1280,
        height: 720
    });
    win.maximize();
    win.loadFile('src/prototype.html');
};
function low_send(message) {
    backend.stdin.cork();
    backend.stdin.write(message + "\n");
    backend.stdin.uncork();
}
function send(type, message) {
    var typed = { type: type, content: message };
    var asStr = JSON.stringify(typed);
    low_send(asStr);
}
function backendHandle(message) {
    var typed = JSON.parse(message);
    var content = typed.content;
    switch (typed.type) {
        case "ready":
            client.send(message);
            break;
        case "suggestions":
            client.send(message);
            break;
        default:
            break;
    }
}
function serverSetup() {
    backend = spawn("cmd.exe", ["/C", "python -u ..\\backend\\server.py"]);
    backend.on('spawn', function () {
        createWindow();
    });
    backend.stdin.setEncoding('utf-8');
    backend.stdout.on('data', function (data) {
        var lines = "".concat(data).split("\n");
        lines.forEach(function (line) {
            line = line.trim();
            if (line.startsWith("<EREM.MSG>:"))
                backendHandle(line.substring(11));
            else if (line.length > 0)
                console.log("BACKEND:" + line);
        });
    });
    backend.stderr.on('data', function (data) {
        console.log("BACKEND ERROR: ".concat(data));
    });
}
app.whenReady().then(function () {
    if (noServ)
        createWindow();
    else
        serverSetup();
});
function forceReady() {
    client.send(JSON.stringify({
        type: "ready",
        content: null
    }));
}
app.on('window-all-closed', function () {
    spawn("taskkill", ["/pid", backend.pid, '/f', '/t']);
    if (process.platform !== 'darwin')
        app.quit();
});
wss.on('connection', function connection(ws) {
    client = ws;
    if (noServ)
        forceReady();
    ws.on('message', function incoming(message) {
        var parsed = JSON.parse(message);
        switch (parsed.type) {
            case "candidates":
                if (!noServ)
                    low_send(message);
                break;
            case "sentence":
                if (!noServ)
                    low_send(message);
                break;
            case "requestSuggestions":
                if (!noServ)
                    low_send(message);
                break;
            default:
                console.log("unknown message type: " + parsed.type);
                break;
        }
    });
});
