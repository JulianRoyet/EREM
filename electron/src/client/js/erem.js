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
            type: "candidates",
            content: simplified
        };
        server.send(JSON.stringify(message));
    }
}
function setSentence(s) {
    manager.clear();
    sentence = s;
    let textarea = document.getElementById('textarea');
    textarea.value = sentence;
    let message = {
        type: "sentence",
        content: sentence
    };
    server.send(JSON.stringify(message));
}
function selectSuggestion(idx) {
    let ns = sentence;
    if (ns.length > 0)
        ns += " ";
    ns += suggestions[idx];
    setSentence(ns);
}
function deleteWord() {
    let textarea = document.getElementById('textarea');
    let contenu = textarea.value;
    let tab = contenu.split(" ");
    textarea.value = "";
    for (let i = 0; i < tab.length - 2; i++) {
        textarea.value += tab[i] + " ";
    }
}
function deleteAll() {
    let textarea = document.getElementById('textarea');
    textarea.value = "";
    setSentence("");
}
function updateSuggestionsDisplay() {
    //TODO: mettre à jour les boutons suggestions à partir du tableau: suggestions: string[]
    let buttons = document.querySelectorAll('.mot');
    buttons.forEach((button, index) => {
        button.innerHTML = suggestions[index];
    });
}
function loadingScreenOn() {
    //TODO: LOADING SCREEN ON
    document.getElementById('main').hidden = true;
    document.getElementById('loading').hidden = false;
}
function loadingScreenOff() {
    //TODO: LOADING SCREEN OFF
    document.getElementById('loading').hidden = true;
    document.getElementById('main').hidden = false;
}
server.onopen = function () {
    loadingScreenOn();
};
function ready() {
    manager = new KeyboardManager(layout, new CursorSettings(), send);
    setSentence(sentence);
    let buttons = document.querySelectorAll('.mot');
    let timer;
    let delay = 800;
    buttons.forEach((button, index) => {
        button.addEventListener('mouseenter', () => {
            timer = setTimeout((e) => {
                selectSuggestion(index);
            }, delay);
        });
        button.addEventListener('mouseleave', () => {
            clearTimeout(timer);
        });
    });
    let delete_button = document.querySelector('.delete');
    delete_button.addEventListener('mouseenter', () => {
        timer = setTimeout((e) => {
            deleteAll();
        }, delay);
    });
    delete_button.addEventListener('mouseleave', () => {
        clearTimeout(timer);
    });
    let clear_button = document.querySelector('.clear');
    clear_button.addEventListener('mouseenter', () => {
        timer = setTimeout((e) => {
            setSentence(sentence);
        }, delay);
    });
    clear_button.addEventListener('mouseleave', () => {
        clearTimeout(timer);
    });
    loadingScreenOff();
    updateSuggestionsDisplay();
}
server.onmessage = function (event) {
    let message = JSON.parse(event.data);
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
//TODO: créer un écran de chargement (un div qui contient l'écran de chargement, on met juste le div en display:none quand le chargement est terminé, et on réactive l'affichage du reste de l'interface)
//TODO: appeler selectSuggestion(i) quand on hover le bouton du mot suggéré i
//TODO: le bouton reset appelle reset()
