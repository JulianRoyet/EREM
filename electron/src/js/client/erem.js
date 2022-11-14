"use strict";
exports.__esModule = true;
var keyboard_1 = require("./keyboard");
var layout = {
    lines: [
        new keyboard_1.KeyLine([keyboard_1.Key.B, keyboard_1.Key.R, keyboard_1.Key.D, keyboard_1.Key.G, keyboard_1.Key.T, keyboard_1.Key.P, keyboard_1.Key.L, keyboard_1.Key.K]),
        new keyboard_1.KeyLine([keyboard_1.Key.J, keyboard_1.Key.N, keyboard_1.Key.F, keyboard_1.Key.V, keyboard_1.Key.S, keyboard_1.Key.CH, keyboard_1.Key.M, keyboard_1.Key.Z]),
        new keyboard_1.KeyLine([keyboard_1.Key.A, keyboard_1.Key.I, keyboard_1.Key.O, keyboard_1.Key.U, keyboard_1.Key.Y, keyboard_1.Key.GN, keyboard_1.Key.W]),
        new keyboard_1.KeyLine([keyboard_1.Key.AN, keyboard_1.Key.EU, keyboard_1.Key.E, keyboard_1.Key.IN, keyboard_1.Key.ON, keyboard_1.Key.OU])
    ]
};
var url = "ws://localhost:8080";
var server = new WebSocket(url);
var manager;
var sentence = "";
var suggestions;
function send(candidates) {
    if (candidates.length > 0) {
        var simplified = candidates.map(function (c) {
            return [c.index, c.score];
        });
        console.log(simplified);
        var message = {
            type: "getSuggestions",
            content: simplified
        };
        server.send(JSON.stringify(message));
    }
}
function setSentence(sentence) {
    var message = {
        type: "setSentence",
        content: sentence
    };
    server.send(JSON.stringify(message));
}
function selectSuggestion(idx) {
    sentence = sentence + " " + suggestions[idx];
    setSentence(sentence);
}
function reset() {
    setSentence(sentence);
}
server.onopen = function () {
    setSentence(sentence);
    //TODO: LOADING SCREEN ON
};
server.onmessage = function (event) {
    var message = JSON.parse(event.data);
    switch (message.type) {
        case "ready":
            manager = new keyboard_1.KeyboardManager(layout, new keyboard_1.CursorSettings(), send);
            //TODO: LOADING SCREEN OFF
            break;
        case "suggestions":
            suggestions = message.content;
            break;
        default:
            console.log("unknown message type: " + message.type);
    }
};
//TODO: créer un écran de chargement (un div qui contient l'écran de chargement, on met juste le div en display:none quand le chargement est terminé, et on réactive l'affichage du reste de l'interface)
//TODO: appeler selectSuggestion(i) quand on hover le bouton du mot suggéré i
//TODO: le bouton reset appelle reset()
