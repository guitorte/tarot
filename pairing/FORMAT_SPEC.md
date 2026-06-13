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
`numerical_relation` arithmetic, digit-reduction for sums >21, and the Marseille trump
(§4.1); the five dynamics with field counts **4/5/5/4/4**; antagonism position labels
(named `<card>_of_<suit>_position` for differing cards, `swords_position_1/_2` for a
self-pairing, §9); and `structural_metadata` values (`format_version 1.3`,
`elemental_primary` §5, `uid` §7). It does **not** judge prose — that stays human.

Exit 0 = all checked files conformant; exit 1 = issues (printed per file/block). Run it
before every commit, and use it as the normalization worklist: issue count per file maps
to the §9 drift tiers (full-field files ~40; reduced-format files 250+).
```
