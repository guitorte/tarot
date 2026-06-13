"""One-shot helper: rewrite bare `a-token (gloss)` numerical_relation lines to
§4 form `a + b = sum (Trump; gloss)`, and fix format_version/uid from filename.
Only touches numerical_relation, format_version, uid. Field-structure drift
(files 6-7 extra fields, files 8+ reduced) must be handled separately.
Usage: python3 pairing/_normalize_numeric.py <file> ..."""
import sys, re, os

TRUMPS = {0:"The Fool",1:"The Magician",2:"The High Priestess",3:"The Empress",
    4:"The Emperor",5:"The Pope",6:"The Lovers",7:"The Chariot",8:"Justice",
    9:"The Hermit",10:"The Wheel of Fortune",11:"Strength",12:"The Hanged Man",
    13:"Death",14:"Temperance",15:"The Devil",16:"The Tower",17:"The Star",
    18:"The Moon",19:"The Sun",20:"Judgement",21:"The World"}
ROMAN = {0:"0",1:"I",2:"II",3:"III",4:"IV",5:"V",6:"VI",7:"VII",8:"VIII",9:"IX",
    10:"X",11:"XI",12:"XII",13:"XIII",14:"XIV",15:"XV",16:"XVI",17:"XVII",
    18:"XVIII",19:"XIX",20:"XX",21:"XXI"}
VAL = {"ace":1,"page":11,"knight":12,"queen":13,"king":14}
RUID = {"ace":"A","10":"X","page":"P","knight":"N","queen":"Q","king":"K"}
TUID = {"pentacles":"P","cups":"C","wands":"W","swords":"S"}

def value(tok):
    t = tok.strip().lower()
    if t.isdigit(): return int(t)
    return VAL.get(t)

def trump_clause(total):
    final = total if total <= 21 else sum(int(d) for d in str(total))
    red = "" if total <= 21 else f" → {'+'.join(str(total))}={final}"
    return f"{total}{red} ({ROMAN[final]} {TRUMPS[final]};"

for path in sys.argv[1:]:
    fname = os.path.basename(path)
    m = re.match(r"^([a-z0-9]+)_to_([a-z]+)\.txt$", fname)
    prim, target = m.group(1), m.group(2)
    a = value(prim)
    ruid = RUID.get(prim, prim if prim.isdigit() else "?")
    uid = ruid + "OS" + TUID[target]
    s = open(path, encoding="utf-8").read()
    s = s.replace("format_version: 1.2", "format_version: 1.3")
    s = re.sub(r"uid: \w+", f"uid: {uid}", s)
    def repl(mm):
        btok, gloss = mm.group(1), mm.group(2)
        b = value(btok)
        total = a + b
        return f"numerical_relation: {a} + {b} = {trump_clause(total)} {gloss})"
    s = re.sub(r"numerical_relation:\s*\d+-([A-Za-z0-9]+)\s*\(([^)]*)\)", repl, s)
    open(path, "w", encoding="utf-8").write(s)
    print(f"normalized {path}  (uid={uid})")
