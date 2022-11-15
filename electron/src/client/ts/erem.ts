import { Layout, KeyLine, Key, CursorSettings, KeyboardManager, Candidate} from "./keyboard.js"

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

suggestions = ["test", "les", "mots"];

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

function deleteAll(){
    let textarea = document.getElementById('textarea') as HTMLInputElement;
    textarea.value = "";
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

function loadingScreenOn() {
    //TODO: LOADING SCREEN ON
    document.getElementById('main').hidden = true;
}

function loadingScreenOff() {
    //TODO: LOADING SCREEN OFF
    document.getElementById('loading').hidden = true;
    document.getElementById('main').hidden = false;
}

server.onopen = function(){
    setSentence(sentence);
    loadingScreenOn();
    ready();
    updateSuggestionsDisplay();
}

function ready() {
    manager = new KeyboardManager(layout, new CursorSettings(), send);
    let buttons = document.querySelectorAll('.mot');
    let timer;
    buttons.forEach((button, index) => {
        button.addEventListener('mouseenter', () => {
            timer = setTimeout((e:Event) => {
            displayText(suggestions[index]);
        }, 1000);
        })
        button.addEventListener('mouseleave', () => {
            clearTimeout(timer);
        })
    });

    let delete_button = document.querySelector('.delete');
    delete_button.addEventListener('mouseenter', () => {
        timer = setTimeout((e:Event) => {
        deleteAll();
        }, 1000);
    });
    delete_button.addEventListener('mouseleave', () => {
        clearTimeout(timer);
    })

    loadingScreenOff();
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


//TODO: créer un écran de chargement (un div qui contient l'écran de chargement, on met juste le div en display:none quand le chargement est terminé, et on réactive l'affichage du reste de l'interface)
//TODO: appeler selectSuggestion(i) quand on hover le bouton du mot suggéré i
//TODO: le bouton reset appelle reset()