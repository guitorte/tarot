# Tarot-Polis — app source

Working source for the Tarot-Polis app. The repository only carried the built
output (`tarot-polis/`) and the packaged Android build
(`apk/tarot-polis-debug-5.zip`), so this directory holds a source tree
reconstructed from that build, plus the changes made on top of it.

The reconstruction is behaviour-for-behaviour with the shipped debug APK:
same React 19 + Vite + Tailwind v4 stack, same components, same card data
(78 cards × up to 17 interpreters, extracted from the bundle into
`src/data/tarot_significados.json`).

## Running it

```sh
npm install
npm run dev      # dev server
npm test         # unit tests (vitest)
npm run build    # production build into dist/
```

To repackage as an Android app, point Capacitor at `dist/`:

```sh
npm run build
npx cap add android      # generates android/, which is gitignored
npx cap sync android
cd android && ./gradlew assembleDebug
```

`capacitor.config.json` keeps the app id (`com.guitorte.tarotpolis`) of the
existing build, so an install upgrades the app in place.

## Building on CI

`.github/workflows/build-apk.yml` does the same thing on every push that
touches this directory, and on demand from the Actions tab (*Build
Tarot-Polis* → *Run workflow*). It regenerates the Android project from
`capacitor.config.json`, so nothing native is kept under version control,
and leaves two artifacts on the run:

- `tarot-polis-web-<sha>` — the `dist/` bundle
- `tarot-polis-debug-apk-<sha>` — `tarot-polis-debug-<short sha>.apk`

The APK is signed with Gradle's debug keystore, same as
`apk/tarot-polis-debug-5.zip`: installable for testing, not for the Play
Store.

## Layout

```
src/
  App.jsx                    shell: tabs, selection, swipe, bottom sheet
  components/
    CardTabs.jsx             horizontal tab strip for the added cards
    CardMeanings.jsx         scrollable pane of interpretations
    CardPicker.jsx           search + suit browser inside the sheet
    BottomSheet.jsx          drag-to-dismiss sheet
    EmptyState.jsx
    HighlightableText.jsx    one interpretation, cut into highlightable runs
    HighlightToolbar.jsx     floating colour picker over a selection
    HighlightsSheet.jsx      list, export and import of highlights
  hooks/
    useScrollMemory.js       per-card scroll offsets
    useCardSwipe.js          axis-locked horizontal swipe between tabs
    useSheetDrag.js          drag the sheet down to close
    useHighlights.js         highlight state, persisted to localStorage
    useTextSelection.js      browser selection -> source-text offsets
  lib/
    ranges.js                range algebra (paint, erase, split, segment)
    highlightStore.js        storage, export document, import + re-anchoring
    shareFile.js             file out/in, native share sheet or download
  data/
    tarot_significados.json  interpretations, keyed by card and author
    cards.js                 card names, suits, badges
    authors.js               the 17 interpreters
    highlightColors.js       the six highlight colours
    meanings.js              lookup + search over the JSON
```

## Changes on top of the shipped build

### Scroll position is kept per card tab

In the shipped build, `CardMeanings` is keyed by card name, so switching tabs
unmounts the pane and destroys the scroll container with it — every switch
dropped the reader back at the top of the text.

`useScrollOffsets()` in `App.jsx` now holds one offset per card in a ref (a
ref, not state: recording a scroll position must not re-render). Each pane
binds to its own offset through `useScrollMemory(offsets, cardName)`, which
records `scrollTop` while the reader scrolls and restores it in a layout
effect on mount. A restore that lands short — the pane can still be laying
out when the font swaps in — is re-applied on the next frame.

Removing a card forgets its offset, so adding the same card back opens it at
the top.

### Highlights

Select any stretch of an interpretation and a toolbar offers six colours —
amarelo, verde, azul, roxo, rosa, laranja — plus an eraser. Tapping an
existing highlight reopens the same toolbar on it, to recolour or remove.

**Anchoring.** A highlight is stored as a character range into the source
text of one (card, author) pair, not as a serialized DOM range. The
interpretations ship with the app and never change at runtime, so offsets
survive re-renders, font swaps and markup changes — including the tab
switch that remounts the pane. `useTextSelection` maps a browser selection
back onto those offsets through the `data-offset` on each rendered run.

Ranges of one passage are kept sorted and never overlap: painting over an
existing highlight erases what it covers and splits the remainder, so the
colour you see is always the colour that is stored. `src/lib/ranges.js` holds
that algebra and `src/lib/__tests__/` covers it.

**Persistence.** Everything is written to `localStorage` under
`tarot-polis:highlights:v1` on every change, which survives closing the app.
It does *not* survive uninstalling it, and Android may clear it when storage
runs low — hence export.

**Export / import.** The *Marcações* sheet (highlighter icon in the header)
writes a JSON file holding every highlight *plus the highlighted excerpt*.
On device the file goes to the app's Documents folder and straight into the
system share sheet; in a browser it downloads.

Importing merges into what is already there rather than replacing it, so
re-importing your own export is a no-op. Because the excerpt travels with
the offsets, an import into a future version whose text has shifted
re-anchors each highlight by searching for its excerpt; anything whose text
is gone is reported as skipped rather than dropped silently.
