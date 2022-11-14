const url = "ws://localhost:8080"
const server = new WebSocket(url)
server.onopen = function(){
    initKeyboard();
    initPointer();
}

function makeFrag(templateId: string): DocumentFragment{
    let frag = document.createDocumentFragment();
    
    let template = document.getElementById(templateId);
    
    frag.appendChild(template.firstElementChild.cloneNode(true) as Element);   
    return frag;
}
function makeElem(templateId: string): HTMLElement{
    let template = document.getElementById(templateId).firstElementChild;

    return template.cloneNode(true) as HTMLElement;
}

enum Key{
    A = "a", K = "k", P = "p", E = "é/è",
    L = "L", ON = "on", T = "T", R = "R",
    Y = "y", O = "o", F = "f", S = "s",
    I = "i", D = "d", J = "j", N = "n",
    IN = "in", B = "b", OU = "ou", V = "v",
    AN = "an", G = "g", EU = "eu", M = "m",
    Z = "z", W = "w", U = "u", CH = "ch",
    GN = "ñ"
}

class KeyLine{
    keys:Key[];
    constructor(k: Key[]){
        this.keys = k;
    }
}
interface Layout{
    lines:KeyLine[]
}
class Keyboard{
    element: DocumentFragment;
    keys: HTMLElement[];

    constructor(layout: Layout){
        this.keys = []
        let len = Object.keys(Key).length;
        for (let i = 0; i < len; i++) {
            this.keys.push(null);
        }

        this.element = makeFrag("t-keyboard");
        layout.lines.forEach(line => {
            let gline = makeFrag("t-keyline");
            line.keys.forEach(key => { 
                let gkey = makeElem("t-key");
                gkey.querySelector(".k-text").textContent = key.toString();
                gline.querySelector(".k-keyline") .appendChild(gkey);
                let idx = Object.values(Key).indexOf(key);
                this.keys[idx] = gkey;
            });
            this.element.querySelector(".k-lines").appendChild(gline);
        });
    }
}

let keyboards = [];

function initKeyboard() {
    let keyboardElements = document.querySelectorAll(".k-keyboard");
    let layout: Layout = {
        lines: [
            new KeyLine([Key.B, Key.R, Key.D, Key.G, Key.T, Key.P, Key.L, Key.K]),
            new KeyLine([Key.J, Key.N, Key.F, Key.V, Key.S, Key.CH, Key.M, Key.Z]),
            new KeyLine([Key.A, Key.I, Key.O, Key.U, Key.Y, Key.GN, Key.W]),
            new KeyLine([Key.AN, Key.EU, Key.E, Key.IN, Key.ON, Key.OU])
        ]
    };
    keyboardElements.forEach(kb => {
        let kbo = new Keyboard(layout);
        keyboards.push(kbo);
        kb.appendChild(kbo.element);
    });
}

class TimePoint{
    x: number;
    y: number;
    t: number;
    constructor(x, y, t){
        this.x = x;
        this.y = y;
        this.t = t;
    }
}
class Cursor{
    size: number = 0;
    lastPoint: TimePoint = null;
    elapsed: number = 0;
    settings: CursorSettings;
    constructor(){
        this.settings = new CursorSettings();
    }

    update(p: TimePoint){
        if(this.lastPoint != null){
            let d = pointDistance(this.lastPoint, p);
            let s = this.settings;
            
            if(d > s.reduceTreshold){
                this.size = s.maxDiameter;
            }
            else{
                this.elapsed = p.t - this.lastPoint.t;
                this.size -= this.elapsed*s.reduceVelocity/Math.log(s.smoothReduce + this.size);
                if(this.size < 0) this.size = 0;
            }
        }
        this.lastPoint = p;
    }

    keyDistance(key: HTMLElement){
        let rect = key.getBoundingClientRect();
        let x = (rect.left + rect.right) / 2;
        let y = (rect.top + rect.bottom) / 2;
        let xd = x-this.lastPoint.x;
        let yd = y-this.lastPoint.y;
        return Math.sqrt(xd*xd + yd*yd);
    }

    allKeyDistances(keyboard: Keyboard){
        let distances:number[] = [];
        keyboard.keys.forEach(keyElem => {
            distances.push(this.keyDistance(keyElem))
        });
        return distances;
    }
}

class CursorSettings{
    minDiameter: number = 70;
    maxDiameter: number = 300;

    reduceVelocity: number = 2.5;
    reduceTreshold: number = 7;
    smoothReduce: number = 10;
}

function pointDistance(g1: TimePoint, g2: TimePoint): number{
    let x = g1.x - g2.x;
    let y = g1.y - g2.y;
    return Math.sqrt(x*x + y*y);
}

