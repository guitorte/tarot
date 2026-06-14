# Tarot Pairing — Session Handoff

This file lets a new session resume **from the repository alone**, with no prior chat
context. Read it, then read `pairing/FORMAT_SPEC.md` (authoritative) before writing anything.

## Project overview
A Jodorowskian numerological tarot study. For a given **primary** Swords card we describe how
it pairs with other cards across **five dynamic states** — genesis, antagonism, inhibition,
devolution, dependency (the source instructions in `pairing/context.md`: X engenders /
conflicts-with / stagnates-before / reduces-to / needs Y). Output is a machine-readable
`key: value` block format defined by `FORMAT_SPEC.md`.

## CURRENT STATE — Phase 1 COMPLETE ✅ (56/56)
All minor-suit Swords pairings are spec-conformant at v1.3:
`python3 pairing/validate.py` → **`PASS: 56 file(s) conformant.`** (exit 0).

- 13 numbered+court primaries (2–King) × 4 target suits = 52 files.
- 4 Ace-of-Swords-primary files (`ace_to_{pentacles,cups,wands,swords}`).
- Each minor file = 14 blocks (Ace→King of the target suit).
- Same-suit files (`*_to_swords`) use `archetype_swords_1/_2` and, for a card meeting itself,
  `swords_position_1/_2`.

**Verify before trusting this doc:** `python3 pairing/validate.py` should print 56/56.

## NEXT — Phase 2: Swords × 22 Major Arcana (the current task)
Add, for each of the 14 Swords cards, its combinations with all 22 Major Arcana.
**Format and rules are fully specified in `FORMAT_SPEC.md` §14 — read it.** Headlines:
- New files `pairing/swords/<card>_to_major.txt`, **22 blocks** each (The Fool 0 → The World 21),
  14 files, 308 blocks total. Structured format, same five dynamics, same §8 quality bar.
- Decisions locked: **structured format in `pairing/swords/`**; **numerical_relation =
  sum & reduce** (`<swords#> + <arcanum# 0–21> = <sum> (Trump; gloss)`, digit-reduce > 21).
- `archetype_major` canonical table for all 22 arcana is in §14.5 (reuse verbatim).
- `uid: <Rank>OSM`; `series_count: 22`; `elemental_primary: air (swords) to major arcana`;
  `numerical_axis: <n>-0 through <n>-21`.
- **Do this FIRST:** extend `validate.py` with a `_to_major.txt` branch (§14.3) so the new
  files are checked and the existing 56 stay green. There is **no normalizer** for Phase 2 —
  author fresh from `pairing/TEMPLATE_major.txt`.
- Pace ~1 file (22 blocks) per chunk; validator after each; commit per file/small group.

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

## Recommended next flow
1. `python3 pairing/validate.py` → confirm 56/56.
2. Read `FORMAT_SPEC.md` §14 end-to-end.
3. Extend `validate.py` per §14.3; re-run, confirm 56/56 still green.
4. Author `<card>_to_major.txt` files from `TEMPLATE_major.txt`, one at a time, validator after
   each, committing in clear chunks. Push to the working branch; do not open a PR unless asked.
