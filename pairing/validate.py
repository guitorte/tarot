#!/usr/bin/env python3
"""
Validate Jodorowskian tarot pairing files against FORMAT_SPEC.md (v1.3).

Usage:
    python3 pairing/validate.py                       # check all swords/*.txt
    python3 pairing/validate.py pairing/swords/king_to_swords.txt ...
    python3 pairing/validate.py --quiet               # errors only, no per-file OK lines

Exit code 0 if every checked file is fully conformant, 1 otherwise.

What it checks (see FORMAT_SPEC.md §§2,4,5,6,7,9,11):
  file:  exactly 14 blocks (Ace->King of target), shared uid / elemental_primary /
         primary archetype, uid matches filename.
  block: required header fields; numerical_relation arithmetic + Marseille trump +
         digit reduction for sums >21; five dynamics with field counts 4/5/5/4/5;
         antagonism has two *_position fields; structural_metadata values.
It does NOT judge prose quality (§8) — that stays human.
"""
import sys
import re
import glob
import os

# --- Marseille / Jodorowsky trump table (§4.1). 8 = Justice, 11 = Strength. ---
TRUMPS = {
    0: "The Fool", 1: "The Magician", 2: "The High Priestess", 3: "The Empress",
    4: "The Emperor", 5: "The Pope", 6: "The Lovers", 7: "The Chariot",
    8: "Justice", 9: "The Hermit", 10: "The Wheel of Fortune", 11: "Strength",
    12: "The Hanged Man", 13: "Death", 14: "Temperance", 15: "The Devil",
    16: "The Tower", 17: "The Star", 18: "The Moon", 19: "The Sun",
    20: "Judgement", 21: "The World",
}
ROMAN = {
    0: "0", 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI", 7: "VII",
    8: "VIII", 9: "IX", 10: "X", 11: "XI", 12: "XII", 13: "XIII", 14: "XIV",
    15: "XV", 16: "XVI", 17: "XVII", 18: "XVIII", 19: "XIX", 20: "XX", 21: "XXI",
}

# Card value (§4) and uid char (§7), keyed by the rank token used in card names.
RANK_VALUE = {"Ace": 1, "Page": 11, "Knight": 12, "Queen": 13, "King": 14}
RANK_UID = {"Ace": "A", "10": "X", "Page": "P", "Knight": "N", "Queen": "Q", "King": "K"}
TARGET_UID = {"pentacles": "P", "cups": "C", "wands": "W", "swords": "S"}
SUIT_ELEMENT = {"pentacles": "earth", "cups": "water", "wands": "fire", "swords": "air"}

