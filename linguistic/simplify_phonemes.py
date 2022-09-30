def simplify(s):
    return s\
        .replace('x', 'R')\
        .replace('O', 'o')\
        .replace('1', '5')\
        .replace('e', 'E')\
        .replace('°', '2')\
        .replace('8', 'y')\
        .replace('9', '2')\
        .replace('G', 'ng')




phonemes = []
with open("fr-phonemes.txt") as file:
    phonemes = [line.strip() for line in file]

simple = [simplify(p) for p in phonemes]


with open('fr-simplified.txt', 'w') as f:
    f.write('\n'.join(simple)) 