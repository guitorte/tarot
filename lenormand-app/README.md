# Lenormand Pairs

A one-page phone app for looking up Lenormand card combinations quickly,
or reading each card's keywords, meaning and comparisons on their own.
Everything in it comes from the export in [`../lenormand/`](../lenormand/)
(`annak-lenormand.zip`, the Lenormand pages of annak-tarot.at).

Built for portrait screens and one thumb: the text scrolls at the top, and
every control (card grid, section tabs, the two card slots) sits in the
bottom third of the screen.

## Using it

- **A combination:** tap a card on the grid, then its partner. Two taps.
- **One card:** tap a card, then **Read alone**. The tabs at the bottom
  switch between *Keywords*, *Meaning*, *Compare* and *Pairs* (every
  combination of that card in one list).
- **Change a card:** tap its slot at the bottom and pick another; tap the
  slot's × to remove it.
- The phone's back gesture steps back through the cards you opened, and each
  view has its own link (`#rider`, `#rider.meaning`, `#rider~clover`).

The first card is always blue and the second red, on the grid, in the slots
and in the combination header.

## Running it

No build tools and no server needed: open `index.html` in a browser. It also
works from any static host (GitHub Pages, `python3 -m http.server`, …). The
fonts come from Google Fonts; offline it falls back to system fonts.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page |
| `app.css` | Styles, light and dark |
| `app.js` | Views, card picker and navigation |
| `data.js` | Generated card data (do not edit by hand) |
| `build.py` | Turns the zip into `data.js` |

## Rebuilding the data

```sh
python3 build.py                       # reads ../lenormand/annak-lenormand.zip
python3 build.py path/to/export.zip    # or any other copy of the export
```

Standard library only; the zip is read in place. The script:

- parses the four pages of each of the 40 cards (36 cards, the second
  versions of Man, Woman and Lily, and the Wild Card);
- turns each combination into a list of sentences, since each sentence is
  a separate reading;
- names each combination by the two card pictures in its heading, and
  corrects the three headings whose pictures are wrong (Man b + Bear, and
  Stork + Man b / Woman b);
- marks the 13 pairs whose text differs between the two cards' pages, so the
  app shows both versions for those;
- repairs a few characters that were mis-encoded in the export.
