# Tarot Pairing — Session Handoff

This file lets a new session resume **from the repository alone**, with no prior chat
context. Read it, then read `pairing/FORMAT_SPEC.md` (authoritative) before writing anything.

## Project overview
A Jodorowskian numerological tarot study. For a given **primary** Swords card we describe how
it pairs with other cards across **five dynamic states** — genesis, antagonism, inhibition,
devolution, dependency (the source instructions in `pairing/context.md`: X engenders /
conflicts-with / stagnates-before / reduces-to / needs Y). Output is a machine-readable
`key: value` block format defined by `FORMAT_SPEC.md`.

## CURRENT STATE — Phase 3 IN PROGRESS 🔄 (112/138 files conformant)

`python3 pairing/validate.py pairing/swords/*.txt pairing/pentacles/*.txt` → **`PASS: 112 file(s)`** (exit 0).
Total target for Phase 3 completion: 70 Swords + 56 Pentacles = 126 (then optional Pentacles-majors).

### Phase 1 COMPLETE ✅ (56 Swords minor files)
13 numbered+court primaries (2–King) × 4 target suits = 52, plus 4 Ace-of-Swords-primary files.
Each = 14 blocks (Ace→King of the target suit). All spec-conformant at v1.3.

### Phase 2 COMPLETE ✅ (14 Swords × Major files, 308 blocks)
All `pairing/swords/<card>_to_major.txt` (ace, 2…10, page, knight, queen, king) done, 22 blocks
each (The Fool 0 → The World 21). Swords total = **70 files**. (Note: `3_to_major.txt` still uses
the old inverted perspective — see legacy note at end; rewrite only when user confirms.)

### Phase 3 IN PROGRESS 🔄 — PENTACLES as a new primary suit (42 of 56 files)
The validator is **primary-suit-aware**: it derives the primary suit from the parent directory
(`pairing/<suit>/`), so all suit-specific tokens (field names, uid infix, elemental_primary,
card_pair) follow. The 70 Swords files stay green.

Pentacles-primary files completed (in `pairing/pentacles/`):
- ✅ **Ace–10 of Pentacles: ALL 40 files complete** (each card × 4 suits, 14 blocks/file).
  UIDs follow `<Rank>OP<Target>`: e.g. AOPC…AOPP, 2OPC…2OPP, … XOPC/XOPW/XOPS/XOPP (10 = `X`).
- 🔄 **Page of Pentacles: 1/4** — `page_to_cups.txt` only (uid `POPC`, 14 blocks).
  Rank char = `P`. Still need: `page_to_wands` (POPW), `page_to_swords` (POPS), `page_to_pentacles` (POPP).
- 🔄 **Knight of Pentacles: 1/4** — `knight_to_cups.txt` only (uid `NOPC`, 14 blocks).
  Rank char = `N` (Knight, NOT `K`). Still need: `knight_to_wands` (NOPW), `knight_to_swords` (NOPS), `knight_to_pentacles` (NOPP).
- ⬜ **Queen of Pentacles: 0/4** — rank char `Q` → QOPC/QOPW/QOPS/QOPP.
- ⬜ **King of Pentacles: 0/4** — rank char `K` → KOPC/KOPW/KOPS/KOPP.

**Remaining to finish Pentacles primary: 14 files (196 blocks)** — Page 3/4, Knight 3/4, Queen 4/4, King 4/4.

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

## NEXT — finish Phase 3 Pentacles courts (14 files: Page 3/4, Knight 3/4, Queen 4/4, King 4/4)
1. Baseline check: `python3 pairing/validate.py pairing/swords/*.txt pairing/pentacles/*.txt` → should print 112.
2. Read `FORMAT_SPEC.md` §15 (Pentacles spec) + §2/§8 (skeleton + quality bar) before authoring.
3. Finish **Page** (3 files): `page_to_wands` (POPW), `page_to_swords` (POPS), `page_to_pentacles` (POPP).
   - `archetype_pentacles`: `Curiosity, material learning, practical exploration, earthy apprentice, grounded potential`
4. Finish **Knight** (3 files): `knight_to_wands` (NOPW), `knight_to_swords` (NOPS), `knight_to_pentacles` (NOPP).
   - `archetype_pentacles`: `Dedication, reliable service, steady work, methodical action, trustworthy effort`
5. **Queen** (4 files, QOP*): `Nurturing mastery, practical wisdom, abundant care, earthly authority, generous management`
6. **King** (4 files, KOP*): `Material authority, abundant leadership, earthly dominion, prosperous rule, powerful stewardship`
7. Secondary (target) archetype lines: copy verbatim from any completed pairing file — e.g.
   `grep '^archetype_wands:' pairing/pentacles/10_to_wands.txt` gives all 14 Wands lines in order; same for
   `_swords` / `_cups`. Same-suit `_to_pentacles` uses `archetype_pentacles_1/_2` (grep `10_to_pentacles.txt`).
8. **Court numerical_relation digit-reduction (CHECK EVERY ADDITION):** courts push sums past 21.
   - Page = 11: `11 + 11 = 22 → 2+2=4 (IV)`, `11 + 12 = 23 → 2+3=5 (V)`, `11 + 13 = 24 → 2+4=6 (VI)`, `11 + 14 = 25 → 2+5=7 (VII)`.
   - Knight = 12: `12 + 10 = 22 → 4`, `12 + 12 = 24 → 6`, `12 + 13 = 25 → 7`, `12 + 14 = 26 → 2+6=8 (VIII)`.
   - Queen = 13: `13 + 9 = 22 → 4`, `13 + 11 = 24 → 6`, `13 + 13 = 26 → 8`, `13 + 14 = 27 → 2+7=9 (IX)`.
   - King = 14: `14 + 8 = 22 → 4`, `14 + 10 = 24 → 6`, `14 + 12 = 26 → 8`, `14 + 14 = 28 → 2+8=10 (X)`.
   Use Marseille trumps (§4.1): 8=Justice, 11=Strength. Validator enforces the reduction form.
9. Same-suit files: the self-pairing block sits at the card's **ordinal** position (block 11 for Page,
   12 Knight, 13 Queen, 14 King = the last block) and uses `pentacles_position_1/_2`; all other blocks
   use named labels (`page_of_pentacles_position`, etc.). Every block uses `archetype_pentacles_1/_2`.
10. Workflow that's worked: author one file → `python3 pairing/validate.py <file>` → fix uid/arith →
    commit per file or pair → push `git push -u origin claude/quirky-davinci-n9f3p0`. Each file ~700 lines.
11. After all 14: validator should read **126** across swords+pentacles. Then optionally Pentacles × Major
    Arcana (validator already generalized via parent-dir branch), then Cups-/Wands-primary lineages
    (each needs its own §15.3-style `archetype_<suit>` table added to the spec and `validate.py`'s `ARCH_PRIMARY`).
12. Legacy: Swords `3_to_major.txt` uses the inverted perspective; rewrite only when the user confirms.

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
