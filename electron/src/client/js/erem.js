import { KeyLine, Key, CursorSettings, KeyboardManager } from "./keyboard.js";
let layout = {
    lines: [
        new KeyLine([Key.B, Key.R, Key.D, Key.G, Key.T, Key.P, Key.L, Key.K]),
        new KeyLine([Key.J, Key.N, Key.F, Key.V, Key.S, Key.CH, Key.M, Key.Z]),
        new KeyLine([Key.A, Key.I, Key.O, Key.U, Key.Y, Key.GN, Key.W]),
        new KeyLine([Key.AN, Key.EU, Key.E, Key.IN, Key.ON, Key.OU])
    ]
};
const url = "ws://localhost:8080";
const server = new WebSocket(url);
let manager;
let sentence = "";
let suggestions;
function send(candidates) {
    if (candidates.length > 0) {
        let simplified = candidates.map(c => {
            return [c.key, c.index, c.score];
        });
        console.log(simplified);
        let message = {
            type: "getSuggestions",
            content: simplified
        };
        server.send(JSON.stringify(message));
    }
}
function setSentence(sentence) {
    let message = {
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
function updateSuggestionsDisplay() {
    //TODO: mettre à jour les boutons suggestions à partir du tableau: suggestions: string[]
}
function ready() {
    setSentence(sentence);
    manager = new KeyboardManager(layout, new CursorSettings(), send);
}
server.onopen = function () {
    //TODO: LOADING SCREEN ON
};
server.onmessage = function (event) {
    let message = JSON.parse(event.data);
    switch (message.type) {
        case "ready":
            console.log("READYYY");
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
//TODO: créer un écran de chargement (un div qui contient l'écran de chargement, on met juste le div en display:none quand le chargement est terminé, et on réactive l'affichage du reste de l'interface)
//TODO: appeler selectSuggestion(i) quand on hover le bouton du mot suggéré i
//TODO: le bouton reset appelle reset()
