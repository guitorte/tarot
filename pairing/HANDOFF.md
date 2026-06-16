# Tarot Pairing — Session Handoff

This file lets a new session resume **from the repository alone**, with no prior chat
context. Read it, then read `pairing/FORMAT_SPEC.md` (authoritative) before writing anything.

## Project overview
A Jodorowskian numerological tarot study. For a given **primary** Swords card we describe how
it pairs with other cards across **five dynamic states** — genesis, antagonism, inhibition,
devolution, dependency (the source instructions in `pairing/context.md`: X engenders /
conflicts-with / stagnates-before / reduces-to / needs Y). Output is a machine-readable
`key: value` block format defined by `FORMAT_SPEC.md`.

## CURRENT STATE — Phase 3 IN PROGRESS 🔄 (128/138; Pentacles Ace–10 complete + Page/Knight 1/4 each)

Pentacles-primary files completed (in `pairing/pentacles/`):
- ✅ Ace–10 of Pentacles: ALL 40 files complete (560 blocks: Ace through 10, each ×4 suits)
- 🔄 Page of Pentacles: 1/4 (cups only, 14 blocks)
- 🔄 Knight of Pentacles: 1/4 (cups only, 14 blocks)

**Progress: 42 blocks done, 54 remaining for Page/Knight + all of Queen/King.**
**Total validated this session: 6 Pentacles files (128 blocks).**

Remaining (3 cards + 3/4 of 2 cards = 19 files, 266 blocks):
- Page: wands / swords / pentacles (3 files, 42 blocks)
- Knight: wands / swords / pentacles (3 files, 42 blocks)
- Queen: all 4 files (4 files, 56 blocks)
- King: all 4 files (4 files, 56 blocks)
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

### Phase 3 IN PROGRESS 🔄 — PENTACLES as a new primary suit
`python3 pairing/validate.py` now scans **every `pairing/*/*_to_*.txt`** (not just swords).
The validator is **primary-suit-aware**: it derives the primary suit from the parent
directory, so all suit-specific tokens (field names, uid infix, elemental_primary, card_pair)
follow. The Swords 70 stay green; 36 new Pentacles files bring the total to **106/106**.

Pentacles-primary files completed (in `pairing/pentacles/`):
- ✅ Ace of Pentacles (uids AOPC / AOPW / AOPS / AOPP) 
- ✅ 2–10 of Pentacles — all COMPLETE (56 blocks each): 2OPC/W/S/P through XOPC/W/S/P
- 🔄 Page of Pentacles (started: POPC cups only; need wands/swords/pentacles)

**Progress: 40 files complete (Ace–10), 1/56 for courts started.**
**Remaining (4 cards, 55 files): Page 3/4 + Knight 0/4 + Queen 0/4 + King 0/4.**

Same-suit (`*_to_pentacles`) note: the self-pairing block (e.g. 9+9) sits at its ordinal
position (block 9 for the 9-card) and uses `pentacles_position_1/_2`; all other blocks use
named position labels (e.g. `nine_of_pentacles_position`). Every block uses
`archetype_pentacles_1/_2`. Validator enforces Ace→King block order.

**⚠️ Digit-reduction reminder (§4.1):** from card 8 onward the court pairings push the
sum past 21 and must digit-reduce, written with the explicit reduction the validator
requires — e.g. `8 + 14 = 22 → 2+2=4 (IV The Emperor; …)`, `9 + 13 = 22 → 2+2=4`,
`9 + 14 = 23 → 2+3=5 (V The Pope; …)`. The 10-card and courts will reduce more often
(e.g. `10 + 14 = 24 → 2+4=6`). Check every court addition.

**The full Pentacles-primary spec is now §15 of `FORMAT_SPEC.md`** (read it before authoring
more): field renames (`archetype_pentacles`, `pentacles_state`, `<S>_position_*`),
`elemental_primary` = `earth (pentacles) to <element> (<target>)`, `uid` = `<Rank>OP<Target>`,
target-element `ontology`, and the canonical §15.3 `archetype_pentacles` table. The directional
rule holds: **the Pentacles card is always X**, the generating force (Ace of Pentacles → Y,
never Y → Ace of Pentacles).

## NEXT — continue Phase 3 (Pentacles primary, Page 3/4 → King 0/4)
1. `python3 pairing/validate.py pairing/pentacles/*.txt pairing/swords/*.txt` → confirm 124/124.
2. Complete Page of Pentacles (need 3 more files: wands, swords, pentacles same-suit).
3. Author Knight of Pentacles (all 4 files) — archetype: `Dedication, reliable service, steady work, methodical action, trustworthy effort`
4. Continue Queen and King of Pentacles (8 more files total).
   - Queen: `Nurturing mastery, practical wisdom, abundant care, earthly authority, generous management`
   - King: `Material authority, abundant leadership, earthly dominion, prosperous rule, powerful stewardship`
5. Workflow: author cups+wands → validate → commit+push; then swords+pentacles → validate → commit+push.
   Each file ~700 lines / 14 blocks. Same-suit files: self-pairing at ordinal position using `<suit>_position_1/_2`.
6. Optional later: Pentacles × Major Arcana, then Cups-primary / Wands-primary (need §15.3-style tables).
7. Legacy: Swords `3_to_major.txt` uses inverted perspective; rewrite when user confirms.

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

(Phase 3 flow now lives in the "NEXT — continue Phase 3" section above and in `FORMAT_SPEC.md` §15.)

## Legacy note: 3_to_major.txt perspective issue
File `3_to_major.txt` currently uses the **old (inverted) perspective** where the Major is treated as the
generating force rather than the Swords 3. It should be rewritten when user confirms (not yet requested).
Files Ace, 2, 4–9, 10, Page, Knight, Queen, King all use the **correct Swords-primary perspective**.