# Major Arcana table (§14.5) — Marseille order 0-21.
MAJORS = [
    (0, "The Fool"), (1, "The Magician"), (2, "The High Priestess"),
    (3, "The Empress"), (4, "The Emperor"), (5, "The Pope"),
    (6, "The Lovers"), (7, "The Chariot"), (8, "Justice"),
    (9, "The Hermit"), (10, "The Wheel of Fortune"), (11, "Strength"),
    (12, "The Hanged Man"), (13, "Death"), (14, "Temperance"),
    (15, "The Devil"), (16, "The Tower"), (17, "The Star"),
    (18, "The Moon"), (19, "The Sun"), (20, "Judgement"), (21, "The World"),
]
ARCH_MAJOR = {
    "The Fool": "The Free Wanderer, The Unbound Step, The Sacred Madness, Movement Without Map",
    "The Magician": "The Willed Act, The Beginning Adept, The Focused Intention, Potential Taking Tools",
    "The High Priestess": "The Silent Knowing, The Gestating Mystery, The Inner Reservoir, Wisdom Unspoken",
    "The Empress": "The Generative Force, The Irrepressible Growth, The Abundant Creation, Life Without Permission",
    "The Emperor": "The Established Order, The Stable Authority, The Structured Dominion, Power Made Solid",
    "The Pope": "The Bridge-Builder, The Transmitted Meaning, The Sacred Mediator, Spirit Made Teaching",
    "The Lovers": "The Decisive Bond, The Chosen Union, The Crossroads of the Heart, Love That Must Choose",
    "The Chariot": "The Directed Triumph, The Mastered Motion, The Conquering Will, Victory In Movement",
    "Justice": "The Exact Measure, The Balanced Verdict, The Impartial Blade, Equilibrium Enforced",
    "The Hermit": "The Solitary Lantern, The Backward Walk, The Patient Reckoning, Wisdom Through Withdrawal",
    "The Wheel of Fortune": "The Turning Cycle, The Impermanent Turn, The Fated Revolution, Change Beyond Control",
    "Strength": "The Gentle Mastery, The Tamed Power, The Quiet Conquest, Force Through Softness",
    "The Hanged Man": "The Suspended View, The Willing Reversal, The Fertile Surrender, Insight Through Inversion",
    "Death": "The Necessary End, The Clearing Cut, The Transforming Threshold, Renewal Through Loss",
    "Temperance": "The Patient Blend, The Flowing Synthesis, The Healing Measure, Harmony Through Mixing",
    "The Devil": "The Binding Shadow, The Material Chain, The Seductive Trap, Bondage Through Desire",
    "The Tower": "The Sudden Collapse, The Shattered Structure, The Liberating Catastrophe, Truth That Breaks",
    "The Star": "The Renewed Hope, The Quiet Replenishment, The Guiding Light, Faith After Ruin",
    "The Moon": "The Deceptive Night, The Unconscious Depth, The Uncertain Path, Illusion and Instinct",
    "The Sun": "The Clear Joy, The Radiant Vitality, The Shared Light, Truth Made Warm",
    "Judgement": "The Awakening Call, The Resurrected Self, The Reckoning Summons, Rebirth Through Reckoning",
    "The World": "The Completed Whole, The Integrated Dance, The Achieved Totality, Fulfillment Realized",
}
ARCANUM_SLUG = {name: name.lower().replace(" ", "_") for _, name in MAJORS}

# Target card order within every file (§11): Ace -> King.
SEQUENCE = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10",
            "Page", "Knight", "Queen", "King"]

# Canonical primary archetype_swords line per card (§6). Keyed by filename token.
ARCH_SWORDS = {
    "ace": "The New Truth, The Clarity Arrived, The Insight Witnessed, Thought Ignited",
    "2": "Stalemate, choice, decision avoidance, binding agreement, blocked clarity",
    "3": "Heartbreak, separation, sorrow, painful truth, unavoidable pain",
    "4": "Rest, truce, peace, mental stillness, respite",
    "5": "Conflict, defeat, hollow victory, defeat-at-cost, contested truth",
    "6": "The Traveler, The Departure, The Crossing, The Healer Through Distance",
    "7": "The Thief, The Cunning Escape, The Duplicity, The Strategic Theft",
    "8": "The Bound One, The Prisoner, The Enslaved Mind, Constraint Consciousness",
    "9": "The Tormented, The Nightmare Consciousness, The Despair Infinite, Mental Anguish",
    "10": "The Ruined, The Defeated Utterly, The Despair Complete, Final Devastation",
    "page": "The Messenger, The Youthful Truth, The New Thought, Idea Arriving",
    "knight": "The Pursuer, The Wind Rider, The Zealous Seeker, Truth In Motion",
    "queen": "The Discerning Mind, The Clear Authority, The Sovereign Intellect, Clarity Hard-Won",
    "king": "The King, The Enthroned Mind, The Visionary Authority, Thought That Commands",
}

# Required fields per dynamic section (§2). Position fields handled separately.
DYNAMIC_FIELDS = {
    "dynamic_genesis": ["mechanism", "process", "outcome", "key_terms"],
    "dynamic_antagonism": ["mechanism", "tension_axis", "key_terms"],  # + 2 *_position
    "dynamic_inhibition": ["mechanism", "blockade_nature", "swords_state",
                           "consequence", "key_terms"],
    "dynamic_devolution": ["mechanism", "mode", "loss", "key_terms"],
    "dynamic_dependency": ["mechanism", "function", "integration_outcome", "key_terms"],
}
DYNAMIC_COUNT = {"dynamic_genesis": 4, "dynamic_antagonism": 5,
                 "dynamic_inhibition": 5, "dynamic_devolution": 4,
                 "dynamic_dependency": 4}


