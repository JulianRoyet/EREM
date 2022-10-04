import itertools
import os
import copy
import edlib
os.environ['TRANSFORMERS_CACHE'] = "G:\\ML\\Projects\\cache"

import random
from transformers import CamembertModel, CamembertTokenizer, pipeline
import difflib as dl
from joblib import Parallel, delayed

print("=== loading models ===")
# You can replace "camembert-base" with any other model from the table, e.g. "camembert/camembert-large".
tokenizer = CamembertTokenizer.from_pretrained("camembert/camembert-large")
camembert = CamembertModel.from_pretrained("camembert/camembert-large")

print("=== creating pipeline ===")
camembert_fill_mask  = pipeline("fill-mask", model="camembert/camembert-large", tokenizer="camembert/camembert-large", top_k=20000)

print("=== loading dict files ===")
#open normal and phonetic dictionaries 
with open("fr-dict.txt", encoding="utf-8") as file:
    words = [line.strip() for line in file]

with open("fr-simplified.txt", encoding="utf-8") as file:
    phonemes = [line.strip() for line in file]

nb_words = len(words)
pdict = {words[i]: phonemes[i] for i in range(nb_words)}
rdict = {phonemes[i]: words[i] for i in range(nb_words)}

def make_phonetic(sentence):
    return " ".join([pdict[w.lower().strip()] for w in sentence.split(" ")])

def match(p, q):
    l = len(q)
    m = p[:l] if len(p) < l else p
    return (p, 1.0/(edlib.align(q, m, task="distance")["editDistance"] + 1.0))

def rsort(wr, off=1):
    return sorted(wr, key=lambda x: x[off], reverse=True)

def rank(query):
    r = Parallel(n_jobs=4)(delayed(match)(p, query) for p in phonemes)
    
    return {w[0]: w[1] for w in r}

def simulate(sentence, prompt):
    pred = "" + prompt
    ps = make_phonetic(sentence) + " "
    psl = len(ps)
    begin = 0

    res = []
    pres = []
    tr = []
    print("=== typing sentence ===")
    print("sentence: " + sentence)

    for i in range(psl):
        if begin == i:
            res = camembert_fill_mask(pred + "<mask>", )
            pres = [(w["token_str"], pdict[w["token_str"].lower()], w["score"]) for w in res if w["token_str"].lower() in pdict.keys()]
           
            pres = sorted(pres, key=lambda x: x[1])
            pred_dict = {key: list(group) for key, group in itertools.groupby(pres, lambda p: p[1])}


        typed = ps[begin:i+1]
        print("typed: '" + typed + "'")
        if(ps[i] == " "):
            begin = i+1
            pred += s[0][0] + " "
            print("prediction: " + pred[len(prompt):])
            continue
        tr = rank(typed)
        sr = rsort([(k, v) for (k, v) in tr.items()])
        #print("sr: " + str(sr[:20]))
        
        fr = copy.deepcopy(pred_dict)

        for c in sr:
            if c[0] in fr.keys() and c[0] != "":
                fr[c[0]] = [(e[0], e[1], e[2]*pow(c[1], 10.0) ) for e in fr[c[0]]]
                

        lr = [item for sublist in fr.values() for item in sublist]
        #print("lr: " + str(lr[:3]))
        s = sorted(lr, key=lambda x: x[2], reverse=True)
        print("best candidates: " + str(s[:3]))


simulate("Bonjour une baguette et deux croissants s il vous plaît", "Paul: Bonjour\n Inconnu: Bonjour\n Paul: ")