# Tarot Pairing Normalization — Session Handoff

## Project Overview
A Jodorowskian numerological tarot pairing database: **56 files** total
(13 primary Swords cards × 4 target suits). Each file holds **14 blocks**
(primary + Ace through King of the target suit). Each block describes a
relational pairing across five dynamic states: genesis, antagonism,
inhibition, devolution, dependency.

**Working strategy:** "King now, normalize later" — complete all four King
files to final v1.3 quality first, then retrofit the 48 older files
tier-by-tier.

## Verified Status: 25 / 56 files conformant
Confirmed by `python3 pairing/validate.py <file>` exit code on
2026-06-13.

### PASS (25)
- All 4 King files: `king_to_{pentacles,cups,wands,swords}`
- All 12 tier-1 files: `{2,3,4}_to_{pentacles,cups,wands,swords}`
- `5_to_cups` — **GOLD-STANDARD exemplar** (hand-authored Ace block +
  target-specific inhibition key_terms)
- `5_to_wands`, `6_to_{pentacles,cups,wands}`, `7_to_{pentacles,cups,wands}`
  — structurally valid; **interim quality**: inhibition `key_terms` are
  auto-derived (block-specific but rough), flagged for a hand-authoring pass.

### FAIL — remaining work (31)
- Same-suit (3): `5_to_swords`, `6_to_swords`, `7_to_swords`
- Reduced-format tier (24): `{8,9,10,page,knight,queen}_to_{4 suits}`
- Ace files (4): `ace_to_{4 suits}` — out of scope per spec §12 unless asked.

## Canonical Spec (locked)
`pairing/FORMAT_SPEC.md` is authoritative. Key sections:
- §2  block skeleton (header + 5 dynamics + metadata)
- §4  `numerical_relation`: `a + b = sum → reduced (Trump; gloss)`,
      Marseille trumps (8=Justice, 11=Strength — NOT Waite), digit reduction
- §5  `elemental_primary` full form (`air (swords) to water (cups)`)
- §6  `archetype_swords` lines fixed per card — identical across all 4 suit
      files for a given primary
- §7  uid scheme `<Rank>OS<Target>` (Ace=A, 2-9=digit, 10=X, Page=P,
      Knight=N, Queen=Q, King=K + OS + target P/C/W/S)
- §8  prose quality bar (concrete mechanism, no "becomes/reveals" clichés,
      telegraphic)
- §9  Known Deviations catalog (per-drift-tier corrections)
- §11 self-check checklist
- §13 validator documentation

### Field counts per dynamic (v1.3)
| dynamic     | count | fields |
|-------------|-------|--------|
| genesis     | 4 | mechanism, process, outcome, key_terms |
| antagonism  | 5 | mechanism, tension_axis, [position labels], key_terms |
| inhibition  | 5 | mechanism, blockade_nature, swords_state, consequence, key_terms |
| devolution  | 4 | mechanism, mode, loss, key_terms |
| dependency  | 4 | mechanism, function, integration_outcome, key_terms |

## Tooling
- `pairing/validate.py` — mechanical conformance checker (NOT prose quality).
  `python3 pairing/validate.py pairing/swords/*.txt`; exit 0 = pass.
- `pairing/_normalize_numeric.py` — tier-1 numeric/metadata reformatter.
- `pairing/_relabel_samesuit.py` — same-suit position-label relabeler.
- `pairing/_normalize_tier67.py` — verbose-era (cards 5-7) field remapper.
- `pairing/TEMPLATE.txt` — copy-paste scaffold.

## Remaining Work — three tiers

### Tier A — quality pass (HIGH value, LOW effort, ~1-2h)
7 cross-suit files (`5_to_wands`, `6_to_{pentacles,cups,wands}`,
`7_to_{pentacles,cups,wands}`): replace auto-derived inhibition `key_terms`
with hand-authored target-specific tags. Reference `5_to_cups`.

### Tier B — same-suit (MEDIUM, ~3-4h)
`5_to_swords`, `6_to_swords`, `7_to_swords`: run `_relabel_samesuit.py`,
then author missing low-card blocks (5+Ace; 6+Ace..6+5; 7+Ace..7+6).

### Tier C — reduced-format (HEAVIEST, ~8-12h+)
24 files (`{8,9,10,page,knight,queen}_to_{4 suits}`). Reduced 2-field
inhibition/devolution/dependency; ~50% of fields per block need authoring.
Pace 1-2 files per session.

## Gotchas & lessons
1. **Parse-and-emit, never chained `re.sub` on a whole file** — split on
   `\n---\n` block boundaries first, process atomically, rejoin. Avoids
   cross-block corruption.
2. **archetype_swords is identical across all 4 suit files** for a primary
   (locked §6, validator-enforced). Do not invent new lines.
3. **Position labels by pairing type:** same-suit self-pairing (King+King)
   → `swords_position_1/_2`; all differing-card pairings → named labels
   (`five_of_swords_position`, `ace_of_cups_position`).
4. **Missing Ace blocks must be authored fresh** for older primaries
   (5/6/7); use `5_to_cups` as template.
5. **key_terms hand-authoring beats regex extraction** — concise noun
   phrases, not sentence fragments.

## Recommended next flow
Tier A (quick win) → Tier B → Tier C (paced). Run validator after each file;
commit cohesive chunks; push to `claude/2-cups-pents-pairings-c2fgf4`.
