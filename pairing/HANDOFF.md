# Tarot Pairing — Session Handoff

This file lets a new session resume **from the repository alone**, with no prior chat
context. Read it, then read `pairing/FORMAT_SPEC.md` (authoritative) before writing anything.

## Project overview
A Jodorowskian numerological tarot study. For a given **primary** Swords card we describe how
it pairs with other cards across **five dynamic states** — genesis, antagonism, inhibition,
devolution, dependency (the source instructions in `pairing/context.md`: X engenders /
conflicts-with / stagnates-before / reduces-to / needs Y). Output is a machine-readable
`key: value` block format defined by `FORMAT_SPEC.md`.

## CURRENT STATE — Phase 2 COMPLETE ✅ (70/70, 14/14 major files done)

### Phase 1 COMPLETE ✅ (56/56)
All minor-suit Swords pairings are spec-conformant at v1.3.

- 13 numbered+court primaries (2–King) × 4 target suits = 52 files.
- 4 Ace-of-Swords-primary files (`ace_to_{pentacles,cups,wands,swords}`).
- Each minor file = 14 blocks (Ace→King of the target suit).
- Same-suit files (`*_to_swords`) use `archetype_swords_1/_2` and, for a card meeting itself,
  `swords_position_1/_2`.

### Phase 2 COMPLETE ✅ (14/14 major files)
`python3 pairing/validate.py` → **`PASS: 70 file(s) conformant.`** (exit 0).

All Swords × Major Arcana files completed (in `pairing/swords/`):
- ✅ `ace_to_major.txt` — Ace of Swords × 22 Majors
- ✅ `2_to_major.txt` — 2 of Swords × 22 Majors
- ⚠️ `3_to_major.txt` — 3 of Swords × 22 Majors (**uses old perspective — see note below**)
- ✅ `4_to_major.txt` — 4 of Swords × 22 Majors
- ✅ `5_to_major.txt` — 5 of Swords × 22 Majors
- ✅ `6_to_major.txt` — 6 of Swords × 22 Majors (The Traveler archetype)
- ✅ `7_to_major.txt` — 7 of Swords × 22 Majors (The Thief archetype)
- ✅ `8_to_major.txt` — 8 of Swords × 22 Majors (The Bound One archetype)
- ✅ `9_to_major.txt` — 9 of Swords × 22 Majors (The Tormented archetype)
- ✅ `10_to_major.txt` — 10 of Swords × 22 Majors (The Ruined, The Defeated Utterly, Final Devastation)
- ✅ `page_to_major.txt` — Page of Swords × 22 Majors (The Messenger, The Youthful Truth, New Thought)
- ✅ `queen_to_major.txt` — Queen of Swords × 22 Majors (The Discerning Mind, Sovereignty Clarity)
- ✅ `knight_to_major.txt` — Knight of Swords × 22 Majors (The Pursuer, The Wind Rider, Truth In Motion)
- ✅ `king_to_major.txt` — King of Swords × 22 Majors (The Enthroned Mind, Thought That Commands)

**All 14 Swords cards now complete with full 22-block Major Arcana pairings (308 blocks total).**
**Verify:** `python3 pairing/validate.py` prints 70/70 (56 Phase 1 + 14 Phase 2 Swords-to-Major).

## NEXT — Phase 3: Other Suits × Major Arcana (design phase)
Remaining Swords Court card file (`3_to_major.txt`) uses inverted perspective and should be rewritten
per user confirmation (not yet requested). **Phase 3 will likely extend Major Arcana pairings to Cups, 
Coins/Pentacles, and Wands/Rods.** Structure and numerics will mirror Swords but with suit-specific 
primary archetypal lines. Await user direction for next suit and priority cards.

### ⚠️ CRITICAL — Directional Perspective Rule (locked after 2_to_major.txt rewrite)
**The Swords card is ALWAYS the primary/generating force.** Order matters:
- "2 of Swords + The Fool" ≠ "The Fool + 2 of Swords"
- The Swords card **engenders / conflicts with / stagnates before / reduces into / needs** the Major.
- The Major is the *target* — never the initiating agent in the dynamics.
- All five dynamics must be framed from the Swords card's perspective outward.
- Files Ace, 2, 4, 5 use this correct perspective. File 3 uses the **old (inverted) perspective**
  and should be rewritten when the user confirms (not yet requested as of last session).

Reference: Jodorowsky's "Dynamic of the Ten Degrees" — lower degrees generate toward higher.

### Prior art to be aware of (different lineage — do not confuse)
`combinations/magician.md` and `combinations/examples.md` already hold **Major × Major**
combinations, but in **Portuguese prose** (Jodorowsky paragraphs, per-block UIDs like `MZK1`).
Phase 2 is the **structured English** lineage of `pairing/swords/`, NOT that prose style. They
can be a content/tone reference only.

## Canonical spec (locked) — `FORMAT_SPEC.md`
- §2 block skeleton (header + 5 dynamics + metadata); field counts 4/5/5/4/4.
- §4 `numerical_relation` (minor pairs) + §4.1 Marseille trump table (8=Justice, 11=Strength —
  NOT Waite; digit-reduce sums > 21).
