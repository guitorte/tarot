# Swords Pairing — Format Specification & Authoring Guide

**Status:** authoritative. This file is the single source of truth for the structure,
conventions, and quality bar of every `pairing/swords/<card>_to_<suit>.txt` file.
If a generated file and this spec disagree, the spec wins and the file is wrong.

**Audience:** a model (Haiku or Sonnet) opening a fresh session to either (a) author a
new card's four files or (b) verify/normalize existing files. Read this whole file
before writing or checking anything. Do not infer the format from existing files —
several of them predate this spec and are inconsistent (see §9 Known Deviations).

---

## 1. What this project is

A Jodorowskian numerological tarot study. For a given **primary** card (here, each card
of the Swords suit), we write one file per **target suit** describing how the primary card
pairs with all 14 cards of that suit. Four files per primary card:

- `<card>_to_pentacles.txt` — Air meets Earth
- `<card>_to_cups.txt` — Air meets Water
- `<card>_to_wands.txt` — Air meets Fire
- `<card>_to_swords.txt` — Air meets Air (the primary card meets every Swords card, including itself)

Each file contains **14 pairing blocks** separated by a line containing only `---`.
Each block walks the same five dynamics (§3).

The theory (see `pairing/context.md`): every number/degree has a "vocation to evolve
toward the next degree," and the relationship between two cards can be an **evolution**,
a **conflict**, or a **stagnation/regression**. We expand that into five named dynamics.

---

## 2. The block skeleton (canonical)

Every block has exactly these sections and fields, in this order. No fields added,
none removed. See `pairing/TEMPLATE.txt` for a copy-paste scaffold.

```
card_pair: <Swords card>, <Other card>
archetype_swords: <canonical archetype line — see §6>
archetype_<othersuit>: <canonical archetype line>      # for *_to_swords use: archetype_swords_2
numerical_relation: <see §4>
elemental_bridge: <one concrete clause: how Air meets the other element here>
threshold_type: <the specific situation/meeting-point this pairing names>

dynamic_genesis:
  mechanism: <how the harmonious generation works>
  process: <how it unfolds, step to step>
  outcome: <the resulting integrated state>
  key_terms: <3–5 concrete tags, comma-separated>

dynamic_antagonism:
  mechanism: <how the conflict is generated>
  tension_axis: <the specific polarity, "X versus Y">
  <swords_card>_position: <first-person-ish stance of the Swords card>
  <other_card>_position: <first-person-ish stance of the other card>
  key_terms: <3–5 concrete tags>

dynamic_inhibition:
  mechanism: <how the blockade/stagnation forms>
  blockade_nature: <what specifically is blocked>
  swords_state: <the reduced state the Swords figure is left in>
  consequence: <what results from the blockade>
  key_terms: <3–5 concrete tags>

dynamic_devolution:
  mechanism: <how the degradation happens>
  mode: <the specific form the corruption takes>
  loss: <what is destroyed or lost>
  key_terms: <3–5 concrete tags>

dynamic_dependency:
  mechanism: <how integration becomes necessary>
  function: <the function each card serves for the other>
  integration_outcome: <the result of healthy integration>
  key_terms: <3–5 concrete tags>

structural_metadata:
  series_count: 14
  format_version: 1.3
  ontology: jodorowskian numerological psychology with <element> graduation
  encoding: UTF-8
  elemental_primary: <see §5>
  numerical_axis: <swords#>-1 through <swords#>-14
  uid: <see §7>
```

Field counts to memorize: genesis 4, antagonism 5, inhibition 5, devolution 4,
dependency 4. If any dynamic section has only 2 fields, the block is in the old reduced
format and is **wrong** (see §9).

---

## 3. The five dynamics — what each one means

