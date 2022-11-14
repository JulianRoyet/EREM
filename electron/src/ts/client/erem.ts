import { Layout, KeyLine, Key, CursorSettings, KeyboardManager, Candidate} from "./keyboard"

document.addEventListener("DOMContentLoaded", function(){
    console.log("TTTEEESSSSTTTTT");
    ready();
});

let layout: Layout = {
    lines: [
        new KeyLine([Key.B, Key.R, Key.D, Key.G, Key.T, Key.P, Key.L, Key.K]),
        new KeyLine([Key.J, Key.N, Key.F, Key.V, Key.S, Key.CH, Key.M, Key.Z]),
        new KeyLine([Key.A, Key.I, Key.O, Key.U, Key.Y, Key.GN, Key.W]),
        new KeyLine([Key.AN, Key.EU, Key.E, Key.IN, Key.ON, Key.OU])
    ]
};

const url = "ws://localhost:8080"
const server = new WebSocket(url)

let manager: KeyboardManager;
let sentence = "";
let suggestions: string[]

function send(candidates: Candidate[]){
    if(candidates.length > 0){
        let simplified = candidates.map(c => {
            return [c.index, c.score];
        })
        console.log(simplified);
        let message = {
            type: "getSuggestions",
            content: simplified
        };
        server.send(JSON.stringify(message));
    }
}
function setSentence(sentence: string){
    let message = {
        type: "setSentence",
        content: sentence
    }
    server.send(JSON.stringify(message));
}

function selectSuggestion(idx: number){
    sentence = sentence + " " + suggestions[idx];
    setSentence(sentence);
}

function displayText(msg){
    let textarea = document.getElementById('textarea') as HTMLInputElement;
    textarea.value+=msg+" ";
}

function deleteWord(){
    let textarea = document.getElementById('textarea') as HTMLInputElement;
    let contenu = textarea.value;
    let tab = contenu.split(" ");
    textarea.value = "";
    for(let i = 0; i < tab.length-2; i++){
        textarea.value += tab[i]+" ";
    }
}

function reset(){
    setSentence(sentence);
}

function updateSuggestionsDisplay(){
    //TODO: mettre à jour les boutons suggestions à partir du tableau: suggestions: string[]
    let buttons = document.querySelectorAll('.mot');
    buttons.forEach((button, index) => {
        button.innerHTML = suggestions[index];
        })
}

server.onopen = function(){
    setSentence(sentence);
    //TODO: LOADING SCREEN ON
}

function ready() {
    manager = new KeyboardManager(layout, new CursorSettings(), send);
    console.log("TEEEESSSTTTTT");
    let buttons = document.querySelectorAll('.mot');
    buttons.forEach((button, index) => {
        button.addEventListener('click', (e:Event) => {
            displayText(suggestions[index]);
        })
    });
    //TODO: LOADING SCREEN OFF
}

server.onmessage = function(event: any){
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
}

document.addEventListener("DOMContentLoaded", function(){
    ready();
});document.addEventListener("DOMContentLoaded", function(){
    ready();
});

//TODO: créer un écran de chargement (un div qui contient l'écran de chargement, on met juste le div en display:none quand le chargement est terminé, et on réactive l'affichage du reste de l'interface)
//TODO: appeler selectSuggestion(i) quand on hover le bouton du mot suggéré i
//TODO: le bouton reset appelle reset()