- §5 `elemental_primary` long form; §6 fixed `archetype_swords` per primary card.
- §7 uid scheme; §8 prose quality bar; §9 known-drift catalog; §11 self-check; §13 validator.
- **§14 Major Arcana combinations (Phase 2)** + §14.5 the 22 `archetype_major` lines.

## Tooling (`pairing/`)
- `validate.py` — mechanical conformance gate (NOT prose quality). `python3 pairing/validate.py
  [files…]`; exit 0 = pass. **Needs the §14.3 major branch before Phase 2.**
- `TEMPLATE.txt` — minor-pair scaffold. `TEMPLATE_major.txt` — Phase-2 scaffold.
- Normalizers (Phase-1 legacy-drift tools; **not used in Phase 2**):
  - `_normalize_reduced.py` — reduced tier (8/9/10/page/knight/queen): splits 2-field
    sections into canonical sub-fields, recomputes numerical/metadata, same-suit handling.
  - `_normalize_samesuit.py` — `*_to_swords` verbose era (5/6/7).
  - `_normalize_ace.py` — Ace-primary files (pass dynamics through; fix header/num/positions).
  - `_normalize_tier67.py`, `_normalize_numeric.py`, `_relabel_samesuit.py` — earlier tiers.

## Lessons learned (hard-won — heed these)
1. **Validator is the source of truth for structure; run it after every file.** It maps the
   work: issue counts cluster by drift tier. It does NOT judge prose (§8) — that stays human.
2. **Parse-and-emit per block; never chained regex over a whole file.** Split on `\n---\n`,
   process atomically, rejoin with `\n\n---\n\n`. The canonical separator is a blank line,
   `---`, blank line. When inserting/authoring blocks, normalize separators or you get
   inconsistent spacing (caught and fixed once).
3. **`open(path,"w").write(f(path))` truncates the file before `f` reads it.** Compute the new
   content into a variable FIRST, then open-for-write. (This bug silently emptied a file.)
4. **Reduced sections were rich enough to SPLIT, not fabricate.** The 2-field
   `blockade`/`consequence`, `corruption`, `integration` carried multi-clause prose; splitting
   on the first `;`/`—` into the required sub-fields preserved real content. Prefer
   redistribution over invention.
5. **`key_terms` hand-authored beats regex extraction.** Concise noun phrases, 3–5, grounded
   in the block's own mechanism and the primary card's archetype — not sentence fragments.
   `5_to_cups` is the gold-standard exemplar. Inhibition `key_terms` were hand-authored across
   the whole suite; match that bar in Phase 2 from the start.
6. **`archetype_*` lines are fixed and reused verbatim** (§6 for swords, §14.5 for majors).
   Identical across every block/file that references that card. Do not reinvent.
7. **Marseille, not Waite:** 8 = Justice, 11 = Strength, 12 = The Hanged Man, 13 = Death,
   14 = Temperance, 15 = The Devil. **Check every addition**; the most common past error was a
   wrong addend or a Waite trump. Several legacy files said "8 = Strength" / "The Hanged One".
8. **Apply key_terms with a line-based in-place pass** (track `card_pair` → section → replace
   only the target `key_terms` line). Verify the diff touches ONLY intended lines:
   `git diff -U0 … | grep '^[+-]' | grep -v '^[+-][+-]' | grep -vc 'key_terms:'` should be 0.
9. **Author missing blocks in final form** and insert at the correct ordinal position
   (validator enforces Ace→King / 0→21 order). Several files were short and needed fresh blocks.
10. **One-shot `_author_*_keyterms.py` scripts** (keyed data + line-based patch) were created,
    run, then deleted. The reusable normalizers were kept. Follow that convention.

## Recommended next flow (Phase 3)
When user initiates Phase 3 (other suits), the pattern mirrors Phase 2:
1. User specifies which suit (Cups, Coins/Pentacles, Wands/Rods) and which primary cards to author first.
2. Extend `FORMAT_SPEC.md` §14 with new suit-specific `archetype_cups/_pentacles/_wands` canonical lines (parallel to §14.5).
3. Copy and adapt `TEMPLATE_major.txt` for the new suit (`TEMPLATE_major_cups.txt`, etc.).
4. Author `<card>_to_major.txt` files under `pairing/cups/`, `pairing/pentacles/`, `pairing/wands/` respectively.
   - Numerical relation stays: `<suit_card#> + <arcanum# 0–21> = <sum> (Trump)` with Marseille trump table.
   - Same five dynamics, same prose quality bar (§8).
   - UIDs: `<Rank>OCM`, `<Rank>PCM`, `<Rank>WCM` (C = "of", M = "Major").
5. Validator extensions will likely be needed for new suit directories (consult developer notes if validator fails).
6. Push work to designated branch; await user direction for next priority.

## Legacy note: 3_to_major.txt perspective issue
File `3_to_major.txt` currently uses the **old (inverted) perspective** where the Major is treated as the
generating force rather than the Swords 3. It should be rewritten when user confirms (not yet requested).
Files Ace, 2, 4–9, 10, Page, Knight, Queen, King all use the **correct Swords-primary perspective**.
