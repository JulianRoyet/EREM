from collections import Counter
import difflib as dl
from joblib import Parallel, delayed


#open normal and phonetic dictionaries 
with open("fr-dict.txt") as file:
    words = [line.strip() for line in file]

with open("fr-simplified.txt") as file:
    phonemes = [line.strip() for line in file]

#count the number of each phoneme in the dictionary
count = Counter("".join(phonemes) )
for (i, (p, c)) in enumerate(count.items()):
    print(str(i) + " - " + p + " : " + str(c))

"""
#
uniques = list(dict.fromkeys(phonemes))


def match(p, q):
    return (p, dl.SequenceMatcher(None, p, q).ratio())

def rsort(wr):
    return sorted(wr, key=lambda x: x[1], reverse=True)

def rank(query):
    l = len(query)
    truncated = [p[:l] if len(p) < l else p for p in uniques ]

    return Parallel(n_jobs=4)(delayed(match)(p, query) for p in truncated)

ranked = rank("fam")
srank = rsort(ranked)
print(srank[:20])
"""