These map to the source instructions in `context.md` ("X engendra/conflito/estagnado/
reduz-se/necessitando Y"). The Swords card is X (the primary); the other card is Y.

| Section | Source phrase | Plain meaning |
|---|---|---|
| `dynamic_genesis` | X engenders Y | Harmonious emergence. X gives rise to Y well; they cooperate. |
| `dynamic_antagonism` | X in active conflict with Y | Tension. The two pull in incompatible directions. |
| `dynamic_inhibition` | X stagnant before Y | Blockade/paralysis. Nothing moves; one freezes the other. |
| `dynamic_devolution` | X reduces itself to Y | Corruption/degradation. The pairing curdles into its worst form. |
| `dynamic_dependency` | X needing Y | Necessary integration. Each completes the other; the mature resolution. |

Write all five for **this specific pair of cards**. The dynamic is the lens; the two
named cards are the subject. Never write a dynamic that would read the same for any
other pair.

---

## 4. `numerical_relation` (REQUIRED format)

```
<swords#> + <other#> = <sum> (<Trump number> <Trump name>; <concrete gloss>)
```

- Card values: Ace=1, 2–10 = face value, Page=11, Knight=12, Queen=13, King=14.
- `<sum>` = arithmetic sum of the two values. **Check the addition every time** — the
  most common past error was writing the wrong addend (e.g. `13 + 3` for a 10-card).
- Trump = the Major Arcana for `<sum>` from the **Marseille / Jodorowsky** table in §4.1.
  If `sum` > 21, reduce by digit-sum (e.g. 27 → 2+7 = 9 → Trump IX). State the reduction:
  `13 + 10 = 23 → 2+3=5 (V The Pope; ...)`.
- `<concrete gloss>` = one clause naming the actual pairing dynamic in plain terms.
  Not mood-poetry. "authority confronts grief" — good. "the meeting of two souls" — bad.

Example: `14 + 5 = 19 (XIX The Sun; judgment brought to bear on grief)`

### 4.1 Major Arcana table (Marseille order — use this, not Waite)

Jodorowsky uses the Marseille deck. **8 = Justice, 11 = Strength** (Waite swaps these —
do not use Waite). Existing files that say "8 = Strength" are wrong (see §9).

```
0  The Fool (Le Mat)        VIII Justice
I   The Magician            IX   The Hermit
II  The High Priestess      X    The Wheel of Fortune
III The Empress             XI   Strength (La Force)
IV  The Emperor             XII  The Hanged Man
V   The Pope (Hierophant)   XIII (Death, unnamed arcanum)
VI  The Lovers              XIV  Temperance
VII The Chariot             XV   The Devil
                            XVI  The Tower
                            XVII The Star
                            XVIII The Moon
                            XIX  The Sun
                            XX   Judgement
                            XXI  The World
```

---

## 5. `elemental_primary` (REQUIRED format)

Descriptive form, naming both elements and suits:

- to pentacles: `air (swords) to earth (pentacles)`
- to cups: `air (swords) to water (cups)`
- to wands: `air (swords) to fire (wands)`
- to swords: `air (swords) to air (swords)`

(The shorthand `air-earth` seen in some files is the old reduced form — do not use it.)

---

## 6. Archetype lines (FIXED per card — copy, do not reinvent)

`archetype_swords` must be **identical in all four files for a given Swords card** and
identical to the table below. This single rule prevents most drift. Copy verbatim.

| Card | `archetype_swords` |
|---|---|
| 2 of Swords | Stalemate, choice, decision avoidance, binding agreement, blocked clarity |
| 3 of Swords | Heartbreak, separation, sorrow, painful truth, unavoidable pain |
| 4 of Swords | Rest, truce, peace, mental stillness, respite |
| 5 of Swords | Conflict, defeat, hollow victory, defeat-at-cost, contested truth |
| 6 of Swords | The Traveler, The Departure, The Crossing, The Healer Through Distance |
| 7 of Swords | The Thief, The Cunning Escape, The Duplicity, The Strategic Theft |
| 8 of Swords | The Bound One, The Prisoner, The Enslaved Mind, Constraint Consciousness |
| 9 of Swords | The Tormented, The Nightmare Consciousness, The Despair Infinite, Mental Anguish |
| 10 of Swords | The Ruined, The Defeated Utterly, The Despair Complete, Final Devastation |
| Page of Swords | The Messenger, The Youthful Truth, The New Thought, Idea Arriving |
| Knight of Swords | The Pursuer, The Wind Rider, The Zealous Seeker, Truth In Motion |
| Queen of Swords | The Discerning Mind, The Clear Authority, The Sovereign Intellect, Clarity Hard-Won |
| King of Swords | The King, The Enthroned Mind, The Visionary Authority, Thought That Commands |

(Ace of Swords, if ever needed as primary: `The New Truth, The Clarity Arrived, The Insight Witnessed, Thought Ignited`.)

**Secondary archetype** (`archetype_pentacles` / `_cups` / `_wands` / `archetype_swords_2`):
source the line for that target card from its dedicated single-card file
(`pairing/cups/<card>.txt`, `pairing/wands/<card>.txt`) or from an existing pairing file
that already uses it, and reuse it verbatim. Keep it identical across every block that
references that same target card. Use the same concise, comma-separated descriptor style.

---

## 7. `uid` (FIXED scheme)

Four characters: **`<Rank><O><S><Target>`** = Rank + `OS` ("Of Swords") + Target-suit.

- Rank char: Ace=`A`, 2–9 = digit, 10=`X`, Page=`P`, Knight=`N`, Queen=`Q`, King=`K`.
- `OS` is literal (the primary suit, Swords).
- Target char: Pentacles=`P`, Cups=`C`, Wands=`W`, Swords=`S`.

Examples: `4 of Swords → Pentacles` = `4OSP`. `Ten → Cups` = `XOSC`.
`Queen → Wands` = `QOSW`. `King → Swords` = `KOSS`. `Page → Pentacles` = `POSP`.

Every block in a file shares the same uid. (Note: `N` = Knight and `K` = King are kept
distinct on purpose. Older files used inconsistent uids — see §9.)

---

## 8. The quality bar — concrete, not decorative

The content must be **precise, specific, concrete, and applicable**: something a reader
doing an actual two-card reading can use. Length and lofty vocabulary are not the goal;
usefulness is. Three rules:

1. **Name the real mechanism.** Say what actually happens between these two cards
   psychologically. Avoid sentences that would be true of any pair.

2. **Ban the empty transformation cliché.** Phrases like "the pursuit becomes devotion,"
   "the message becomes a doorway," "the journey and the settlement are revealed as two
   parts of a whole" are decorative filler. They name no mechanism. Replace with the
   concrete move.

3. **Telegraphic, dense, semicolon-joined.** Match the original style of files 4–5:
   short declarative clauses, present tense, concrete nouns. Not flowing narrative
   paragraphs.

### Before / after (drawn from real drift in this project)

> ❌ `integration: The message and the gift teach each other about communication of value; the page learns that announcing abundance can create both reception and resistance; the figure learns that the best gifts are received humbly; the message becomes the preparation for genuine reception`

> ✅ `function: Swords-Page supplies the announcement that makes a gift recognizable; Pentacles-Ace supplies the substance the announcement would otherwise lack`
> `integration_outcome: news and substance arrive together; the gift is both received and understood`

The bad version is long, repetitive, and ends in the "becomes" cliché. The good version
is shorter and says what each card does for the other.

---

## 9. Known deviations to normalize (audit targets)

The suit was written across several drifting formats before this spec existed. When
verifying or normalizing, expect and fix these:

- **Files 4–5** (true original structure, correct field sets) use the bare
  `4-1 (gloss)` numerical form and generic `swords_position` labels. Normalize the
  numerical_relation to §4 and position labels to §2. Keep their concrete prose — it is
  the model for §8.
- **Files 6–7** use extra fields `spatial_logic` (in inhibition) and `paradox` (in
  dependency), and are missing some canonical fields. Remove the extra fields, restore
  the canonical field sets (§2).
- **Files 8, 9, 10, and all Page/Knight/Queen files** use the **reduced** format:
  `dynamic_inhibition` = blockade + consequence only; `dynamic_devolution` = corruption +
  loss only; `dynamic_dependency` = integration + outcome only. They are missing
  `mechanism`, `blockade_nature`, `swords_state` / `mode` / `function`, and the
  per-section `key_terms`. They also use `air-earth` shorthand, `12 + 1 = 13`-style
  numerical_relation without the Major Arcana clause, and card-specific position labels
  with mixed conventions. Restore full fields (§2), fix elemental_primary (§5) and
  numerical_relation (§4). Their prose also tends toward the §8 anti-patterns — tighten.
- **uids** are inconsistent across the suit (`FOSP` vs `TOPS` vs `POPS` …). Normalize all
  to §7.
- **Major Arcana**: any "8 = Strength" is Waite; correct to "8 = Justice" (§4.1).
- **Same-suit position labels**: for `*_to_swords.txt`, when the two cards differ use
  each card's name (`queen_of_swords_position`, `knight_of_swords_position`); when a card
  meets itself use `swords_position_1` / `swords_position_2`.

`format_version` for spec-compliant blocks is **1.3**. Older blocks say 1.2 — bumping to
1.3 marks a block as conformed to this spec.

---

## 10. Worked example (fully canonical)

```
card_pair: King of Swords, 5 of Cups
archetype_swords: The King, The Enthroned Mind, The Visionary Authority, Thought That Commands
archetype_cups: Loss, grief, mourning, focus on the spilled, regret
numerical_relation: 14 + 5 = 19 (XIX The Sun; judgment brought to bear on grief)
elemental_bridge: Air's verdict meets Water's mourning; the mind that rules meets the feeling that will not be ruled
threshold_type: The grief brought before the judge; sorrow asked to state its case

dynamic_genesis:
  mechanism: Judgment names the loss precisely; clear authority gives grief an exact object
  process: The King separates what was actually lost from the story piled on it; the three spilled cups are counted, the two standing ones made visible
  outcome: Grief becomes legible and therefore bearable; mourning addresses a defined loss, not an inflated catastrophe
  key_terms: precise naming of loss, fact separated from story, grief made legible, bounded mourning

dynamic_antagonism:
  mechanism: The demand for a verdict collides with grief's need to be felt before it is analyzed
  tension_axis: judgment-too-soon versus feeling-not-yet-finished
  king_of_swords_position: States the loss plainly; demands a decision and a way forward
  five_of_cups_position: Refuses to rule; insists the sorrow be felt before it is assessed
  key_terms: premature verdict, rushed mourning, the cold question, feeling resists ruling

dynamic_inhibition:
  mechanism: Logic is applied to a wound logic cannot reach; each rational argument meets a feeling that will not be argued with
  blockade_nature: emotional reality sealed off from rational access; the mind speaks, the grief does not answer
  swords_state: a judge without jurisdiction; authority that cannot rule because the domain is not the mind's
  consequence: stalemate; the person agrees intellectually that they should feel better and feels nothing shift
  key_terms: logic against feeling, judge without jurisdiction, agreement without relief, sealed grief

dynamic_devolution:
  mechanism: Authority hardens into a sentence; grief is judged as weakness or self-indulgence
  mode: contempt disguised as objectivity; clarity used to shame sorrow
  loss: the right to grieve is revoked; sorrow is hidden behind competence and never resolved
  key_terms: grief judged weak, clarity weaponized, shamed mourning, suppression behind competence

dynamic_dependency:
  mechanism: The King supplies the boundary that keeps grief from becoming endless; grief supplies the human reality the King's judgments must answer to
  function: Swords-King gives limit and structure (this much, this long, these facts); Cups-5 gives the truth that something real was lost and must be honored
  integration_outcome: mourning that is both fully felt and eventually concluded; a verdict reached only after the feeling has spoken
  key_terms: structure contains grief, feeling humanizes judgment, bounded mourning, verdict after feeling

structural_metadata:
  series_count: 14
  format_version: 1.3
  ontology: jodorowskian numerological psychology with water graduation
  encoding: UTF-8
  elemental_primary: air (swords) to water (cups)
  numerical_axis: 14-1 through 14-14
  uid: KOSC
```

---

## 11. Self-check before saving

Per block:
- [ ] All six header fields present; `card_pair` matches the two cards.
- [ ] `archetype_swords` is verbatim from §6.
- [ ] `numerical_relation`: addition is correct; Trump matches §4.1 (Marseille); gloss is concrete.
- [ ] Five dynamics present with full field counts (4/5/5/4/4); each has `key_terms`.
- [ ] Antagonism uses the two cards' names as position labels (same-suit rule, §9).
- [ ] No "becomes / is revealed as / teach each other" filler (§8).
- [ ] `structural_metadata`: `format_version: 1.3`, `elemental_primary` per §5,
      `numerical_axis` uses the Swords card's number, `uid` per §7.

Per file:
- [ ] Exactly 14 blocks, separated by `---`, in order Ace → King of the target suit.
- [ ] Same `uid` and same `elemental_primary` in every block.
- [ ] `archetype_swords` identical in all 14 blocks.

---

## 12. Cross-session protocol

**To author a new card:** create all four files (`_to_pentacles`, `_to_cups`, `_to_wands`,
`_to_swords`). Each = 14 blocks. Use `pairing/TEMPLATE.txt`. Run §11 checks. Commit the
four files together with a message naming the card. Push to the working branch.

**To verify/normalize:** pick a file, check every block against §11 and §9, fix in place,
bump `format_version` to 1.3, commit per file or per card with a clear message.

**Definition of done for the Swords suit:** all 13 numbered+court primary cards (2–King)
× 4 target files = 52 files, every block spec-compliant (1.3), §11 passing.
(The Ace of Swords primary is out of current scope unless requested.)
```

---

## 13. The validator (`pairing/validate.py`)

Most of §11 is mechanical. `validate.py` checks the parts a script can check, so the
self-check by hand can focus on prose quality (§8), which it cannot.

```
python3 pairing/validate.py                 # all swords/*.txt
python3 pairing/validate.py <file> ...       # specific files
python3 pairing/validate.py --quiet          # errors only (drop the ✓ lines)
```

It verifies, per the rules above: 14 blocks in Ace→King order; required header fields;
`archetype_swords` matches the §6 canonical line for the primary card;
`numerical_relation` arithmetic, digit-reduction for sums >21, and the Marseille trump
(§4.1); the five dynamics with field counts **4/5/5/4/4**; antagonism position labels
(named `<card>_of_<suit>_position` for differing cards, `swords_position_1/_2` for a
self-pairing, §9); and `structural_metadata` values (`format_version 1.3`,
`elemental_primary` §5, `uid` §7). It does **not** judge prose — that stays human.

Exit 0 = all checked files conformant; exit 1 = issues (printed per file/block). Run it
before every commit, and use it as the normalization worklist: issue count per file maps
to the §9 drift tiers (full-field files ~40; reduced-format files 250+).
```

---

## 14. Major Arcana combinations (Phase 2 — the current work)

**Status of Phase 1 (minor-suit pairings):** COMPLETE. All 56 `pairing/swords/*.txt`
files (13 numbered+court primaries × 4 target suits, plus the 4 Ace-of-Swords-primary
files) are spec-conformant at v1.3; `python3 pairing/validate.py` exits 0.

**Phase 2 goal:** for each of the 14 Swords cards (Ace–King), add its combinations with
all **22 Major Arcana** (The Fool 0 → The World 21). Same structured format, same five
dynamics, same quality bar (§8). Decisions below are locked.

### 14.1 File naming, count, order
- One file per primary Swords card: `pairing/swords/<card>_to_major.txt`
  (`ace`, `2`…`10`, `page`, `knight`, `queen`, `king`) — **14 files**.
- **22 blocks** per file, in Marseille order **0 → 21** (The Fool first, The World last),
  separated by `\n---\n` exactly as the minor files.
- The Swords card is **X** (primary); the Arcanum is **Y**. Total: 14 × 22 = 308 blocks.

### 14.2 Block skeleton (delta from §2)
Identical to §2 except:
- `archetype_major:` replaces `archetype_<suit>:` — verbatim from the §14.5 table.
  (`archetype_swords:` is still the canonical §6 line for the primary card. The Major is
  never "swords", so there is no `_1/_2` same-suit complication.)
- `numerical_relation:` (LOCKED — sum & reduce): `<swords#> + <arcanum#> = <sum> (Trump; gloss)`.
  - `<swords#>` = Swords card value (Ace=1 … King=14, §4).
  - `<arcanum#>` = the Major's own number, **0–21** (The Fool = 0).
  - `<sum>` = arithmetic sum; **digit-reduce sums > 21** and show it
    (`14 + 21 = 35 → 3+5 = 8 (VIII Justice; …)`). Sum 0 (Ace? no — min is 1+0=1) never occurs.
  - Trump = Marseille trump (§4.1) for the resolved value. Coincidence with one of the two
    cards is fine — read it as resonance, not error.
- `elemental_bridge:` — free clause; here "how the Swords card's air meets this arcanum's
  force" (the Major is not elemental in the suit sense).
- antagonism position labels: `<swords_card>_position` + `<arcanum_slug>_position`, both
  ending `_position`. Arcanum slug = lowercased name, spaces→`_`, e.g. `the_fool_position`,
  `the_high_priestess_position`, `justice_position`, `strength_position`, `death_position`,
  `the_wheel_of_fortune_position`. (No self-pairing case — primary is always a Swords card.)
- `structural_metadata`:
  - `series_count: 22`
  - `ontology: jodorowskian numerological psychology with major arcana graduation`
  - `elemental_primary: air (swords) to major arcana`
  - `numerical_axis: <swords#>-0 through <swords#>-21`
  - `uid: <Rank>OSM`  (Rank char per §7 + `OS` + `M` for Major). E.g. 5→`5OSM`, Ace→`AOSM`,
    King→`KOSM`, Page→`POSM`, 10→`XOSM`.

Field counts per dynamic are unchanged (4/5/5/4/4). Use `pairing/TEMPLATE_major.txt`.

### 14.3 Validator must be extended FIRST
`validate.py` currently treats every `pairing/swords/*.txt` as a 14-block minor file, so the
new `_to_major.txt` files will FAIL until the validator learns the major branch. Before
authoring, update `validate.py` to detect `^(<rank>)_to_major\.txt$` and apply:
22 blocks in arcana order 0–21; `archetype_major` matches the §14.5 table; numerical second
addend = arcanum number (0–21) with the sum/reduce/trump rule; `series_count 22`;
`elemental_primary` = `air (swords) to major arcana`; `numerical_axis` = `<n>-0 through <n>-21`;
`uid` = `<Rank>OSM`; antagonism has exactly two `*_position` fields. Keep the existing minor
branch untouched so the 56/56 stays green. Add a `MAJORS = [(0,"The Fool"), …]` table and an
`ARCH_MAJOR = {…}` table mirroring §4.1 / §14.5.

### 14.4 Numerical worked examples (check the arithmetic every time)
```
Ace + The Fool      = 1 + 0  = 1  (I The Magician; …)
5   + The Pope (V)  = 5 + 5  = 10 (X The Wheel of Fortune; …)
King+ The World(XXI)= 14 + 21 = 35 → 3+5 = 8 (VIII Justice; …)
Queen + The Devil(XV)=13 + 15 = 28 → 2+8 = 10 (X The Wheel of Fortune; …)
```

### 14.5 `archetype_major` canonical table (reuse verbatim, like §6)
Comma-separated descriptors, Marseille/Jodorowsky sense. Identical across every file that
references that arcanum.

| # | Arcanum | `archetype_major` |
|---|---|---|
| 0 | The Fool | The Free Wanderer, The Unbound Step, The Sacred Madness, Movement Without Map |
| I | The Magician | The Willed Act, The Beginning Adept, The Focused Intention, Potential Taking Tools |
| II | The High Priestess | The Silent Knowing, The Gestating Mystery, The Inner Reservoir, Wisdom Unspoken |
| III | The Empress | The Generative Force, The Irrepressible Growth, The Abundant Creation, Life Without Permission |
| IV | The Emperor | The Established Order, The Stable Authority, The Structured Dominion, Power Made Solid |
| V | The Pope | The Bridge-Builder, The Transmitted Meaning, The Sacred Mediator, Spirit Made Teaching |
| VI | The Lovers | The Decisive Bond, The Chosen Union, The Crossroads of the Heart, Love That Must Choose |
| VII | The Chariot | The Directed Triumph, The Mastered Motion, The Conquering Will, Victory In Movement |
| VIII | Justice | The Exact Measure, The Balanced Verdict, The Impartial Blade, Equilibrium Enforced |
| IX | The Hermit | The Solitary Lantern, The Backward Walk, The Patient Reckoning, Wisdom Through Withdrawal |
| X | The Wheel of Fortune | The Turning Cycle, The Impermanent Turn, The Fated Revolution, Change Beyond Control |
| XI | Strength | The Gentle Mastery, The Tamed Power, The Quiet Conquest, Force Through Softness |
| XII | The Hanged Man | The Suspended View, The Willing Reversal, The Fertile Surrender, Insight Through Inversion |
| XIII | Death | The Necessary End, The Clearing Cut, The Transforming Threshold, Renewal Through Loss |
| XIV | Temperance | The Patient Blend, The Flowing Synthesis, The Healing Measure, Harmony Through Mixing |
| XV | The Devil | The Binding Shadow, The Material Chain, The Seductive Trap, Bondage Through Desire |
| XVI | The Tower | The Sudden Collapse, The Shattered Structure, The Liberating Catastrophe, Truth That Breaks |
| XVII | The Star | The Renewed Hope, The Quiet Replenishment, The Guiding Light, Faith After Ruin |
| XVIII | The Moon | The Deceptive Night, The Unconscious Depth, The Uncertain Path, Illusion and Instinct |
| XIX | The Sun | The Clear Joy, The Radiant Vitality, The Shared Light, Truth Made Warm |
| XX | Judgement | The Awakening Call, The Resurrected Self, The Reckoning Summons, Rebirth Through Reckoning |
| XXI | The World | The Completed Whole, The Integrated Dance, The Achieved Totality, Fulfillment Realized |

(`XIII` is the unnamed arcanum; we use "Death" as its working name in `card_pair`,
`archetype_major`, and the `death_position` label, matching §4.1.)

### 14.6 Worked block (fully canonical)
```
card_pair: 5 of Swords, The Pope
archetype_swords: Conflict, defeat, hollow victory, defeat-at-cost, contested truth
archetype_major: The Bridge-Builder, The Transmitted Meaning, The Sacred Mediator, Spirit Made Teaching
numerical_relation: 5 + 5 = 10 (X The Wheel of Fortune; the hollow victor meets the mediator who would reconcile)
elemental_bridge: Air's divisive edge meets the Pope's reconciling office; the mind that wins by splitting meets the hand that joins
threshold_type: The bitter victor brought before the mediator; conflict asked to be reconciled

dynamic_genesis:
  mechanism: The Pope's mediation gives the hollow victory a way back into relationship; reconciliation offers the victor an exit from isolation
  process: the mediator names the cost the victory hid; the contested truth is translated into terms both sides can hold
  outcome: a peace the victor could not reach alone; the win reframed as a bridge rather than a wall
  key_terms: mediated peace, the named cost, win reframed, exit from isolation

dynamic_antagonism:
  mechanism: The victor's belief that someone must lose collides with the Pope's premise that both can be joined
  tension_axis: winning by division versus reconciling by inclusion
  five_of_swords_position: Trusts only the verdict that leaves a loser; reads mediation as weakness
  the_pope_position: Insists the breach can be bridged; refuses to bless a victory built on a defeat
  key_terms: division versus inclusion, distrusted mediation, the refused bridge, verdict against reconciliation

dynamic_inhibition:
  mechanism: The mediator offers terms the victor is too armored to accept; reconciliation stalls against pride
  blockade_nature: the bridge is built but the victor will not cross it; the offer of peace cannot reach a defended heart
  swords_state: the victor standing at the bridgehead, unwilling to lay down the won ground to meet the other side
  consequence: the breach stays open; mediation and victory face each other unmoved
  key_terms: the uncrossed bridge, peace refused by pride, armored against reconciliation, the open breach

dynamic_devolution:
  mechanism: The victor co-opts the mediator's language to dress domination as reconciliation
  mode: peace-talk weaponized; the office of the bridge used to launder a one-sided win
  loss: the integrity of mediation itself; reconciliation becomes propaganda for the victory
  key_terms: laundered domination, weaponized peace-talk, false reconciliation, mediation corrupted

dynamic_dependency:
  mechanism: The victor needs the Pope to convert a hollow win into a livable relationship; the Pope needs the victor's hard truth to keep the peace honest
  function: Swords-5 supplies the unflinching fact of what the conflict cost; Major-V supplies the office that turns that fact into a settlement
  integration_outcome: a reconciliation that neither denies the wound nor leaves a loser; victory matured into a bridge that holds
  key_terms: honest settlement, wound acknowledged, no loser left, the bridge that holds

structural_metadata:
  series_count: 22
  format_version: 1.3
  ontology: jodorowskian numerological psychology with major arcana graduation
  encoding: UTF-8
  elemental_primary: air (swords) to major arcana
  numerical_axis: 5-0 through 5-21
  uid: 5OSM
```

### 14.7 Workflow for Phase 2
1. Extend `validate.py` (§14.3) and confirm the 56 minor files still pass.
2. Author one `<card>_to_major.txt` at a time (22 blocks). Pace ~1 file per chunk; commit
   per file or per small group with a clear message. There is **no normalizer** — these are
   authored fresh from `TEMPLATE_major.txt`; the existing `_normalize_*.py` are for legacy
   drift only and do not apply here.
3. Run the validator after each file; keep prose to the §8 bar (no "becomes/reveals" filler;
   telegraphic, concrete, semicolon-joined). `key_terms` hand-authored from the start.
4. Definition of done for Phase 2: all 14 `<card>_to_major.txt` present and conformant
   (14 × 22 = 308 blocks), validator exit 0 across the whole `pairing/swords/` directory.

---

## 15. Other primary suits (Phase 3 — Pentacles primary and beyond)

**Status:** IN PROGRESS. Phase 3 extends the project beyond Swords-as-primary. The first
primary card authored is the **Ace of Pentacles** (`pairing/pentacles/ace_to_{cups,wands,swords,pentacles}.txt`).
The structure is identical to Phases 1–2; only the suit-specific tokens change. The
validator is now **primary-suit-aware**: it reads the primary suit from the file's parent
directory (`pairing/<suit>/`), so the same logic checks every lineage. Keep this in mind —
a pentacles file in the wrong directory will be validated as the wrong suit.

### 15.1 What changes from the Swords spec
For a primary suit S (here `pentacles`), in directory `pairing/<S>/`, with files
`<card>_to_<target>.txt` (14 blocks, Ace→King of the target; same five dynamics; §8 bar):

- **Primary archetype field:** `archetype_<S>` (e.g. `archetype_pentacles`) replaces
  `archetype_swords`. Same rule as §6: fixed per card, identical in every block of every
  file for that card. The canonical Pentacles table is §15.3.
- **Same-suit file** (`<S>_to_<S>`, e.g. `ace_to_pentacles`): primary/target archetypes are
  `archetype_<S>_1` / `archetype_<S>_2`; a card meeting itself uses
  `<S>_position_1` / `<S>_position_2` in antagonism (e.g. `pentacles_position_1/_2`).
  Differing same-suit cards use named labels (`ace_of_pentacles_position`,
  `two_of_pentacles_position`, …).
- **Cross-suit antagonism labels:** the short suit form is the established convention —
  `<S>_position` + `<target>_position` (e.g. `pentacles_position` / `cups_position`). The
  validator only requires two `*_position` fields for differing cards; keep the labels
  concrete and consistent within a file.
- **Inhibition state field:** `<S>_state` (e.g. `pentacles_state`) replaces `swords_state`.
- **`numerical_relation`:** unchanged (§4). Card values and Marseille trumps are the same;
  only the addends differ. For an Ace primary every sum is `1 + target` (2 → 15 across
  Ace→King), so the trump column is fixed: II, III, IV, V, VI, VII, VIII, IX, X, XI, XII,
  XIII, XIV, XV.
- **`elemental_primary`:** `<element of S> (<S>) to <element of target> (<target>)`. Pentacles
  is **earth**: `earth (pentacles) to water (cups)`, `… to fire (wands)`, `… to air (swords)`,
  `… to earth (pentacles)`.
- **`ontology`:** `jodorowskian numerological psychology with <target-element> graduation`
  (target-suit element, per §2/§10 — water/fire/air/earth). NOTE: some legacy Swords files
  drifted to "with pentacles graduation"; the validator does not check `ontology`, but new
  files should use the documented target-element form.
- **`uid`:** `<Rank><OS-infix><Target>` where the infix names the primary suit:
  `OP` = Of Pentacles, `OC` = Of Cups, `OW` = Of Wands, `OS` = Of Swords. Target char per §7
  (P/C/W/S). E.g. Ace of Pentacles → Cups = `AOPC`; → Pentacles = `AOPP`; → Swords = `AOPS`.
- **Directional rule (CRITICAL, as §14):** the **primary suit card is always X**, the
  generating force. It engenders / conflicts with / stagnates before / reduces into / needs
  the target Y. Ace of Pentacles → 5 of Cups is NOT 5 of Cups → Ace of Pentacles.

### 15.2 Secondary (target) archetype lines
Reuse verbatim, identical across every block referencing that target card. Source them from
the existing Swords pairing files, which already carry `archetype_cups`, `archetype_wands`,
`archetype_swords` (secondary form), and `archetype_pentacles` for all 14 cards of each suit.
The validator does NOT check the secondary line's content (only the primary line's), but the
§6/§15.3 discipline of verbatim reuse still applies for consistency.

