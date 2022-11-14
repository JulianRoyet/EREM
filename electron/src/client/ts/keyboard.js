function makeFrag(templateId) {
    let frag = document.createDocumentFragment();
    let template = document.getElementById(templateId);
    frag.appendChild(template.firstElementChild.cloneNode(true));
    return frag;
}
function makeElem(templateId) {
    let template = document.getElementById(templateId).firstElementChild;
    return template.cloneNode(true);
}
export var Key;
(function (Key) {
    Key["A"] = "a";
    Key["K"] = "k";
    Key["P"] = "p";
    Key["E"] = "\u00E9/\u00E8";
    Key["L"] = "L";
    Key["ON"] = "on";
    Key["T"] = "T";
    Key["R"] = "R";
    Key["Y"] = "y";
    Key["O"] = "o";
    Key["F"] = "f";
    Key["S"] = "s";
    Key["I"] = "i";
    Key["D"] = "d";
    Key["J"] = "j";
    Key["N"] = "n";
    Key["IN"] = "in";
    Key["B"] = "b";
    Key["OU"] = "ou";
    Key["V"] = "v";
    Key["AN"] = "an";
    Key["G"] = "g";
    Key["EU"] = "eu";
    Key["M"] = "m";
    Key["Z"] = "z";
    Key["W"] = "w";
    Key["U"] = "u";
    Key["CH"] = "ch";
    Key["GN"] = "\u00F1";
})(Key || (Key = {}));
export class KeyLine {
    constructor(k) {
        this.keys = k;
    }
}
class Keyboard {
    constructor(layout) {
        let keyboardElement = document.querySelector("#k-keyboard");
        this.keys = [];
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
                gline.querySelector(".k-keyline").appendChild(gkey);
                let idx = Object.values(Key).indexOf(key);
                this.keys[idx] = gkey;
            });
            this.element.querySelector(".k-lines").appendChild(gline);
        });
        keyboardElement.appendChild(this.element);
    }
}
let keyboards = [];
class TimePoint {
    constructor(x, y, t) {
        this.x = x;
        this.y = y;
        this.t = t;
    }
}
class Cursor {
    constructor(settings) {
        this.size = 0;
        this.lastPoint = null;
        this.elapsed = 0;
        this.settings = settings;
    }
    update(p) {
        if (this.lastPoint != null) {
            let d = pointDistance(this.lastPoint, p);
            let s = this.settings;
            if (d > s.reduceTreshold) {
                this.size = s.maxDiameter;
            }
            else {
                this.elapsed = p.t - this.lastPoint.t;
                this.size -= this.elapsed * s.reduceVelocity / Math.log(s.smoothReduce + this.size);
                if (this.size < 0)
                    this.size = 0;
            }
        }
        this.lastPoint = p;
    }
    keyDistance(key) {
        let rect = key.getBoundingClientRect();
        let x = (rect.left + rect.right) / 2;
        let y = (rect.top + rect.bottom) / 2;
        let xd = x - this.lastPoint.x;
        let yd = y - this.lastPoint.y;
        return Math.sqrt(xd * xd + yd * yd);
    }
    allKeyDistances(keyboard) {
        let distances = [];
        keyboard.keys.forEach(keyElem => {
            distances.push(this.keyDistance(keyElem));
        });
        return distances;
    }
}
export class CursorSettings {
    constructor() {
        this.minDiameter = 70;
        this.maxDiameter = 300;
        this.reduceVelocity = 2.5;
        this.reduceTreshold = 7;
        this.smoothReduce = 10;
    }
}
function pointDistance(g1, g2) {
    let x = g1.x - g2.x;
    let y = g1.y - g2.y;
    return Math.sqrt(x * x + y * y);
}
class KeyState {
    constructor() {
        this.active = false;
        this.index = -1;
        this.scoreDelta = 0;
    }
}
class KeyPress {
    constructor(key) {
        this.key = key;
        this.scores = [];
        for (let i = 0; i < Object.values(Key).length; i++) {
            this.scores.push(0);
        }
    }
}
export class Candidate {
    constructor(key, idx, s) {
        this.key = key;
        this.index = idx;
        this.score = s;
    }
}
export class KeyboardManager {
    constructor(keyboardLayout, settings, keyHandler) {
        this.lastUpdateTimestamp = 0;
        let pointer = document.getElementById('pointer');
        let mouseX = 0;
        let mouseY = 0;
        this.cursor = new Cursor(settings);
        this.keyboard = new Keyboard(keyboardLayout);
        const interval = setInterval(function () {
            let timestamp = Date.now();
            this.cursor.update(new TimePoint(mouseX, mouseY, timestamp));
            this.update(timestamp);
            let d = this.cursor.settings.minDiameter + this.cursor.size;
            pointer.style.width = d + 'px';
            pointer.style.height = d + 'px';
            pointer.style.left = mouseX - pointer.offsetWidth / 2.0 + 'px';
            pointer.style.top = mouseY - pointer.offsetHeight / 2.0 + 'px';
        }, 15);
        document.addEventListener('mousemove', (e) => {
            mouseX = e.pageX;
            mouseY = e.pageY;
        });
        this.stateArray = [];
        let len = Object.values(Key).length;
        for (let i = 0; i < len; i++) {
            this.stateArray.push(new KeyState());
        }
        this.keyPressList = [];
        this.lastUpdateTimestamp = Date.now();
        this.keyHandler = keyHandler;
    }
    score(elapsed, distance) {
        return 1000 * elapsed / (1 + distance * this.cursor.size);
    }
    updateScore(idx, timestamp, distance) {
        let elapsed = timestamp - this.lastUpdateTimestamp;
        this.stateArray[idx].scoreDelta = this.score(elapsed, distance);
    }
    getScores() {
        return this.stateArray.map(keyState => {
            return keyState.scoreDelta;
        });
    }
    saveScores(idx, scores) {
        if (this.stateArray[idx].active) {
            let listIndex = this.stateArray[idx].index;
            let candidate = this.keyPressList[listIndex];
            for (let i = 0; i < scores.length; i++) {
                candidate.scores[i] += scores[i];
            }
            ;
            this.toSend.push(listIndex);
        }
    }
    updateKey(idx, timestamp, distance) {
        let active = distance < (this.cursor.size + this.cursor.settings.minDiameter) / 2;
        if (this.stateArray[idx].active) {
            this.updateScore(idx, timestamp, distance);
            if (!active) {
                this.stateArray[idx].active = false;
                this.stateArray[idx].index = -1;
                this.stateArray[idx].scoreDelta = 0;
            }
        }
        else {
            if (active) {
                this.stateArray[idx].index = this.keyPressList.length;
                this.keyPressList.push(new KeyPress(idx));
                this.stateArray[idx].active = true;
                console.log(this.keyPressList);
            }
        }
    }
    candidateScores() {
        return this.toSend.map((idx) => {
            let keypress = this.keyPressList[idx];
            let total = keypress.scores.reduce((acc, val) => {
                return acc + val;
            });
            let absolute = keypress.scores[keypress.key];
            let p = Math.log(1 + absolute) * absolute / (total + 1);
            return new Candidate(keypress.key, idx, p);
        });
    }
    update(timestamp) {
        let distances = this.cursor.allKeyDistances(this.keyboard);
        let scores = this.getScores();
        for (let i = 0; i < this.stateArray.length; i++) {
            this.updateKey(i, timestamp, distances[i]);
        }
        this.toSend = [];
        for (let i = 0; i < this.stateArray.length; i++) {
            this.saveScores(i, scores);
        }
        this.lastUpdateTimestamp = timestamp;
        let data = this.candidateScores();
        this.keyHandler(data);
    }
}