def rank_value(token):
    """Card value for a rank token ('King', '10', 'Ace')."""
    if token in RANK_VALUE:
        return RANK_VALUE[token]
    if token.isdigit():
        return int(token)
    return None


def rank_uid(token):
    if token in RANK_UID:
        return RANK_UID[token]
    if token.isdigit():
        return token  # 2-9
    return "?"


def digit_sum(n):
    return sum(int(d) for d in str(n))


def parse_blocks(text):
    """Split into blocks on lines containing only '---'."""
    blocks, cur = [], []
    for line in text.splitlines():
        if line.strip() == "---":
            if cur:
                blocks.append(cur)
                cur = []
        else:
            cur.append(line)
    if cur and any(l.strip() for l in cur):
        blocks.append(cur)
    return blocks


def parse_block(lines):
    """
    Return (top, sections) where top is {key: value} of unindented fields and
    sections is {section_name: ordered list of (field, value)}.
    """
    top, sections, current = {}, {}, None
    for line in lines:
        if not line.strip():
            continue
        indented = line[0] in " \t"
        m = re.match(r"^\s*([A-Za-z0-9_]+):\s?(.*)$", line)
        if not m:
            continue
        key, val = m.group(1), m.group(2).rstrip()
        if not indented:
            if val == "" and (key.startswith("dynamic_") or key == "structural_metadata"):
                current = key
                sections[current] = []
            else:
                top[key] = val
                current = None
        elif current is not None:
            sections[current].append((key, val))
    return top, sections


def validate_numerical(value, v1, v2):
    """Return list of error strings for a numerical_relation value."""
    errs = []
    m = re.match(
        r"^(\d+)\s*\+\s*(\d+)\s*=\s*(\d+)"
        r"(?:\s*(?:→|->)\s*(\d+)\s*\+\s*(\d+)\s*=\s*(\d+))?"
        r"\s*\(([0-9IVXLC]+)\s+([^;)]+?)\s*;",
        value,
    )
    if not m:
        errs.append("numerical_relation not in §4 form "
                    "`a + b = sum (Trump Name; gloss)`")
        return errs
    a, b, total = int(m.group(1)), int(m.group(2)), int(m.group(3))
    roman, name = m.group(7), m.group(8).strip()
    if v1 is not None and a != v1:
        errs.append(f"first addend {a} != card-1 value {v1}")
    if v2 is not None and b != v2:
        errs.append(f"second addend {b} != card-2 value {v2}")
    if a + b != total:
        errs.append(f"arithmetic: {a} + {b} = {a + b}, not {total}")
    final = total
    if m.group(4):  # reduction present
        d1, d2, reduced = int(m.group(4)), int(m.group(5)), int(m.group(6))
        if d1 + d2 != reduced:
            errs.append(f"reduction: {d1}+{d2} = {d1 + d2}, not {reduced}")
        if reduced != digit_sum(total):
            errs.append(f"reduction of {total} should be {digit_sum(total)}, not {reduced}")
        final = reduced
        if total <= 21:
            errs.append(f"sum {total} <= 21 should not be digit-reduced")
    elif total > 21:
        errs.append(f"sum {total} > 21 must be digit-reduced (e.g. -> {digit_sum(total)})")
    # Trump correctness
    if final in ROMAN:
        if roman != ROMAN[final]:
            errs.append(f"trump numeral {roman} should be {ROMAN[final]} for value {final}")
        elif _norm(name) != _norm(TRUMPS[final]):
            errs.append(f"trump name '{name}' should be '{TRUMPS[final]}' (numeral OK) [warn]")
    else:
        errs.append(f"resolved value {final} out of trump range 0-21")
    return errs


def _norm(s):
    return re.sub(r"[^a-z]", "", s.lower().replace("the", ""))


