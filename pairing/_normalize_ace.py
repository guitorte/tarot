"""Normalizer for the Ace-of-Swords-as-primary files (ace_to_<suit>.txt).

These already carry full v1.3 dynamic sections (genesis/antagonism/inhibition/
devolution/dependency with correct fields); only the header, numerical_relation,
antagonism position labels, and metadata drift. We pass every dynamic field
through verbatim and fix:
  archetype_swords -> §6 canonical (ace); same-suit -> archetype_swords_1/_2
  numerical_relation 'Ace-N (gloss)' -> §4 '1 + N = sum (Trump; gloss)'
  antagonism positions -> ace_of_swords_position + ace_of_<target>_position
    (cross-suit); <word>_of_swords_position for same-suit differing;
    swords_position_1/_2 for the Ace+Ace self-pairing
  metadata format_version -> 1.3

Does NOT author missing blocks. Usage:
  python3 pairing/_normalize_ace.py pairing/swords/ace_to_<suit>.txt ...
"""
import sys, re, os

TRUMPS = {0:"The Fool",1:"The Magician",2:"The High Priestess",3:"The Empress",
    4:"The Emperor",5:"The Pope",6:"The Lovers",7:"The Chariot",8:"Justice",
    9:"The Hermit",10:"The Wheel of Fortune",11:"Strength",12:"The Hanged Man",
    13:"Death",14:"Temperance",15:"The Devil",16:"The Tower",17:"The Star",
    18:"The Moon",19:"The Sun",20:"Judgement",21:"The World"}
ROMAN = {1:"I",2:"II",3:"III",4:"IV",5:"V",6:"VI",7:"VII",8:"VIII",9:"IX",
    10:"X",11:"XI",12:"XII",13:"XIII",14:"XIV",15:"XV"}
VAL = {"ace":1,"page":11,"knight":12,"queen":13,"king":14}
WORD = {"Ace":"ace","2":"two","3":"three","4":"four","5":"five","6":"six",
        "7":"seven","8":"eight","9":"nine","10":"ten","Page":"page",
        "Knight":"knight","Queen":"queen","King":"king"}
TOKEN = {"Ace":"ace","Page":"page","Knight":"knight","Queen":"queen","King":"king"}
ELEM = {"pentacles":"earth","cups":"water","wands":"fire","swords":"air"}
ACE_ARCH = "The New Truth, The Clarity Arrived, The Insight Witnessed, Thought Ignited"


def cardval(tok): return int(tok) if tok.isdigit() else VAL.get(tok)


def trump(total):
    return f"{total} ({ROMAN[total]} {TRUMPS[total]}"


def parse_fields(section_text):
    out = []
    for line in section_text.splitlines():
        m = re.match(r"\s{2}([a-z0-9_]+): ?(.*)", line)
        if m:
            out.append([m.group(1), m.group(2)])
    return out


def get(fields, key):
    for k, v in fields:
        if k == key:
            return v
    return None


def normalize(path):
    fn = os.path.basename(path)
    target = re.match(r"^ace_to_([a-z]+)\.txt$", fn).group(1)
    same = (target == "swords")

    blocks = open(path, encoding="utf-8").read().split("\n---\n")
    out = []
    for b in blocks:
        if "card_pair:" not in b:
            continue
        cp_full = re.search(r"card_pair: (.+)", b).group(1).strip()
        target_disp = re.search(r", (.+?) of " + target.capitalize(), cp_full).group(1).strip()
        ttok = TOKEN.get(target_disp, target_disp)
        b2 = cardval(ttok)
        is_self = same and ttok == "ace"

        def sec(name, after):
            mm = re.search(rf"{name}:\n(.*?)(?=\n{after}|\Z)", b, re.DOTALL)
            return parse_fields(mm.group(1)) if mm else []
        genesis = sec("dynamic_genesis", "dynamic_antagonism")
        antag = sec("dynamic_antagonism", "dynamic_inhibition")
        inhib = sec("dynamic_inhibition", "dynamic_devolution")
        devol = sec("dynamic_devolution", "dynamic_dependency")
        deps = sec("dynamic_dependency", "structural_metadata")

        e_bridge = re.search(r"elemental_bridge: (.+)", b).group(1).strip()
        thresh = re.search(r"threshold_type: (.+)", b).group(1).strip()
        nm = re.search(r"numerical_relation: .*?\((.+)\)", b)
        gloss = nm.group(1).strip() if nm else "the new truth meets what follows"

        if same:
            arch1, arch2 = f"archetype_swords_1: {ACE_ARCH}", f"archetype_swords_2: {ACE_ARCH}"
        else:
            other = re.search(rf"archetype_{target}: (.+)", b).group(1).strip()
            arch1, arch2 = f"archetype_swords: {ACE_ARCH}", f"archetype_{target}: {other}"

        # antagonism position values, in order
        pos = [v for k, v in antag if "_position" in k]
        if is_self:
            plabels = ["swords_position_1", "swords_position_2"]
        elif same:
            plabels = ["ace_of_swords_position", f"{WORD[target_disp]}_of_swords_position"]
        else:
            plabels = ["ace_of_swords_position", f"ace_of_{target}_position"]

        block = f"""card_pair: {cp_full}
{arch1}
{arch2}
numerical_relation: 1 + {b2} = {trump(1 + b2)}; {gloss})
elemental_bridge: {e_bridge}
threshold_type: {thresh}

dynamic_genesis:
  mechanism: {get(genesis,'mechanism')}
  process: {get(genesis,'process')}
  outcome: {get(genesis,'outcome')}
  key_terms: {get(genesis,'key_terms')}

dynamic_antagonism:
  mechanism: {get(antag,'mechanism')}
  tension_axis: {get(antag,'tension_axis')}
  {plabels[0]}: {pos[0]}
  {plabels[1]}: {pos[1]}
  key_terms: {get(antag,'key_terms')}

dynamic_inhibition:
  mechanism: {get(inhib,'mechanism')}
  blockade_nature: {get(inhib,'blockade_nature')}
  swords_state: {get(inhib,'swords_state')}
  consequence: {get(inhib,'consequence')}
  key_terms: {get(inhib,'key_terms')}

dynamic_devolution:
  mechanism: {get(devol,'mechanism')}
  mode: {get(devol,'mode')}
  loss: {get(devol,'loss')}
  key_terms: {get(devol,'key_terms')}

dynamic_dependency:
  mechanism: {get(deps,'mechanism')}
  function: {get(deps,'function')}
  integration_outcome: {get(deps,'integration_outcome')}
  key_terms: {get(deps,'key_terms')}

structural_metadata:
  series_count: 14
  format_version: 1.3
  ontology: jodorowskian numerological psychology with {target} graduation
  encoding: UTF-8
  elemental_primary: air (swords) to {ELEM[target]} ({target})
  numerical_axis: 1-1 through 1-14
  uid: AOS{target[0].upper()}"""
        out.append(block)
    return "\n\n---\n\n".join(out) + "\n"


if __name__ == "__main__":
    for path in sys.argv[1:]:
        result = normalize(path)
        open(path, "w", encoding="utf-8").write(result)
        print(f"normalized {path}")
