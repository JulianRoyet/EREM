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
            print("candidate")
            self.prophet.update_candidates(candidates)
            return self.suggestions
    
    def predict(self, sentence):
        with self.lock:
            print("request predict")
            self.sentence = sentence
    
    def run(self):
        while True:
            time.sleep(0.1)
            if self.prophet.getQueued() > 0:
                suggestions = self.prophet.get_suggestions()
                print("got suggestions")
            else:
                suggestions = self.suggestions
            with self.lock:
                self.suggestions = suggestions
                if(self.sentence != None):
                    print("predict")
                    self.prophet.predict(self.sentence)
                    self.sentence = None
            
process = ProphetProcess()

def clientHandle(msg):
    decoded = json.loads(msg)
    ty = decoded["type"]
    obj = decoded["content"]

    if ty == "candidates":
        send("suggestions", process.postCandidates(obj))

    elif ty == "sentence":
        process.predict(obj)

def send(type, message):
    typed = {"type": type, "content": message}
    asStr = json.dumps(typed)
    print("<EREM.MSG>:" + asStr)

process.start()

send("ready", None)

for msg in sys.stdin:
    clientHandle(msg)