class KeyState{
    active: boolean = false;
    index: number = -1;
    scoreDelta = 0;
}

class KeyPress{
    key: number;
    scores: number[];
    constructor(key: number){
        this.key = key;
        this.scores = [];
        for(let i=0; i < Object.values(Key).length; i++){
            this.scores.push(0);
        }
    }
}

class Candidate{
    index: number;
    score: number;

    constructor(idx: number, s: number){
        this.index = idx;
        this.score = s;
    }
}

class CursorManager{
    stateArray: KeyState[];
    keyPressList: KeyPress[];
    toSend: number[];
    cursor: Cursor;
    lastUpdateTimestamp: number = 0;
    keyboard: Keyboard;
    keyHandler: (candidates: Candidate[]) => void;

    constructor(cursor: Cursor, keyboard: Keyboard, keyHandler: (candidates: Candidate[]) => void){
        this.stateArray = [];
        let len = Object.values(Key).length;
        for(let i=0; i < len; i++){
            this.stateArray.push(new KeyState());
        }
        this.keyPressList = [];
        this.cursor = cursor;
        this.keyboard = keyboard;
        this.lastUpdateTimestamp = Date.now();
        this.keyHandler = keyHandler;
    }

    score(elapsed: number, distance: number): number{
        return 1000*elapsed / (1 + distance * this.cursor.size)
    }

    updateScore(idx: number, timestamp: number, distance: number): void{
        let elapsed = timestamp - this.lastUpdateTimestamp;
        this.stateArray[idx].scoreDelta = this.score(elapsed, distance);
    }

    getScores(): number[]{
        return this.stateArray.map(keyState => {
            return keyState.scoreDelta;
        });
    }

    saveScores(idx: number, scores: number[]): void{
        if(this.stateArray[idx].active){
            let listIndex = this.stateArray[idx].index;
            let candidate = this.keyPressList[listIndex];
            for (let i = 0; i < scores.length; i++) {
                candidate.scores[i] += scores[i];
            };
            this.toSend.push(listIndex);
        }
    }

    updateKey(idx: number, timestamp: number, distance: number){
        let active = distance < (this.cursor.size + this.cursor.settings.minDiameter) /2;
        if(this.stateArray[idx].active){
            this.updateScore(idx, timestamp, distance);

            if(!active){
                this.stateArray[idx].active = false;
                this.stateArray[idx].index = -1;
                this.stateArray[idx].scoreDelta = 0;
            }
        }
        else{
            if(active){
                this.stateArray[idx].index = this.keyPressList.length;
                this.keyPressList.push(new KeyPress(idx));
                this.stateArray[idx].active = true;
                console.log(this.keyPressList);
            }
        }
    }

    candidateScores(): Candidate[]{
        return this.toSend.map((idx: number) => {
            let keypress = this.keyPressList[idx];
            let total = keypress.scores.reduce((acc, val) => {
                return acc+val;
            })
            let absolute = keypress.scores[keypress.key];
            let p = Math.log(1+absolute)*absolute/(total+1);
            return new Candidate(idx, p);
        });
    }

    update(timestamp: number){
        let distances = this.cursor.allKeyDistances(this.keyboard);
        let scores = this.getScores();
        
        for(let i=0; i < this.stateArray.length; i++){
            this.updateKey(i, timestamp, distances[i]);
        }
        this.toSend = [];
        for(let i=0; i < this.stateArray.length; i++){
            this.saveScores(i, scores);    
        }

        this.lastUpdateTimestamp = timestamp;

        let data = this.candidateScores();
        
        this.keyHandler(data);
    }
}


let cursorManagers = [];

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

function initPointer(){
    let pointer = document.getElementById('pointer');

    let mouseX: number = 0;
    let mouseY: number = 0;
    let cursor = new Cursor();
    
    cursorManagers.push(new CursorManager(cursor, keyboards[0], send));
    
    const interval = setInterval(function() {
        let timestamp = Date.now();
        cursor.update(new TimePoint(mouseX, mouseY, timestamp))
        cursorManagers[0].update(timestamp);
        
        let d = cursor.settings.minDiameter + cursor.size;

        pointer.style.width = d + 'px';
        pointer.style.height = d + 'px';

        pointer.style.left = mouseX - pointer.offsetWidth/2.0 + 'px';
        pointer.style.top = mouseY - pointer.offsetHeight/2.0 + 'px';
        
    }, 15);

    document.addEventListener('mousemove', (e) =>{
        mouseX = e.pageX;
        mouseY = e.pageY;
    });
}





