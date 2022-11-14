import functools
import itertools
import os
import copy
import edlib
os.environ['TRANSFORMERS_CACHE'] = "C:\\Users\\RedSk\\Documents\\prog\\EREM\\backend\\cache"

import math
import random
from transformers import CamembertModel, CamembertTokenizer, pipeline
import difflib as dl
from joblib import Parallel, delayed

TYPING_WEIGHT = 1.0


initialized = False
prophet_predict = None
pdict = None
pool = None

def init():

    global initialized
    global prophet_predict
    global pdict
    global pool

    print("=== initializing prophet ===")
    # You can replace "camembert-base" with any other model from the table, e.g. "camembert/camembert-large".
    CamembertTokenizer.from_pretrained("camembert/camembert-large")
    CamembertModel.from_pretrained("camembert/camembert-large")

    print("=== preparing ritual ===")
    prophet_predict  = pipeline("fill-mask", model="camembert/camembert-large", tokenizer="camembert/camembert-large", top_k=20000)

    print("=== acquiring ancient knowlege ===")
    #open normal and phonetic dictionaries 
    with open("../backend/linguistic/fr-dict.txt", encoding="utf-8") as file:
        words = [line.strip() for line in file]

    with open("../backend/linguistic/fr-simplified.txt", encoding="utf-8") as file:
        phonemes = [line.strip() for line in file]

    
    nb_words = len(words)
    pdict = {words[i]: phonemes[i] for i in range(nb_words)}

    pool = Parallel(n_jobs=4)
    print("=== prophet ready ===")
    initialized = True




def predict(sentence):
    global initialized
    global prophet_predict
    global pdict
    if(not initialized):
        print("please call init first")
        return
    print("sentence: " + sentence)
    res = prophet_predict(sentence + "<mask>", )
    pres = [(w["token_str"], pdict[w["token_str"].lower()], w["score"]) for w in res if w["token_str"].lower() in pdict.keys()]
    
    pres = sorted(pres, key=lambda x: x[1])
    
    pred =  {key:   [functools.reduce(lambda a, e: (e[0].lower(), e[1], a[2] + e[2]), list(capgroup), ("","",0.0)) 
                      for capkey, capgroup in itertools.groupby(sorted(list(group), key=lambda p: p[0].lower()), lambda p: p[0].lower()) ]
                      for key, group in itertools.groupby(pres, lambda p: p[1])}
    return pred


def merge_with(f, A, B):
    for k,v in B.items():
        if k in A:
            A[k] = f(A[k], v)
        else:
            A[k] = v
    return A

def merge_with_all(f, D):
    return functools.reduce(lambda A, d : merge_with(f, A, d), D)

def pred_match(p, q):
    l = len(q)
    m = p[:l] if l < len(p) else p
    d = edlib.align(q, m, task="distance")["editDistance"]
    lm = len(m)
    r = (p, math.exp(-5.0*d/lm))
    return r


def pred_rank(prediction, query):
    global TYPING_WEIGHT
    r = [pred_match(p, query) for p in prediction.keys()]
    d = {w[0]: w[1] for w in r}
    f = [{w[0]: w[2] * pow(d[k], TYPING_WEIGHT) for w in v} for (k, v) in prediction.items()]

    return merge_with_all(lambda x, y: x+y ,f)

def tune_prediction(prediction, candidates):
    global pool
    #ranks = pool(delayed( lambda p, n: {k: v*n[1] for k, v in pred_rank(p, n[0]).items()} )(prediction, c) for c in candidates)
    ranks = [{k: v*n[1] for k, v in pred_rank(prediction, n[0]).items()} for n in candidates]
    flat = merge_with_all(lambda x, y: x+y ,ranks)
    probs = [(k, v) for k, v in flat.items()]
    return sorted(probs, key=lambda x: x[1], reverse=True)[:10]
