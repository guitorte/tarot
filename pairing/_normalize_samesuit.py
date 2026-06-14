"""Normalizer for same-suit files (`<card>_to_swords.txt`), verbose/reduced era.

Adapts _normalize_tier67.py for the Air-meets-Air case (FORMAT_SPEC §2,§6,§9):
  header      two `archetype_swords` lines -> archetype_swords_1 (§6 primary)
              / archetype_swords_2 (§6 target card, looked up canonically)
  numerical   recompute sum + Marseille trump from card values (§4); keep gloss
  antagonism  differing cards keep their two named *_position fields;
              a self-pairing's *_position_first/_second -> swords_position_1/_2 (§9)
  inhibition  mechanism / blockade_nature<-consequence / swords_state<-spatial_logic
              / consequence(synth) / key_terms(provided or synth)
  devolution  rename corruption->mode
  dependency  mechanism / function<-integration / integration_outcome<-outcome
              / key_terms  (drop paradox)
  metadata    format_version 1.3, elemental_primary, numerical_axis, uid normalized

Genesis passes through unchanged. Does NOT author a missing self-pairing block
(insert that separately in final form). Usage:
  python3 pairing/_normalize_samesuit.py <card>_to_swords.txt ...
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


def card_tok(disp):
    """Display rank ('Ace','10','King') -> ARCH/uid table token."""
    return TOKEN.get(disp, disp)


def cardval(tok):
    return int(tok) if tok.isdigit() else VAL.get(tok)


def trump(total):
    final = total if total <= 21 else sum(int(d) for d in str(total))
    red = "" if total <= 21 else f" → {'+'.join(str(total))}={final}"
    return f"{total}{red} ({ROMAN[final]} {TRUMPS[final]}"


def gloss_of(paren):
    p = paren.strip()
    if "?" in p:   p = p.rsplit("?", 1)[1]
    elif ";" in p: p = p.split(";", 1)[1]
    elif "," in p: p = p.split(",", 1)[1]
    return p.strip().rstrip(")").strip()


def parse_fields(section_text):
    out = []
    for line in section_text.splitlines():
        m = re.match(r"\s{2}([a-z0-9_]+): (.*)", line)
        if m:
            out.append([m.group(1), m.group(2)])
    return out


def get(fields, key):
    for k, v in fields:
        if k == key:
            return v
    return None


def synth_consequence(mech):
    for sep in [";", "—", "--"]:
        if sep in mech:
            return mech.rsplit(sep, 1)[1].strip()
    return "the meeting stalls; neither figure moves toward the other"


_STOP = {"but","is","are","was","the","a","an","that","with","of","in","to",
         "and","by","where","which","who","into","not","its","their","this",
         "as","so","becomes","remains","extremely","increasingly","now","still",
         "while","than","more","less","both","cannot","must"}


def _tag(text):
    if not text:
        return None
    clause = re.split(r"[;,—–]", text)[0]
    w = re.sub(r"^(the|a|an) ", "", clause.strip().rstrip(".:"), flags=re.I)
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
    fallback = ["frozen meeting", "suspended movement", "blocked passage", "held distance"]
    while len(seen) < 3:
        seen.append(fallback[len(seen)])
    return ", ".join(seen[:4])


def normalize(path, inh_keyterms=None):
    fn = os.path.basename(path)
    m = re.match(r"^([a-z0-9]+)_to_swords\.txt$", fn)
    prim = m.group(1)
    uid = RUID.get(prim, prim) + "OSS"
    elem = "air (swords) to air (swords)"
    a = cardval(prim)
    inh_keyterms = inh_keyterms or {}

    blocks = open(path, encoding="utf-8").read().split("\n---\n")
    out_blocks = []
    for b in blocks:
        if "card_pair:" not in b:
            continue
        cp_full = re.search(r"card_pair: (.+)", b).group(1).strip()
        target_disp = re.search(r", (.+?) of Swords", cp_full).group(1).strip()
        ttok = card_tok(target_disp)
        b2 = cardval(ttok)
        is_self = (ttok == prim)

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
        if nm:
            num_paren = nm.group(1)
        else:
            raw = re.search(r"numerical_relation: (.+)", b).group(1)
            num_paren = raw.split("=", 1)[1].strip() if "=" in raw else raw

        # position fields
        pos = [(k, v) for k, v in antag if "_position" in k]

        # inhibition remap
        i_mech = get(inhib, "mechanism") or "the pairing freezes"
        i_block = get(inhib, "consequence") or get(inhib, "blockade_nature") or i_mech
        i_state = get(inhib, "spatial_logic") or get(inhib, "swords_state") or "held in suspension"
        i_cons = synth_consequence(i_mech)
        i_kt = inh_keyterms.get(target_disp) or synth_keyterms(i_block, i_state, i_cons, i_mech)

        # devolution / dependency remap
        d_mech, d_mode = get(devol, "mechanism"), get(devol, "corruption") or get(devol, "mode")
        d_loss, d_kt = get(devol, "loss"), get(devol, "key_terms")
        p_mech = get(deps, "mechanism")
        p_func = get(deps, "integration") or get(deps, "function")
        p_int = get(deps, "outcome") or get(deps, "integration_outcome")
        p_kt = get(deps, "key_terms")

        block = f"""card_pair: {cp_full}
archetype_swords_1: {ARCH_SWORDS[prim]}
archetype_swords_2: {ARCH_SWORDS[ttok]}
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
  ontology: jodorowskian numerological psychology with air graduation
  encoding: UTF-8
  elemental_primary: {elem}
  numerical_axis: {prim}-1 through {prim}-14
  uid: {uid}"""
        out_blocks.append(block)
    return "\n\n---\n\n".join(out_blocks)


if __name__ == "__main__":
    for path in sys.argv[1:]:
        result = normalize(path)
        open(path, "w", encoding="utf-8").write(result + "\n")
        print(f"normalized {path}")
