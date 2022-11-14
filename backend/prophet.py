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


class Prophet:
    prophet_predict = None
    pdict = None
    candidates = None

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
        pres = [(w["token_str"], self.pdict[w["token_str"].lower()], w["score"]) for w in res if w["token_str"].lower() in self.pdict.keys()]
        
        pres = sorted(pres, key=lambda x: x[1])
        
        pred =  {key:   [functools.reduce(lambda a, e: (e[0].lower(), e[1], a[2] + e[2]), list(capgroup), ("","",0.0)) 
                        for capkey, capgroup in itertools.groupby(sorted(list(group), key=lambda p: p[0].lower()), lambda p: p[0].lower()) ]
                        for key, group in itertools.groupby(pres, lambda p: p[1])}
        return pred


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

    def tune_prediction(self, prediction, candidates):
        #ranks = pool(delayed( lambda p, n: {k: v*n[1] for k, v in pred_rank(p, n[0]).items()} )(prediction, c) for c in candidates)
        ranks = [{k: v*n[1] for k, v in self.pred_rank(prediction, n[0]).items()} for n in candidates]
        flat = self.merge_with_all(lambda x, y: x+y ,ranks)
        probs = [(k, v) for k, v in flat.items()]
        return sorted(probs, key=lambda x: x[1], reverse=True)[:10]

    def generate_suggestions(L, max):
        
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
            

        sorted_letters = [i for i in sorted(enumerate(L), key=lambda x:abs(x[1][1] - 0.5), reverse=True)]

        candidates = worker(sorted_letters)

        reordered = [(sorted(c[0], key=lambda x:x[0]), c[1]) for c in candidates]

        return sorted(reordered, key=lambda x:x[1], reverse=True)[:max]

    

    def get_suggestions(self):
        pass

    def extend_array(self, array, size):
        for i in range(size):
            array.append(None)
        return array
    
    def update_candidates(self, data):
        cl = len(self.candidates)
        for c in data:
            if(c[1] >= cl):
                self.candidates = self.extend_array(self.candidates, 3*(1 + c[1] - cl))
            
            self.candidates[c[1]] = (c[0], c[2])
