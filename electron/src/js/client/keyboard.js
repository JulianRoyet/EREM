"use strict";
exports.__esModule = true;
exports.KeyboardManager = exports.Candidate = exports.CursorSettings = exports.KeyLine = exports.Key = void 0;
function makeFrag(templateId) {
    var frag = document.createDocumentFragment();
    var template = document.getElementById(templateId);
    frag.appendChild(template.firstElementChild.cloneNode(true));
    return frag;
}
function makeElem(templateId) {
    var template = document.getElementById(templateId).firstElementChild;
    return template.cloneNode(true);
}
var Key;
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
})(Key = exports.Key || (exports.Key = {}));
var KeyLine = /** @class */ (function () {
    function KeyLine(k) {
        this.keys = k;
    }
    return KeyLine;
}());
exports.KeyLine = KeyLine;
var Keyboard = /** @class */ (function () {
    function Keyboard(layout) {
        var _this = this;
        var keyboardElement = document.querySelector("#k-keyboard");
        this.keys = [];
        var len = Object.keys(Key).length;
        for (var i = 0; i < len; i++) {
            this.keys.push(null);
        }
        this.element = makeFrag("t-keyboard");
        layout.lines.forEach(function (line) {
            var gline = makeFrag("t-keyline");
            line.keys.forEach(function (key) {
                var gkey = makeElem("t-key");
                gkey.querySelector(".k-text").textContent = key.toString();
                gline.querySelector(".k-keyline").appendChild(gkey);
                var idx = Object.values(Key).indexOf(key);
                _this.keys[idx] = gkey;
            });
            _this.element.querySelector(".k-lines").appendChild(gline);
        });
        keyboardElement.appendChild(this.element);
    }
    return Keyboard;
}());
var keyboards = [];
var TimePoint = /** @class */ (function () {
    function TimePoint(x, y, t) {
        this.x = x;
        this.y = y;
        this.t = t;
    }
    return TimePoint;
}());
var Cursor = /** @class */ (function () {
    function Cursor(settings) {
        this.size = 0;
        this.lastPoint = null;
        this.elapsed = 0;
        this.settings = settings;
    }
    Cursor.prototype.update = function (p) {
        if (this.lastPoint != null) {
            var d = pointDistance(this.lastPoint, p);
            var s = this.settings;
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
    };
    Cursor.prototype.keyDistance = function (key) {
        var rect = key.getBoundingClientRect();
        var x = (rect.left + rect.right) / 2;
        var y = (rect.top + rect.bottom) / 2;
        var xd = x - this.lastPoint.x;
        var yd = y - this.lastPoint.y;
        return Math.sqrt(xd * xd + yd * yd);
    };
    Cursor.prototype.allKeyDistances = function (keyboard) {
        var _this = this;
        var distances = [];
        keyboard.keys.forEach(function (keyElem) {
            distances.push(_this.keyDistance(keyElem));
        });
        return distances;
    };
    return Cursor;
}());
var CursorSettings = /** @class */ (function () {
    function CursorSettings() {
        this.minDiameter = 70;
        this.maxDiameter = 300;
        this.reduceVelocity = 2.5;
        this.reduceTreshold = 7;
        this.smoothReduce = 10;
    }
    return CursorSettings;
}());
exports.CursorSettings = CursorSettings;
function pointDistance(g1, g2) {
    var x = g1.x - g2.x;
    var y = g1.y - g2.y;
    return Math.sqrt(x * x + y * y);
}
var KeyState = /** @class */ (function () {
    function KeyState() {
        this.active = false;
        this.index = -1;
        this.scoreDelta = 0;
    }
    return KeyState;
}());
var KeyPress = /** @class */ (function () {
    function KeyPress(key) {
        this.key = key;
        this.scores = [];
        for (var i = 0; i < Object.values(Key).length; i++) {
            this.scores.push(0);
        }
    }
    return KeyPress;
}());
var Candidate = /** @class */ (function () {
    function Candidate(idx, s) {
        this.index = idx;
        this.score = s;
    }
    return Candidate;
}());
exports.Candidate = Candidate;
var KeyboardManager = /** @class */ (function () {
    function KeyboardManager(keyboardLayout, settings, keyHandler) {
        this.lastUpdateTimestamp = 0;
        var pointer = document.getElementById('pointer');
        var mouseX = 0;
        var mouseY = 0;
        this.cursor = new Cursor(settings);
        this.keyboard = new Keyboard(keyboardLayout);
        var interval = setInterval(function () {
            var timestamp = Date.now();
            this.cursor.update(new TimePoint(mouseX, mouseY, timestamp));
            this.update(timestamp);
            var d = this.cursor.settings.minDiameter + this.cursor.size;
            pointer.style.width = d + 'px';
            pointer.style.height = d + 'px';
            pointer.style.left = mouseX - pointer.offsetWidth / 2.0 + 'px';
            pointer.style.top = mouseY - pointer.offsetHeight / 2.0 + 'px';
        }, 15);
        document.addEventListener('mousemove', function (e) {
            mouseX = e.pageX;
            mouseY = e.pageY;
        });
        this.stateArray = [];
        var len = Object.values(Key).length;
        for (var i = 0; i < len; i++) {
            this.stateArray.push(new KeyState());
        }
        this.keyPressList = [];
        this.lastUpdateTimestamp = Date.now();
        this.keyHandler = keyHandler;
    }
    KeyboardManager.prototype.score = function (elapsed, distance) {
        return 1000 * elapsed / (1 + distance * this.cursor.size);
    };
    KeyboardManager.prototype.updateScore = function (idx, timestamp, distance) {
        var elapsed = timestamp - this.lastUpdateTimestamp;
        this.stateArray[idx].scoreDelta = this.score(elapsed, distance);
    };
    KeyboardManager.prototype.getScores = function () {
        return this.stateArray.map(function (keyState) {
            return keyState.scoreDelta;
        });
    };
    KeyboardManager.prototype.saveScores = function (idx, scores) {
        if (this.stateArray[idx].active) {
            var listIndex = this.stateArray[idx].index;
            var candidate = this.keyPressList[listIndex];
            for (var i = 0; i < scores.length; i++) {
                candidate.scores[i] += scores[i];
            }
            ;
            this.toSend.push(listIndex);
        }
    };
    KeyboardManager.prototype.updateKey = function (idx, timestamp, distance) {
        var active = distance < (this.cursor.size + this.cursor.settings.minDiameter) / 2;
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
    };
    KeyboardManager.prototype.candidateScores = function () {
        var _this = this;
        return this.toSend.map(function (idx) {
            var keypress = _this.keyPressList[idx];
            var total = keypress.scores.reduce(function (acc, val) {
                return acc + val;
            });
            var absolute = keypress.scores[keypress.key];
            var p = Math.log(1 + absolute) * absolute / (total + 1);
            return new Candidate(idx, p);
        });
    };
    KeyboardManager.prototype.update = function (timestamp) {
        var distances = this.cursor.allKeyDistances(this.keyboard);
        var scores = this.getScores();
        for (var i = 0; i < this.stateArray.length; i++) {
            this.updateKey(i, timestamp, distances[i]);
        }
        this.toSend = [];
        for (var i = 0; i < this.stateArray.length; i++) {
            this.saveScores(i, scores);
        }
        this.lastUpdateTimestamp = timestamp;
        var data = this.candidateScores();
        this.keyHandler(data);
    };
    return KeyboardManager;
}());
exports.KeyboardManager = KeyboardManager;
