import functools
import itertools
import os
import copy
import edlib
os.environ['TRANSFORMERS_CACHE'] = os.path.abspath("../backend/cache")

import math
import random
from transformers import CamembertModel, CamembertTokenizer, pipeline
import difflib as dl
from joblib import Parallel, delayed
import kmeans1d as km
from safeprint import print

class Prophet:
    prophet_predict = None
    pdict = None
    candidates = None
    predictions = None
    queued = 0

    lut = ["a", "k", "p", "E", "l", "%", "t", "R", "j", "o",
       "f", "s", "i", "d", "Z", "n", "5", "b", "u", "v", 
       "@", "g", "2", "m", "z", "w", "y", "S", "N"]

    def __init__(self):

        print("=== initializing prophet ===")
        # You can replace "camembert-base" with any other model from the table, e.g. "camembert/camembert-large".
        CamembertTokenizer.from_pretrained("camembert/camembert-large")
        CamembertModel.from_pretrained("camembert/camembert-large")

        print("=== preparing ritual ===")
        self.prophet_predict  = pipeline("fill-mask", model="camembert/camembert-large", tokenizer="camembert/camembert-large", top_k=20000)

        print("=== acquiring ancient knowlege ===")
        #open normal and phonetic dictionaries 
        with open("../backend/linguistic/fr-dict.txt", encoding="utf-8") as file:
            words = [line.strip() for line in file]

        with open("../backend/linguistic/fr-simplified.txt", encoding="utf-8") as file:
            phonemes = [line.strip() for line in file]

        
        nb_words = len(words)
        self.pdict = {words[i]: phonemes[i] for i in range(nb_words)}

        self.reset_candidates()

        print("=== prophet ready ===")

    def reset_candidates(self):
        self.candidates = []

    def predict(self, sentence):
        print("sentence: " + sentence)
        res = self.prophet_predict(sentence + "<mask>", )
        pres = [(w["token_str"], self.pdict[w["token_str"].lower()], math.pow(w["score"], 1/15)) for w in res if w["token_str"].lower() in self.pdict.keys()]
        
        pres = sorted(pres, key=lambda x: x[1])
        
        self.prediction =  {key:   [functools.reduce(lambda a, e: (e[0].lower(), e[1], a[2] + e[2]), list(capgroup), ("","",0.0)) 
                        for capkey, capgroup in itertools.groupby(sorted(list(group), key=lambda p: p[0].lower()), lambda p: p[0].lower()) ]
                        for key, group in itertools.groupby(pres, lambda p: p[1])}


    def merge_with(self, f, A, B):
        for k,v in B.items():
            if k in A:
                A[k] = f(A[k], v)
            else:
                A[k] = v
        return A

    def merge_with_all(self, f, D):
        return functools.reduce(lambda A, d : self.merge_with(f, A, d), D)

    def pred_match(self, p, q):
        l = len(q)
        m = p[:l] if l < len(p) else p
        d = edlib.align(q, m, task="distance")["editDistance"]
        lm = len(m)
        r = (p, math.exp(-5.0*d/lm))
        return r


    def pred_rank(self, prediction, query):
        
        r = [self.pred_match(p, query) for p in prediction.keys()]
        d = {w[0]: w[1] for w in r}
        f = [{w[0]: w[2] * d[k] for w in v} for (k, v) in prediction.items()]

        return self.merge_with_all(lambda x, y: x+y ,f)

    def tune_prediction(self, candidates):
        #ranks = pool(delayed( lambda p, n: {k: v*n[1] for k, v in pred_rank(p, n[0]).items()} )(prediction, c) for c in candidates)
        print(self.prediction["vwatyR"])
        ranks = [{k: v*pow(n[1], 10) for k, v in self.pred_rank(self.prediction, n[0]).items()} for n in candidates if len(n[0]) > 0]
        flat = self.merge_with_all(lambda x, y: x+y ,ranks)
        probs = [(k, v) for k, v in flat.items()]
        return sorted(probs, key=lambda x: x[1], reverse=True)
    
    def toWord(self, indices):
        return "".join([self.lut[key] for key in indices])

    def generate_suggestions(self, L, max):
        
        def worker(SL):
            if(len(SL) == 0):
                return [([], 1)]

            letter = SL[0]
            p = letter[1][1]
            candidates = worker(SL[1:])

            if(len(candidates) >= max):
                if(p >= 0.5): return [([letter] + c[0], c[1]*p) for c in candidates]
                else: return [(c[0], c[1]*(1-p)) for c in candidates]
            
            return [(c[0], c[1]*(1-p)) for c in candidates] + [([letter] + c[0], c[1]*p) for c in candidates]

        print("L")
        print(L)
        sorted_letters = [i for i in sorted(enumerate(L), key=lambda x:abs(x[1][1] - 0.5), reverse=True)]

        candidates = worker(sorted_letters)
        print("====canidates====")
        print(candidates)
        reordered = [(sorted(c[0], key=lambda x:x[0]), c[1]) for c in candidates]
        print("====rorerd====")
        
        print(reordered)
        simplified = [(self.toWord([l[1][0] for l in c[0]]),c[1]) for c in reordered]
        return sorted(simplified, key=lambda x:x[1], reverse=True)[:max]
    
    def scores_to_probs(self, candidates):
        
        def sigmoid(x, t, p):
            return 1/(1+math.exp(-p*(x-t)))
        
        def lerp(a,b,x):
            return a*x + b*(1-x)
        
        def coeff(x, t, p1, p2):
            return lerp(p1, p2, sigmoid(x, t, 1))
        
        def ex(t, p):
            return 2/math.fabs(p-t)

        def normalize(x, t, p1, p2):
            p3 = ex(t, p1)
            p4 = ex(t, p2)
            c = coeff(x, t, p3, p4)
            return sigmoid(x, t, c)
        
        scores = sorted([s[1] for s in candidates])

        if(len(scores)== 1):
            return [(candidates[0][0], 1)]
        
        clusters, centroids = km.cluster(scores, 2)
        idx = clusters.index(1)
        thresh = (scores[idx-1]+scores[idx])/2
        print("SCORES")
        print(scores)
        print(thresh)
        return [(s[0], normalize(s[1], thresh, centroids[0], centroids[1])) for s in candidates]


    def get_suggestions(self):
        if(self.candidates is None):
            return []
        full = [c for c in self.candidates if c is not None]
        if(len(full) == 0):
            return []
        
        for c in full:
            print( (self.lut[c[0]], c[0], c[1] ))
        
        print(full)
        normalized = self.scores_to_probs(full)
        generated = self.generate_suggestions(normalized, 20)
        print(generated)
        self.queued = 0
        preds = self.tune_prediction(generated)[:3]
        return [p[0] for p in preds]

    def getQueued(self):
        return self.queued

    def extend_array(self, array, size):
        for i in range(size):
            array.append(None)
        return array
    
    def update_candidates(self, data):
        cl = len(self.candidates)
        for c in data:
            if(c[1] >= cl):
                self.candidates = self.extend_array(self.candidates, 3*(1 + c[1] - cl))
            if(c[2] >= 0.0001):
               self.candidates[c[1]] = (c[0], c[2])
        self.queued += 1
