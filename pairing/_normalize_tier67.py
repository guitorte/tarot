"""Normalizer for the "files 6-7" drift tier (verbose era): cards 5-7 cross-suit.

Single parse-and-emit pass per block. Field remaps (per FORMAT_SPEC §9):
  inhibition  mechanism/consequence/spatial_logic (3)
              -> mechanism / blockade_nature<-consequence / swords_state<-spatial_logic
                 / consequence(synth from mechanism tail) / key_terms(synth or provided)
  devolution  mechanism/corruption/loss/key_terms  -> rename corruption->mode
  dependency  mechanism/integration/paradox/outcome/key_terms (5)
              -> mechanism / function<-integration / integration_outcome<-outcome / key_terms
                 (drop paradox)
Header: archetype_swords->§6 canonical; numerical_relation->§4 (recompute trump, keep gloss);
metadata normalized. genesis/antagonism are already canonical and pass through unchanged.

Does NOT author the missing Ace block — prepend that separately per file.
Usage: python3 pairing/_normalize_tier67.py <file_to_<suit>.txt> ...
"""
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
ELEM = {"pentacles":"earth","cups":"water","wands":"fire","swords":"air"}
ARCH_SWORDS = {
    "5":"Conflict, defeat, hollow victory, defeat-at-cost, contested truth",
    "6":"The Traveler, The Departure, The Crossing, The Healer Through Distance",
    "7":"The Thief, The Cunning Escape, The Duplicity, The Strategic Theft",
}

def cardval(tok):
    t = tok.strip().lower()
    return int(t) if t.isdigit() else VAL.get(t)

def trump(total):
    final = total if total <= 21 else sum(int(d) for d in str(total))
    red = "" if total <= 21 else f" → {'+'.join(str(total))}={final}"
    return f"{total}{red} ({ROMAN[final]} {TRUMPS[final]}"

def gloss_of(paren):
    """Extract a concrete gloss from the original (messy) numerical parenthetical."""
    p = paren.strip()
    if "?" in p:          p = p.rsplit("?", 1)[1]
    elif ";" in p:        p = p.split(";", 1)[1]
    elif "," in p:        p = p.split(",", 1)[1]
    return p.strip().rstrip(")").strip()

def parse_fields(section_text):
    """Return ordered [(key,val)] from an indented field block."""
    out = []
    for line in section_text.splitlines():
        m = re.match(r"\s{2}([a-z0-9_]+): (.*)", line)
        if m: out.append([m.group(1), m.group(2)])
    return out

def get(fields, key):
    for k, v in fields:
        if k == key: return v
    return None

def synth_consequence(mech):
    for sep in [";", "—", "--"]:
        if sep in mech:
            return mech.rsplit(sep, 1)[1].strip()
    return "neither figure can move toward the other; the meeting stalls"

def normalize(path, inh_keyterms=None):
    fn = os.path.basename(path)
    m = re.match(r"^([a-z0-9]+)_to_([a-z]+)\.txt$", fn)
    prim, target = m.group(1), m.group(2)
    uid = RUID.get(prim, prim) + "OS" + TUID[target]
    elem = f"air (swords) to {ELEM[target]} ({target})"
    a = cardval(prim)
    inh_keyterms = inh_keyterms or {}

    blocks = open(path, encoding="utf-8").read().split("\n---\n")
    out_blocks = []
    for b in blocks:
        if "card_pair:" not in b:
            continue
        cp = re.search(r"card_pair: (.+?), (.+?) of " + target.capitalize(), b)
        cp_full = re.search(r"card_pair: (.+)", b).group(1).strip()
        target_card = re.search(r", (.+?) of ", cp_full).group(1).strip()
        b2 = cardval(target_card)

        # sections
        def sec(name, after):
            mm = re.search(rf"{name}:\n(.*?)(?=\n{after}|\Z)", b, re.DOTALL)
            return parse_fields(mm.group(1)) if mm else []
        genesis = sec("dynamic_genesis", "dynamic_antagonism")
        antag = sec("dynamic_antagonism", "dynamic_inhibition")
        inhib = sec("dynamic_inhibition", "dynamic_devolution")
        devol = sec("dynamic_devolution", "dynamic_dependency")
        deps = sec("dynamic_dependency", "structural_metadata")

        # header
        arch_cups = re.search(rf"archetype_{target}: (.+)", b).group(1).strip()
        e_bridge = re.search(r"elemental_bridge: (.+)", b).group(1).strip()
        thresh = re.search(r"threshold_type: (.+)", b).group(1).strip()
        nm = re.search(r"numerical_relation: .*?\((.+)\)", b)
        if nm:
            num_paren = nm.group(1)
        else:
            # malformed line without parens (e.g. "5 + Page = <gloss>")
            raw = re.search(r"numerical_relation: (.+)", b).group(1)
            num_paren = raw.split("=", 1)[1].strip() if "=" in raw else raw

        # inhibition remap
        i_mech = get(inhib, "mechanism") or "the pairing freezes"
        i_block = get(inhib, "consequence") or get(inhib, "blockade_nature") or i_mech
        i_state = get(inhib, "spatial_logic") or get(inhib, "swords_state") or "held in suspension"
        i_cons = get(inhib, "consequence_final") or synth_consequence(i_mech)
        i_kt = inh_keyterms.get(target_card) or get(inhib, "key_terms") \
               or "frozen meeting, suspended movement, blocked passage, held distance"

        # devolution remap
        d_mech = get(devol, "mechanism")
        d_mode = get(devol, "corruption") or get(devol, "mode")
        d_loss = get(devol, "loss")
        d_kt = get(devol, "key_terms")

        # dependency remap
        p_mech = get(deps, "mechanism")
        p_func = get(deps, "integration") or get(deps, "function")
        p_int = get(deps, "outcome") or get(deps, "integration_outcome")
        p_kt = get(deps, "key_terms")

        block = f"""card_pair: {cp_full}
archetype_swords: {ARCH_SWORDS[prim]}
archetype_{target}: {arch_cups}
numerical_relation: {a} + {b2} = {trump(a+b2)}; {gloss_of(num_paren)})
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
"""
        for k, v in antag:
            if k.endswith("_position"):
                block += f"  {k}: {v}\n"
        block += f"""  key_terms: {get(antag,'key_terms')}

dynamic_inhibition:
  mechanism: {i_mech}
  blockade_nature: {i_block}
  swords_state: {i_state}
  consequence: {i_cons}
  key_terms: {i_kt}

dynamic_devolution:
  mechanism: {d_mech}
  mode: {d_mode}
  loss: {d_loss}
  key_terms: {d_kt}

dynamic_dependency:
  mechanism: {p_mech}
  function: {p_func}
  integration_outcome: {p_int}
  key_terms: {p_kt}

structural_metadata:
  series_count: 14
  format_version: 1.3
  ontology: jodorowskian numerological psychology with {ELEM[target]} graduation
  encoding: UTF-8
  elemental_primary: {elem}
  numerical_axis: {prim}-1 through {prim}-14
  uid: {uid}"""
        out_blocks.append(block)
    return "\n\n---\n\n".join(out_blocks)


if __name__ == "__main__":
    for path in sys.argv[1:]:
        result = normalize(path)
        open(path, "w", encoding="utf-8").write(result)
        print(f"normalized {path}")
