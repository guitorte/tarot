# Tarot Numerological Pairing Analysis

Comprehensive jodorowskian numerological psychology framework analyzing card pairings between Cups and Wands minor arcana with all 14 Pentacles cards.

> **Status (current):** The actively maintained, spec-driven work lives in `pairing/swords/`.
> **Phase 1 (Swords × the four minor suits) is complete — 56/56 files conformant**
> (`python3 pairing/validate.py` → exit 0). **Phase 2 (Swords × the 22 Major Arcana) is the
> current task.** Authoritative format and the Phase-2 plan: `FORMAT_SPEC.md` (see §14).
> Resume guide: `HANDOFF.md`. The notes below describe the older Cups/Wands→Pentacles material
> and are not the current source of truth.

## Directory Structure

```
pairing/
├── cups/          # Water element (Emotions, Relationships)
│   ├── 2.txt      # Duality, Partnership
│   ├── 3.txt      # Trinity, Celebration
│   ├── 4.txt      # Contemplation, Apathy
│   ├── 5.txt      # Loss, Grief
│   ├── 6.txt      # Nostalgia, Innocence
│   ├── 7.txt      # Illusion, Temptation
│   ├── 8.txt      # Abandonment, Departure
│   ├── 9.txt      # Wish Fulfillment, Contentment
│   ├── 10.txt     # Family Harmony, Legacy
│   ├── page.txt   # Emotional Messenger
│   ├── knight.txt # Emotional Action, Romance
│   ├── queen.txt  # Emotional Mastery, Nurturing
│   └── king.txt   # Emotional Authority, Compassion
│
├── wands/         # Fire element (Action, Energy)
│   ├── ace.txt    # Creative Potential, Inspiration
│   ├── 2.txt      # Personal Power, Vision
│   ├── 3.txt      # Foresight, Growth
│   ├── 4.txt      # Celebration, Harmony
│   ├── 5.txt      # Conflict, Competition
│   ├── 6.txt      # Victory, Recognition
│   ├── 7.txt      # Challenge, Resilience
│   ├── 8.txt      # Speed, Momentum
│   ├── 9.txt      # Strength, Endurance
│   ├── 10.txt     # Burden, Responsibility
│   ├── page.txt   # Enthusiasm, Potential
│   ├── knight.txt # Action, Passion
│   ├── queen.txt  # Charisma, Magnetism
│   └── king.txt   # Leadership, Vision
│
└── README.md      # This file
```

## File Format

Each file contains analysis for one source card paired with all 14 Pentacles cards (Ace through King).

### Structure Per File

Each pairing includes:
- **Card Pair Definition**: The two cards being analyzed
- **Archetypes**: Descriptions of each card's essential nature
- **Numerical Relation**: The relationship between the cards (e.g., 2-1, 2-2, ... 2-14)
- **Elemental Bridge**: How the two elements (Water→Earth or Fire→Earth) interact
- **Threshold Type**: The situational meeting point of the archetypes

### Five Dynamic States (Per Pairing)

Each of the 14 pairings in a file explores:

1. **Genesis** - How harmony naturally emerges
2. **Antagonism** - How conflict/tension arises
3. **Inhibition** - How blockage/paralysis manifests
4. **Devolution** - How corruption/degradation occurs
5. **Dependency** - How necessary integration functions

### Metadata

Each file includes:
- `series_count`: 14 (pairings per file)
- `format_version`: 1.2
- `ontology`: jodorowskian numerological psychology
- `encoding`: UTF-8
- `uid`: 3-letter unique identifier
- `numerical_axis`: Card relationship range (e.g., 2-1 through 2-14)

## Usage

### Finding a Specific Pairing

Example: To find the 2 of Cups → 5 of Pentacles pairing:
```
pairing/cups/2.txt
```
Look for the section labeled `card_pair: 2 of Cups, 5 of Pentacles`

### Understanding the Framework

- **Water (Cups)** represents emotion, relationships, receptivity
- **Fire (Wands)** represents action, creativity, assertion
- **Earth (Pentacles)** represents manifestation, material reality, grounding

The framework explores how these elements interact through each card's unique archetypal expression.

### Integration Points

The five dynamic states reveal:
- Natural complementarity (Genesis)
- Inherent tensions (Antagonism)
- Systemic blockages (Inhibition)
- Corruption patterns (Devolution)
- Necessary synthesis (Dependency)

## Project Statistics

- **Total Files**: 27
- **Total Pairings**: 378 (13 Cups + 16 Wands × 14 Pentacles each)
- **Dynamics Per Pairing**: 5 (Genesis, Antagonism, Inhibition, Devolution, Dependency)
- **Total Dynamic Analyses**: 1,890
- **Format**: UTF-8 text with structured metadata
- **Size**: ~830KB combined

## Future Expansion

This structure supports adding:
- **Swords** (Air element) - 16 × 14 pairings
- **Coins/Discs** (Earth element) - 16 × 14 pairings
- **Major Arcana** interactions
- Cross-element pairings (Cups-Wands, Cups-Swords, etc.)

Simply add new suit directories following the same naming convention.

## Notes

- Files use relative numerology where each Pentacle position (1-14) represents an ordinal relationship
- UIDs enable system integration and batch processing
- Keywords in each section support semantic searching and thematic analysis
- All analyses maintain consistent structural depth across all 378 pairings