def _validate_major_file(path, primary_tok):
    """Validate a <card>_to_major.txt file (22 blocks, Major Arcana branch §14)."""
    errors = []
    primary_disp = {"ace": "Ace", "page": "Page", "knight": "Knight",
                    "queen": "Queen", "king": "King"}.get(primary_tok, primary_tok)
    primary_val = rank_value(primary_disp)
    uid_char = rank_uid(primary_disp)
    expected_uid = uid_char + "OSM"
    expected_elem = "air (swords) to major arcana"
    n_str = str(primary_val) if primary_val is not None else primary_tok
    expected_axis = f"{n_str}-0 through {n_str}-21"

    with open(path, encoding="utf-8") as f:
        text = f.read()
    blocks = parse_blocks(text)

    if len(blocks) != 22:
        errors.append((None, f"expected 22 blocks, found {len(blocks)}"))

    uids, elems, prim_arch = set(), set(), set()

    for i, raw in enumerate(blocks):
        top, sec = parse_block(raw)
        tag = f"block {i + 1}"
        expect_arcanum_num, expect_arcanum_name = MAJORS[i] if i < len(MAJORS) else (None, "?")

        # header fields
        for k in ["card_pair", "archetype_swords", "archetype_major",
                   "numerical_relation", "elemental_bridge", "threshold_type"]:
            if k not in top:
                errors.append((i, f"{tag}: missing header field '{k}'"))

        prim_arch.add(top.get("archetype_swords", ""))
        canon = ARCH_SWORDS.get(primary_tok)
        if canon and top.get("archetype_swords", "") not in ("", canon):
            errors.append((i, f"{tag}: archetype_swords not canonical (§6); "
                              f"expected '{canon}'"))

        arch_maj = top.get("archetype_major", "")
        canon_maj = ARCH_MAJOR.get(expect_arcanum_name, "")
        if canon_maj and arch_maj not in ("", canon_maj):
            errors.append((i, f"{tag}: archetype_major not canonical (§14.5); "
                              f"expected '{canon_maj}'"))

        # card_pair: "<rank> of Swords, <Arcanum name>"
        v1 = v2 = None
        cp = top.get("card_pair", "")
        cpm = re.match(r"^(.+?)\s+of\s+Swords,\s*(.+?)\s*$", cp)
        if cpm:
            r1, arcanum_name = cpm.group(1).strip(), cpm.group(2).strip()
            v1 = rank_value(r1)
            v2 = expect_arcanum_num
            if r1 != primary_disp and not (primary_tok.isdigit() and r1 == primary_tok):
                errors.append((i, f"{tag}: card_pair primary '{r1}' != file card '{primary_disp}'"))
            if arcanum_name != expect_arcanum_name:
                errors.append((i, f"{tag}: card_pair arcanum '{arcanum_name}' != expected '{expect_arcanum_name}'"))
        elif "card_pair" in top:
            errors.append((i, f"{tag}: card_pair '{cp}' unparseable (expected '<rank> of Swords, <Arcanum>')"))

        # numerical_relation
        if "numerical_relation" in top:
            for e in validate_numerical(top["numerical_relation"], v1, v2):
                errors.append((i, f"{tag}: {e}"))

        # dynamics
        for dyn, required in DYNAMIC_FIELDS.items():
            if dyn not in sec:
                errors.append((i, f"{tag}: missing section '{dyn}'"))
                continue
            fields = [k for k, _ in sec[dyn]]
            for rk in required:
                if rk not in fields:
                    errors.append((i, f"{tag}/{dyn}: missing field '{rk}'"))
            if dyn == "dynamic_antagonism":
                pos = [k for k in fields if k.endswith("_position")]
                if len(pos) != 2:
                    errors.append((i, f"{tag}/{dyn}: expected 2 *_position fields, found {len(pos)}"))
            if len(fields) != DYNAMIC_COUNT[dyn]:
                errors.append((i, f"{tag}/{dyn}: {len(fields)} fields, expected {DYNAMIC_COUNT[dyn]}"))

        # structural_metadata
        if "structural_metadata" not in sec:
            errors.append((i, f"{tag}: missing structural_metadata"))
        else:
            meta = dict(sec["structural_metadata"])
            for k, want in {"series_count": "22", "format_version": "1.3",
                            "encoding": "UTF-8", "elemental_primary": expected_elem,
                            "numerical_axis": expected_axis, "uid": expected_uid}.items():
                got = meta.get(k)
                if got is None:
                    errors.append((i, f"{tag}/metadata: missing '{k}'"))
                elif got != want:
                    errors.append((i, f"{tag}/metadata: {k} = '{got}', expected '{want}'"))
            if meta.get("uid"):
                uids.add(meta["uid"])
            if meta.get("elemental_primary"):
                elems.add(meta["elemental_primary"])

    if len(uids) > 1:
        errors.append((None, f"inconsistent uids across blocks: {sorted(uids)}"))
    if len(elems) > 1:
        errors.append((None, f"inconsistent elemental_primary: {sorted(elems)}"))
    if len([a for a in prim_arch if a]) and len(set(a for a in prim_arch if a)) > 1:
        errors.append((None, "primary archetype line not identical across all blocks"))

    return errors


