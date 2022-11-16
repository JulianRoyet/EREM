from concurrent import futures
import sys
from threading import Lock, Thread
import time
import prophet as pro
import json
from safeprint import print

class ProphetProcess(Thread):
    prophet = None
    suggestions = []
    lock = Lock() 
    sentence = None

    def __init__(self):
        super().__init__()
        self.prophet = pro.Prophet()
    
    def postCandidates(self, candidates):
        with self.lock:
            self.prophet.update_candidates(candidates)
    
    def predict(self, sentence):
        with self.lock:
            self.sentence = sentence
            
    def getSuggestions(self):
        with self.lock:
            return self.suggestions
    
    def run(self):
        while True:
            time.sleep(0.01)
            if self.prophet.getQueued() > 0:
                suggestions = self.prophet.get_suggestions()
            else:
                suggestions = self.suggestions
            with self.lock:
                self.suggestions = suggestions
                if(self.sentence != None):
                    self.prophet.reset_candidates()
                    self.prophet.predict(self.sentence)
                    self.prophet.queued+=1
                    self.sentence = None
            
process = ProphetProcess()

def clientHandle(msg):
    decoded = json.loads(msg)
    ty = decoded["type"]
    obj = decoded["content"]

    if ty == "candidates":
        process.postCandidates(obj)

    elif ty == "sentence":
        process.predict(obj)
    
    elif ty == "requestSuggestions":
        send("suggestions", process.getSuggestions())

def send(type, message):
    typed = {"type": type, "content": message}
    asStr = json.dumps(typed)
    print("<EREM.MSG>:" + asStr)

process.start()

send("ready", None)

for msg in sys.stdin:
    clientHandle(msg)