### 15.3 `archetype_pentacles` canonical table (FIXED per card — copy, do not reinvent)
Identical in all four files for a given Pentacles card and identical to the table below.

| Card | `archetype_pentacles` |
|---|---|
| Ace of Pentacles | Manifestation, earthly foundation, material beginning, prosperity, practical potential |
| 2 of Pentacles | Balance, juggling, flexibility, adaptive exchange, equilibrium |
| 3 of Pentacles | Collaboration, skill, artisanship, mutual effort, crafted mastery |
| 4 of Pentacles | Holding, security, control, possessiveness, guarded resources |
| 5 of Pentacles | Hardship, poverty, material loss, deprivation, abandonment |
| 6 of Pentacles | Sharing, generosity, fair exchange, reciprocal giving, balanced distribution |
| 7 of Pentacles | Assessment, patience, long-term investment, paused evaluation, trust in process |
| 8 of Pentacles | Mastery, skill-development, apprenticeship, dedication, refined craft |
| 9 of Pentacles | Independence, luxury, earned abundance, self-sufficiency, prosperous solitude |
| 10 of Pentacles | Legacy, inheritance, family wealth, generational continuity, established foundation |
| Page of Pentacles | Curiosity, material learning, practical exploration, earthy apprentice, grounded potential |
| Knight of Pentacles | Dedication, reliable service, steady work, methodical action, trustworthy effort |
| Queen of Pentacles | Nurturing mastery, practical wisdom, abundant care, earthly authority, generous management |
| King of Pentacles | Material authority, abundant leadership, earthly dominion, prosperous rule, powerful stewardship |

### 15.4 State of Phase 3
- ✅ Ace of Pentacles: `ace_to_cups`, `ace_to_wands`, `ace_to_swords`, `ace_to_pentacles`
  (4 files, 56 blocks). `python3 pairing/validate.py` → all `pairing/*/*_to_*.txt` green.
- Remaining for the Pentacles primary: 2–King (13 cards × 4 target files = 52 files), then
  optionally `<card>_to_major.txt` (Phase 3 majors, validator already generalized via the
  parent-directory branch). Author from the §2 skeleton with the §15.1 substitutions; the
  `TEMPLATE.txt` / `TEMPLATE_major.txt` scaffolds apply with the field renames above.
- Cups-primary and Wands-primary lineages would follow the same pattern (`pairing/cups/`,
  `pairing/wands/`), each needing its own §15.3-style canonical archetype table added here
  first. The validator's `ARCH_PRIMARY` dict must gain the new suit's table before authoring.
