"""Normalizer for the reduced-format drift tier (FORMAT_SPEC §9): the
8/9/10/Page/Knight/Queen files, all four target suits.

Genesis and antagonism are already canonical (4 / 5 fields) and pass through.
The three reduced sections carry rich multi-clause prose in 2 fields each;
we SPLIT that existing prose into the required sub-fields (no fabrication):

  inhibition  blockade -> mechanism / blockade_nature ;
              consequence -> swords_state / consequence ; key_terms (synth)
  devolution  corruption -> mechanism / mode ; loss kept ; key_terms (synth)
  dependency  integration -> mechanism / function ; outcome -> integration_outcome ;
              key_terms (synth)

Header: numerical_relation -> §4 Marseille form (recompute trump, keep gloss);
elemental_primary / numerical_axis / uid / format_version normalized.
Same-suit (`_to_swords`): dual archetype_swords -> _1/_2 (canonical §6);
self-pairing antagonism -> swords_position_1/_2 (§9).

Usage: python3 pairing/_normalize_reduced.py <card>_to_<suit>.txt ...
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
    "ace":"The New Truth, The Clarity Arrived, The Insight Witnessed, Thought Ignited",
    "2":"Stalemate, choice, decision avoidance, binding agreement, blocked clarity",
    "3":"Heartbreak, separation, sorrow, painful truth, unavoidable pain",
    "4":"Rest, truce, peace, mental stillness, respite",
    "5":"Conflict, defeat, hollow victory, defeat-at-cost, contested truth",
    "6":"The Traveler, The Departure, The Crossing, The Healer Through Distance",
    "7":"The Thief, The Cunning Escape, The Duplicity, The Strategic Theft",
    "8":"The Bound One, The Prisoner, The Enslaved Mind, Constraint Consciousness",
    "9":"The Tormented, The Nightmare Consciousness, The Despair Infinite, Mental Anguish",
    "10":"The Ruined, The Defeated Utterly, The Despair Complete, Final Devastation",
    "page":"The Messenger, The Youthful Truth, The New Thought, Idea Arriving",
    "knight":"The Pursuer, The Wind Rider, The Zealous Seeker, Truth In Motion",
    "queen":"The Discerning Mind, The Clear Authority, The Sovereign Intellect, Clarity Hard-Won",
    "king":"The King, The Enthroned Mind, The Visionary Authority, Thought That Commands",
}
TOKEN = {"Ace":"ace","Page":"page","Knight":"knight","Queen":"queen","King":"king"}


def card_tok(disp): return TOKEN.get(disp, disp)
def cardval(tok): return int(tok) if tok.isdigit() else VAL.get(tok)


def trump(total):
    final = total if total <= 21 else sum(int(d) for d in str(total))
    red = "" if total <= 21 else f" → {'+'.join(str(total))}={final}"
    return f"{total}{red} ({ROMAN[final]} {TRUMPS[final]}"


def halves(text):
    """Split rich prose into (lead, rest) on the first ; / — / – ; fall back to
    a comma; last resort duplicate (rare)."""
    if not text:
        return "", ""
    for sep in (";", "—", "–"):
        if sep in text:
            a, b = text.split(sep, 1)
            return a.strip().rstrip(".,;"), b.strip()
    if "," in text:
        a, b = text.split(",", 1)
        return a.strip(), b.strip()
    return text.strip(), text.strip()


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


_STOP = {"but","is","are","was","the","a","an","that","with","of","in","to",
         "and","by","where","which","who","into","not","its","their","this",
         "as","so","becomes","become","remains","extremely","increasingly",
         "now","still","while","than","more","less","both","cannot","must"}


def _tag(text):
    if not text:
        return None
    clause = re.split(r"[;,—–]", text)[0]
    w = re.sub(r'^(the|a|an) ', '', clause.strip().strip('"').rstrip(".:"), flags=re.I)
    words = w.split()[:5]
    while words and words[-1].lower() in _STOP:
        words.pop()
    return " ".join(words).lower() if len(words) >= 2 else None


def synth_keyterms(*texts):
    seen = []
    for t in texts:
        tag = _tag(t)
        if tag and tag not in seen:
            seen.append(tag)
    fallback = ["arrested motion", "blocked passage", "held tension", "suspended state"]
    while len(seen) < 3:
        seen.append(fallback[len(seen)])
    return ", ".join(seen[:4])


def normalize(path):
    fn = os.path.basename(path)
    m = re.match(r"^([a-z0-9]+)_to_([a-z]+)\.txt$", fn)
    prim, target = m.group(1), m.group(2)
    uid = RUID.get(prim, prim) + "OS" + TUID[target]
    elem = f"air (swords) to {ELEM[target]} ({target})"
    same = (target == "swords")
    a = cardval(prim)

    blocks = open(path, encoding="utf-8").read().split("\n---\n")
    out = []
    for b in blocks:
        if "card_pair:" not in b:
            continue
        cp_full = re.search(r"card_pair: (.+)", b).group(1).strip()
        target_disp = re.search(r", (.+?) of " + target.capitalize(), cp_full).group(1).strip()
        ttok = card_tok(target_disp)
        b2 = cardval(ttok)
        is_self = same and (ttok == prim)

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
        numline = re.search(r"numerical_relation: (.+)", b).group(1)
        nm = re.match(r"\s*\d+\s*\+\s*\d+\s*=\s*\d+\s*[;:]?\s*(.*)", numline)
        gloss = (nm.group(1).strip() if nm else numline).rstrip(")").strip()

        # header archetypes
        if same:
            arch1 = f"archetype_swords_1: {ARCH_SWORDS[prim]}"
            arch2 = f"archetype_swords_2: {ARCH_SWORDS[ttok]}"
        else:
            arch1 = f"archetype_swords: {ARCH_SWORDS[prim]}"
            other = re.search(rf"archetype_{target}: (.+)", b).group(1).strip()
            arch2 = f"archetype_{target}: {other}"

        # inhibition split
        i_mech, i_bnat = halves(get(inhib, "blockade") or get(inhib, "mechanism") or "")
        i_state, i_cons = halves(get(inhib, "consequence") or "")
        if not i_bnat:
            i_bnat = i_mech
        if not i_cons:
            i_state, i_cons = (i_mech, i_state) if i_state else (i_state, i_state)
        i_kt = synth_keyterms(i_mech, i_bnat, i_state, i_cons)

        # devolution split
        d_mech, d_mode = halves(get(devol, "corruption") or get(devol, "mechanism") or "")
        if not d_mode:
            d_mode = d_mech
        d_loss = get(devol, "loss") or ""
        d_kt = get(devol, "key_terms") or synth_keyterms(d_mode, d_loss, d_mech)

        # dependency split
        p_mech, p_func = halves(get(deps, "integration") or get(deps, "mechanism") or "")
        if not p_func:
            p_func = p_mech
        p_int = get(deps, "outcome") or get(deps, "integration_outcome") or ""
        p_kt = get(deps, "key_terms") or synth_keyterms(p_func, p_int, p_mech)

        block = f"""card_pair: {cp_full}
{arch1}
{arch2}
numerical_relation: {a} + {b2} = {trump(a+b2)}; {gloss})
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
        pos = [(k, v) for k, v in antag if "_position" in k]
        if is_self:
            block += f"  swords_position_1: {pos[0][1]}\n"
            block += f"  swords_position_2: {pos[1][1]}\n"
        else:
            for k, v in pos:
                key = k if k.endswith("_position") else re.sub(r"_position.*", "_position", k)
                block += f"  {key}: {v}\n"
        block += f"""  key_terms: {get(antag,'key_terms')}

dynamic_inhibition:
  mechanism: {i_mech}
  blockade_nature: {i_bnat}
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
        out.append(block)
    return "\n\n---\n\n".join(out) + "\n"


if __name__ == "__main__":
    for path in sys.argv[1:]:
        result = normalize(path)  # read fully BEFORE opening for write (truncates)
        open(path, "w", encoding="utf-8").write(result)
        print(f"normalized {path}")
