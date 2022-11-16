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

function send(candidates: Candidate[]){
    if(candidates.length > 0){
        let simplified = candidates.map(c => {
            return [c.key, c.index, c.score];
        })
        console.log(simplified);
        let message = {
            type: "candidates",
            content: simplified
        };
        server.send(JSON.stringify(message));
    }
    requestSuggestions();
}
function setSentence(s: string){
    manager.clear();
    sentence = s;
    let textarea = document.getElementById('textarea') as HTMLInputElement;
    textarea.value = sentence;

    let message = {
        type: "sentence",
        content: sentence
    }
    server.send(JSON.stringify(message));
}

function selectSuggestion(idx: number){
    let ns = sentence;
    if(ns.length > 0)
        ns += " ";
    ns += suggestions[idx];
    setSentence(ns);
}

function deleteWord(){
    let idx = sentence.lastIndexOf(" ");
    let ns = sentence.substring(0, idx);
    setSentence(ns);
}

function deleteAll(){
    let textarea = document.getElementById('textarea') as HTMLInputElement;
    textarea.value = "";
    setSentence("");    
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
    document.getElementById('loading').hidden = false;
}

function loadingScreenOff() {
    //TODO: LOADING SCREEN OFF
    document.getElementById('loading').hidden = true;
    document.getElementById('main').hidden = false;
}

function requestSuggestions(){
    let message = {
        type: "requestSuggestions",
        content: null
    };
    server.send(JSON.stringify(message));
}

server.onopen = function(){
    loadingScreenOn();
}

function ready() {
    manager = new KeyboardManager(layout, new CursorSettings(), send);
    setSentence(sentence);
    let buttons = document.querySelectorAll('.mot');
    let timer;
    let delay=600;
    buttons.forEach((button, index) => {
        button.addEventListener('mouseenter', () => {
            timer = setTimeout((e:Event) => {
            selectSuggestion(index);
        }, delay);
        })
        button.addEventListener('mouseleave', () => {
            clearTimeout(timer);
        })
    });

    let delete_button = document.querySelector('.delete');
    delete_button.addEventListener('mouseenter', () => {
        timer = setTimeout((e:Event) => {
            deleteAll();
        }, delay);
    });
    delete_button.addEventListener('mouseleave', () => {
        clearTimeout(timer);
    })

    let clear_button = document.querySelector('.clear');
    clear_button.addEventListener('mouseenter', () => {
        timer = setTimeout((e:Event) => {
            setSentence(sentence);
        }, delay);
    });
    clear_button.addEventListener('mouseleave', () => {
        clearTimeout(timer);
    })

    let remove_button = document.querySelector('.remove');
    remove_button.addEventListener('mouseenter', () => {
        timer = setTimeout((e:Event) => {
        deleteWord();
        }, delay);
    });
    remove_button.addEventListener('mouseleave', () => {
        clearTimeout(timer);
    })

    loadingScreenOff();
    updateSuggestionsDisplay();
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