def validate_file(path, quiet=False):
    errors = []  # (block_index_or_None, message)
    fname = os.path.basename(path)
    m = re.match(r"^([a-z0-9]+)_to_([a-z_]+)\.txt$", fname)
    if not m:
        return [f"filename '{fname}' not in form <card>_to_<suit>.txt"]
    primary_tok, target = m.group(1), m.group(2)
    if target == "major":
        return _validate_major_file(path, primary_tok)
    if target not in TARGET_UID:
        return [f"unknown target suit '{target}'"]

    primary_disp = {"ace": "Ace", "page": "Page", "knight": "Knight",
                    "queen": "Queen", "king": "King"}.get(primary_tok, primary_tok)
    expected_uid = rank_uid(primary_disp) + "OS" + TARGET_UID[target]
    expected_elem = f"air (swords) to {SUIT_ELEMENT[target]} ({target})"
    same_suit = (target == "swords")

    with open(path, encoding="utf-8") as f:
        text = f.read()
    blocks = parse_blocks(text)

    if len(blocks) != 14:
        errors.append((None, f"expected 14 blocks, found {len(blocks)}"))

    uids, elems, prim_arch = set(), set(), set()

    for i, raw in enumerate(blocks):
        top, sec = parse_block(raw)
        tag = f"block {i + 1}"
        expect_target = SEQUENCE[i] if i < len(SEQUENCE) else "?"

        # --- header fields ---
        if same_suit:
            arch_keys = ["archetype_swords_1", "archetype_swords_2"]
        else:
            arch_keys = ["archetype_swords", f"archetype_{target}"]
        header_required = ["card_pair", arch_keys[0], arch_keys[1],
                           "numerical_relation", "elemental_bridge", "threshold_type"]
        for k in header_required:
            if k not in top:
                errors.append((i, f"{tag}: missing header field '{k}'"))

        prim_arch.add(top.get(arch_keys[0], ""))
        canon = ARCH_SWORDS.get(primary_tok)
        if canon and top.get(arch_keys[0], "") not in ("", canon):
            errors.append((i, f"{tag}: {arch_keys[0]} not canonical (§6); "
                              f"expected '{canon}'"))

        # --- card_pair / value extraction ---
        v1 = v2 = None
        cp = top.get("card_pair", "")
        cpm = re.match(r"^(.+?)\s+of\s+Swords,\s*(.+?)\s+of\s+([A-Za-z]+)\s*$", cp)
        if cpm:
            r1, r2, suit2 = cpm.group(1), cpm.group(2), cpm.group(3).lower()
            v1, v2 = rank_value(r1), rank_value(r2)
            if r1 != primary_disp and not (primary_tok.isdigit() and r1 == primary_tok):
                errors.append((i, f"{tag}: card_pair primary '{r1}' != file card '{primary_disp}'"))
            if r2 != expect_target:
                errors.append((i, f"{tag}: card_pair target '{r2}' != expected '{expect_target}'"))
            if suit2 != target:
                errors.append((i, f"{tag}: card_pair target suit '{suit2}' != '{target}'"))
        elif "card_pair" in top:
            errors.append((i, f"{tag}: card_pair '{cp}' unparseable"))

        # --- numerical_relation ---
        if "numerical_relation" in top:
            for e in validate_numerical(top["numerical_relation"], v1, v2):
                errors.append((i, f"{tag}: {e}"))

        # --- dynamics ---
        for dyn, required in DYNAMIC_FIELDS.items():
            if dyn not in sec:
                errors.append((i, f"{tag}: missing section '{dyn}'"))
                continue
            fields = [k for k, _ in sec[dyn]]
            for rk in required:
                if rk not in fields:
                    errors.append((i, f"{tag}/{dyn}: missing field '{rk}'"))
            if dyn == "dynamic_antagonism":
                is_self = bool(same_suit and cpm and r1 == r2)
                pos = [k for k in fields if k.endswith("_position")]
                if is_self:
                    # a card meeting itself uses swords_position_1/_2 (§9)
                    if not {"swords_position_1", "swords_position_2"} <= set(fields):
                        errors.append((i, f"{tag}/{dyn}: self-pairing must use "
                                          f"swords_position_1/_2 (§9)"))
                else:
                    # differing cards use named labels <card>_of_<suit>_position (§9)
                    if len(pos) != 2:
                        errors.append((i, f"{tag}/{dyn}: expected 2 named *_position "
                                          f"fields, found {len(pos)} "
                                          f"(positional _1/_2 only for self-pairings)"))
            if len(fields) != DYNAMIC_COUNT[dyn]:
                errors.append((i, f"{tag}/{dyn}: {len(fields)} fields, expected "
                                  f"{DYNAMIC_COUNT[dyn]} (reduced/extra format?)"))

        # --- structural_metadata ---
        if "structural_metadata" not in sec:
            errors.append((i, f"{tag}: missing structural_metadata"))
        else:
            meta = dict(sec["structural_metadata"])
            checks = {
                "series_count": "14",
                "format_version": "1.3",
                "encoding": "UTF-8",
                "elemental_primary": expected_elem,
                "uid": expected_uid,
            }
            for k, want in checks.items():
                got = meta.get(k)
                if got is None:
                    errors.append((i, f"{tag}/metadata: missing '{k}'"))
                elif got != want:
                    errors.append((i, f"{tag}/metadata: {k} = '{got}', expected '{want}'"))
            if meta.get("uid"):
                uids.add(meta["uid"])
            if meta.get("elemental_primary"):
                elems.add(meta["elemental_primary"])

    # --- file-level consistency ---
    if len(uids) > 1:
        errors.append((None, f"inconsistent uids across blocks: {sorted(uids)}"))
    if len(elems) > 1:
        errors.append((None, f"inconsistent elemental_primary: {sorted(elems)}"))
    if len([a for a in prim_arch if a]) and len(set(a for a in prim_arch if a)) > 1:
        errors.append((None, "primary archetype line not identical across all blocks"))

    return errors


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    quiet = "--quiet" in sys.argv
    if args:
        paths = args
    else:
        here = os.path.dirname(os.path.abspath(__file__))
        paths = sorted(glob.glob(os.path.join(here, "swords", "*.txt")))

    total_err = 0
    for path in paths:
        errs = validate_file(path)
        rel = os.path.relpath(path)
        if errs:
            total_err += len(errs)
            print(f"\n✗ {rel}  ({len(errs)} issue{'s' if len(errs) != 1 else ''})")
            for _, msg in errs:
                print(f"    {msg}")
        elif not quiet:
            print(f"✓ {rel}")

    print(f"\n{'─' * 50}")
    if total_err:
        print(f"FAIL: {total_err} issue(s) across {len(paths)} file(s).")
        sys.exit(1)
    print(f"PASS: {len(paths)} file(s) conformant.")
    sys.exit(0)


if __name__ == "__main__":
    main()
