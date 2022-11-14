"use strict";
exports.__esModule = true;
var keyboard_1 = require("./keyboard");
document.addEventListener("DOMContentLoaded", function () {
    console.log("TTTEEESSSSTTTTT");
    ready();
});
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
function displayText(msg) {
    var textarea = document.getElementById('textarea');
    textarea.value += msg + " ";
}
function deleteWord() {
    var textarea = document.getElementById('textarea');
    var contenu = textarea.value;
    var tab = contenu.split(" ");
    textarea.value = "";
    for (var i = 0; i < tab.length - 2; i++) {
        textarea.value += tab[i] + " ";
    }
}
function reset() {
    setSentence(sentence);
}
function updateSuggestionsDisplay() {
    //TODO: mettre à jour les boutons suggestions à partir du tableau: suggestions: string[]
    var buttons = document.querySelectorAll('.mot');
    buttons.forEach(function (button, index) {
        button.innerHTML = suggestions[index];
    });
}
server.onopen = function () {
    setSentence(sentence);
    //TODO: LOADING SCREEN ON
};
function ready() {
    manager = new keyboard_1.KeyboardManager(layout, new keyboard_1.CursorSettings(), send);
    console.log("TEEEESSSTTTTT");
    var buttons = document.querySelectorAll('.mot');
    buttons.forEach(function (button, index) {
        button.addEventListener('click', function (e) {
            displayText(suggestions[index]);
        });
    });
    //TODO: LOADING SCREEN OFF
}
server.onmessage = function (event) {
    var message = JSON.parse(event.data);
    console.log(message.type);
    switch (message.type) {
        case "ready":
            ready();
            break;
        case "suggestions":
            suggestions = message.content;
            updateSuggestionsDisplay();
            break;
        default:
            console.log("unknown message type: " + message.type);
    }
};
document.addEventListener("DOMContentLoaded", function () {
    ready();
});
document.addEventListener("DOMContentLoaded", function () {
    ready();
});
//TODO: créer un écran de chargement (un div qui contient l'écran de chargement, on met juste le div en display:none quand le chargement est terminé, et on réactive l'affichage du reste de l'interface)
//TODO: appeler selectSuggestion(i) quand on hover le bouton du mot suggéré i
//TODO: le bouton reset appelle reset()
