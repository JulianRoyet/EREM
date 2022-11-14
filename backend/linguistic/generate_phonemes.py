import os
import csv

with open("Lexique383/Lexique383.tsv") as f:
    content = csv.reader(f, delimiter="\t")
    data = [line for line in content]
    pairs = [(line[0], line[1]) for line in data[1:]]
    
pairs = list(dict.fromkeys(pairs))
words = [line[0] for line in pairs]
phonemes = [line[1] for line in pairs]

#print(os.popen('cat fr-normal-dict.txt | espeak -v fr -q --ipa --phonout fr-espeak.txt').read())

"""
def clean_phonemes(s):
    return s\
        .replace("ɔ̃", "C")\
        .replace("ɑ̃", "A")\
        .replace("ɛ̃", "€")\
        .replace("œ̃", "E")\
        .strip()

espeak_out = []
with open('fr-espeak.txt', 'r') as f:
    espeak_out = f.read()\
        .replace("ˈ", "")\
        .replace("ˌ", "")\
        .replace("ː", "")\
        .replace("-", "")\
        .split("\n")

phonemes = [clean_phonemes(p) for p in espeak_out]
"""

with open('fr-dict.txt', 'w') as f:
    f.write('\n'.join(words)) 

with open('fr-phonemes.txt', 'w') as f:
    f.write('\n'.join(phonemes)) 