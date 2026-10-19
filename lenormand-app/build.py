#!/usr/bin/env python3
"""Turn the annak-lenormand export into the app's data file.

Reads the zipped Markdown export (one folder per card, four pages each:
keywords, interpretation, comparisons, combinations) and writes data.js,
which index.html loads as a plain script so the app also works from file://.

    python3 build.py [path/to/annak-lenormand.zip]

Standard library only. The zip is read in place, never extracted.
"""

import difflib
import html
import json
import re
import sys
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEFAULT_ZIP = HERE.parent / "lenormand" / "annak-lenormand.zip"
OUT = HERE / "data.js"

# Deck order used everywhere in the app: the 36 cards by number, each
# alternate version right after its main card, the Wild Card last.
ORDER = [
    "rider", "clover", "ship", "house", "tree", "clouds", "snake", "coffin",
    "bouquet", "scythe", "whip", "birds", "child", "fox", "bear", "stars",
    "stork", "dog", "tower", "garden", "mountain", "crossroad", "mice",
    "heart", "ring", "book", "letter", "man", "man2", "woman", "woman2",
    "lily", "lily2", "sun", "moon", "key", "fish", "anchor", "cross",
    "wildcard",
]
EXTRAS = {"man2", "woman2", "lily2", "wildcard"}

# Names as they appear in bold inside the comparison tables, mapped to cards.
NAME_TO_ID = {
    "crossroads": "crossroad", "wild card": "wildcard", "men": "man",
    "women": "woman", "man (a)": "man", "man (b)": "man2", "man (a&b)": "man",
    "woman (a)": "woman", "woman (b)": "woman2", "woman (a&b)": "woman",
    "sensual lily": "lily", "(sensual) lily": "lily", "virtuous lily": "lily2",
    "(virtuous) lily": "lily2",
}

PAGE_URL = re.compile(
    r"https?://www\.annak-tarot\.at/lenormand/(\d\d)_([a-z0-9]+)(?:-(annak|comp|komb))?_e\.html(#\w+)?"
)
SECTION_OF = {None: "keywords", "annak": "meaning", "comp": "compare", "komb": "pairs"}


# --------------------------------------------------------------------------
# Markdown, the small subset the export uses

def fix_mojibake(s):
    """Repair the few UTF-8 sequences that were decoded as Latin-1."""
    def repair(m):
        try:
            return m.group(0).encode("latin-1").decode("utf-8")
        except UnicodeError:
            return m.group(0)
    s = re.sub(r"[\xc2-\xf4][\x80-\xbf]+", repair, s)
    return s.replace("/´", "/")  # stray acute accent inside one URL


def strip_front_matter(s):
    if s.startswith("---"):
        s = s.split("---", 2)[2]
    return s.strip("\n")


def strip_images(s):
    s = re.sub(r"\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)", "", s)
    s = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", s)
    # "[\*)](...)" footnote markers that point to explanatory pages
    s = re.sub(r"\[\\\*\)\]\([^)]*\)", "", s)
    return s


def link(text, url):
    m = PAGE_URL.match(url)
    text = re.sub(r"^(?:&gt;)+\s*", "", text.strip())
    if m and m.group(2) in ORDER:
        card, section = m.group(2), SECTION_OF[m.group(3)]
        return f'<a href="#{card}.{section}" data-card="{card}" data-section="{section}">{text}</a>'
    return f'<a href="{url}" target="_blank" rel="noopener">{text}</a>'


def inline(s):
    s = strip_images(s)
    escapes = []

    def keep(m):
        escapes.append(m.group(1))
        return f"\x00{len(escapes) - 1}\x00"

    s = re.sub(r"\\([\\`*_{}\[\]()#+\-.!|>~])", keep, s)
    s = html.escape(s, quote=False)
    s = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", lambda m: link(m.group(1), m.group(2)), s)
    s = re.sub(r"\*\*\*([^*]+?)\*\*\*", r"<strong><em>\1</em></strong>", s)
    s = re.sub(r"\*\*([^*]*?)\*([^*]+?)\*\*\*", r"<strong>\1<em>\2</em></strong>", s)
    s = re.sub(r"\*\*\*([^*]+?)\*\*([^*]+?)\*(?!\*)", r"<em><strong>\1</strong>\2</em>", s)
    s = re.sub(r"(?<!\*)\*(?![\s*])([^*]+?)(?<![\s*])\*(?!\*)", r"<em>\1</em>", s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"<strong>\s*</strong>|<em>\s*</em>", "", s)
    s = re.sub(r"\x00(\d+)\x00", lambda m: html.escape(escapes[int(m.group(1))]), s)
    s = re.sub(r"[ \t]+", " ", s)
    # Long runs like "powerful/dominant/influential" may wrap after a slash
    s = "".join(t if t.startswith("<") else re.sub(r"(?<=\w)/(?=\w)", "/<wbr>", t)
                for t in re.split(r"(<[^>]+>)", s))
    return s.strip()


def split_blocks(s):
    return [b for b in re.split(r"\n[ \t]*\n", s) if b.strip()]


def join_lines(lines, paragraphs):
    """Join hard-wrapped lines; with paragraphs=True, also guess where a
    single newline was meant as a paragraph break."""
    out = [[]]
    for line in (l.strip() for l in lines):
        if not line:
            continue
        prev = out[-1][-1] if out[-1] else ""
        if (paragraphs and prev and re.search(r"[.!?:\"')]$", prev)
                and re.match(r"[A-Z*\"(]", line) and len(prev) > 40):
            out.append([])
        out[-1].append(line)
    return [" ".join(p) for p in out if p]


def render(md, paragraphs=True):
    """Blocks of Markdown to HTML: tables become lists, a lone bold line a
    heading, a leading "**Label:**" a heading over its paragraph."""
    parts = []
    for block in split_blocks(md):
        block = strip_images(block)
        lines = [l for l in block.split("\n") if l.strip()]
        if not lines:
            continue
        if all(l.lstrip().startswith("|") for l in lines):
            items = []
            for row in lines:
                cells = [c.strip() for c in row.strip().strip("|").split("|")]
                cells = [c for c in cells if c and not re.fullmatch(r":?-{3,}:?", c)]
                if cells:
                    items.append(f"<li>{inline(' '.join(cells))}</li>")
            if items:
                # A line break between items keeps their texts apart in
                # textContent, which highlight excerpts are cut from.
                parts.append('<ul class="cmp">' + "\n".join(items) + "</ul>")
            continue
        text = "\n".join(lines).strip()
        solo = re.fullmatch(r"\*\*([^*]+?)\*\*", text)
        if solo:
            parts.append(f"<h3>{inline(solo.group(1)).rstrip(':')}</h3>")
            continue
        label = re.match(r"\*\*([^*]+?):\*\*\s*", text)
        if label:
            parts.append(f"<h3>{inline(label.group(1))}</h3>")
            text = text[label.end():]
            lines = text.split("\n")
        for p in join_lines(lines, paragraphs):
            p = inline(p)
            # "*News / to bring something:*" opens a paragraph as its theme
            p = re.sub(r"^<em>((?:[^<]|<wbr>){2,120}?):?</em>\s*:?\s*(?=\S)", r'<b class="lead">\1:</b> ', p)
            if p:
                parts.append(f"<p>{p}</p>")
    return "\n".join(parts)


SENTENCE_END = re.compile(r"(?<=[.!?])\s+(?=[\"(]?[A-Z])")
ABBREVIATION = re.compile(r"\b(?:e\.g|i\.e|etc|vs|cf|incl)\.$", re.I)


def senses(fragment):
    """Split rendered paragraphs into one list item per sentence: each
    sentence of a combination is a reading of its own."""
    items = []
    for para in re.findall(r"<p>(.*?)</p>", fragment, re.S):
        buf, depth = "", 0
        for tok in re.split(r"(<[^>]+>)", para):
            if tok.startswith("<"):
                if tok != "<wbr>":
                    depth += -1 if tok.startswith("</") else 1
                buf += tok
                continue
            last = 0
            for m in SENTENCE_END.finditer(tok):
                head = buf + tok[last:m.start()]
                if depth or ABBREVIATION.search(head):
                    continue
                items.append(head.strip())
                buf, last = "", m.end()
            buf += tok[last:]
        if buf.strip():
            items.append(buf.strip())
    if not items:
        return ""
    return '<ul class="senses">' + "\n".join(f"<li>{i}</li>" for i in items) + "</ul>"


def plain(html_text):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", html_text))).strip()


# --------------------------------------------------------------------------
# Pages

def parse_title(md):
    m = re.search(r'title: "lenormand \| (.+?) \| ', md, re.I)
    return m.group(1)


def parse_source(md):
    return re.search(r"source: (\S+)", md).group(1)


def card_names(title):
    """'man (b)' -> ('Man', 'b'); '(virtuous) lily' -> ('Lily', 'virtuous')."""
    m = re.fullmatch(r"\((\w+)\) (.+)", title)
    if m:
        return m.group(2).title(), m.group(1)
    m = re.fullmatch(r"(.+) \((\w)\)", title)
    if m:
        return m.group(1).title(), m.group(2)
    return title.title(), ""


KW_LABELS = [
    ("Nouns & phrases", r"\*\*\*Nouns / phrases:\*\*\*"),
    ("Activities", r"\*\*\*Activities:\*\*\*"),
    ("Attributes", r"\*\*\*Attributes:\*\*\*"),
    ("As a person", r"\*\*As a person:\*\*"),
    ("As advice", r"\*\*As advice:\*\*"),
    ("Time factor", r"\*\*Time factor.*?:\*\*"),
    ("See also", r"\*\*See also:?\*\*"),
]


def parse_keywords(md):
    body = strip_front_matter(md)
    marks = []
    for name, pattern in KW_LABELS:
        m = re.search(pattern, body)
        if m:
            marks.append((m.start(), m.end(), name))
    marks.sort()
    head = body[: marks[0][0]]
    note = ""
    m = re.search(r"\*+Note:\*+", head)
    if m:
        note = head[m.start():]
        note = note.split("**Keywords**")[0]
        note = inline(" ".join(note.split()))
    fields = []
    for i, (_, end, name) in enumerate(marks):
        stop = marks[i + 1][0] if i + 1 < len(marks) else len(body)
        text = " ".join(body[end:stop].split())
        if name == "As advice":
            text = re.sub(r"^As advice:\s*", "", text)
        if name == "See also":
            text = re.sub(r"^:\s*", "", text)
        fields.append([name, inline(text)])
    return note, fields


def parse_meaning(md):
    body = strip_front_matter(md)
    body = re.sub(r"\*\*click it to flip it!\*\*", "", body)
    if "**INTERPRETATION**" in body:
        body = body.split("**INTERPRETATION**", 1)[1]
    tagline = ""
    blocks = split_blocks(body)
    if blocks and re.fullmatch(r"\s*\*[^*]+\*\s*", blocks[0]):
        tagline = plain(inline(" ".join(blocks[0].split())))
        body = body.split(blocks[0], 1)[1]
    body = re.sub(r"\*\*About the meaning:\*\*", "", body)
    return tagline, render(body)


def parse_compare(md):
    body = strip_front_matter(md)
    if "**COMPARISONS: OPPOSITES & SIMILARITIES**" in body:
        body = body.split("**COMPARISONS: OPPOSITES & SIMILARITIES**", 1)[1]
    blocks = [b for b in split_blocks(body)
              if not b.strip().startswith("To clarify and deepen my understanding")]
    out = render("\n\n".join(blocks))

    def card_link(m):
        name = plain(m.group(1)).strip().rstrip(":").strip()
        key = re.sub(r"^the ", "", name.lower())
        cid = NAME_TO_ID.get(key) or (key if key in ORDER else None)
        if cid is None and key.endswith("s") and key[:-1] in ORDER:
            cid = key[:-1]
        if cid is None:
            return m.group(0)
        return (f'<strong><a href="#{cid}.compare" data-card="{cid}" '
                f'data-section="compare">{m.group(1)}</a></strong>')

    out = re.sub(r"(?<=<li>)<strong>(.+?)</strong>", card_link, out)
    # "Rider: ..." becomes a label over its text, so the colon goes
    out = re.sub(r"(<li><strong>.*?)(?::\s*)?((?:</a>)?</strong>)\s*:?\s*", r"\1\2 ", out)
    return out


SIBLING = {"man": "man2", "man2": "man", "woman": "woman2", "woman2": "woman",
           "lily": "lily2", "lily2": "lily"}
THUMB = re.compile(r"thumbnails/\d\d-([a-z0-9]+)-extra\.jpg")


def parse_pairs(md, own_id):
    body = strip_front_matter(md)
    note = ""
    m = re.search(r"\*\*Please note\*\*(.+?)is an explanation of what works for me\.", body, re.S)
    if m:
        note = " ".join(m.group(1).split())
        note = re.sub(r"\s*Lastly, if you want to learn more.*$", "", note)
        note = inline("Please note " + note)
    thumbs = list(THUMB.finditer(body))
    assert len(thumbs) % 2 == 0, own_id
    heads = []
    for first, second in zip(thumbs[::2], thumbs[1::2]):
        start = [s.start() for s in re.finditer(r"(?:^|\n)\*\*", body[: first.start()])][-1]
        end = body.index("**", second.end()) + 2
        # The two thumbnails name the pair. Three headers show a wrong
        # picture (Man (a) on Man (b)'s page, House instead of Stork), so
        # drop the own card's sibling and any card already paired above.
        ids = {first.group(1), second.group(1)}
        if own_id not in ids:
            ids.discard(SIBLING.get(own_id))
        candidates = ids - {own_id} or {own_id}
        if len(candidates) > 1:
            candidates -= {p for _, _, p in heads}
        partner = sorted(candidates)[0]
        heads.append((start, end, partner))
    pairs = {}
    for i, (_, end, partner) in enumerate(heads):
        stop = heads[i + 1][0] if i + 1 < len(heads) else len(body)
        pairs[partner] = senses(render(body[end:stop], paragraphs=False))
    return note, pairs


# --------------------------------------------------------------------------

def main():
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_ZIP
    pages = {}
    with zipfile.ZipFile(src) as z:
        for name in z.namelist():
            m = re.search(r"pages/lenormand__(\d\d)_([a-z0-9]+)_e/lenormand__\d\d_[a-z0-9]+(?:-(annak|comp|komb))?_e\.md$", name)
            if m:
                text = fix_mojibake(z.read(name).decode("utf-8"))
                pages[(m.group(2), SECTION_OF[m.group(3)])] = (m.group(1), text)

    cards, pairs, pairs_note = [], {}, ""
    for cid in ORDER:
        num, kw_md = pages[(cid, "keywords")]
        name, version = card_names(parse_title(kw_md))
        note, keywords = parse_keywords(kw_md)
        tagline, meaning = parse_meaning(pages[(cid, "meaning")][1])
        if not tagline:  # the Rider's page has none: open with its first keywords
            tagline = plain(keywords[0][1]).split(". ")[0]
        time = next((plain(t) for n, t in keywords if n == "Time factor"), "")
        note_pairs, card_pairs = parse_pairs(pages[(cid, "pairs")][1], cid)
        pairs_note = pairs_note or note_pairs
        missing = set(ORDER) - set(card_pairs)
        if missing:
            print(f"warning: {cid} has no combination with {sorted(missing)}", file=sys.stderr)
        pairs[cid] = [card_pairs.get(other, "") for other in ORDER]
        cards.append({
            "id": cid,
            "num": "*" if cid == "wildcard" else str(int(num)),
            "name": name,
            "version": version,
            "extra": cid in EXTRAS,
            "tagline": tagline,
            "time": time,
            "note": note,
            "keywords": keywords,
            "meaning": meaning,
            "compare": parse_compare(pages[(cid, "compare")][1]),
            "sources": {s: parse_source(pages[(cid, s)][1])
                        for s in ("keywords", "meaning", "compare", "pairs")},
        })

    # Each pair is written up twice, once on either card's page. Mostly the
    # two texts match; flag the pairs where they genuinely differ.
    differs = []
    for i, a in enumerate(ORDER):
        for j in range(i + 1, len(ORDER)):
            x, y = plain(pairs[a][j]), plain(pairs[ORDER[j]][i])
            if difflib.SequenceMatcher(None, x, y, autojunk=False).ratio() < 0.9:
                differs.append(f"{a}~{ORDER[j]}")

    data = {"order": ORDER, "cards": cards, "pairs": pairs,
            "pairsNote": pairs_note, "differs": differs}
    OUT.write_text(
        "// Generated by build.py from annak-lenormand.zip. Do not edit by hand.\n"
        "window.LENORMAND = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
    total = sum(1 for p in pairs.values() for t in p if t)
    print(f"{len(cards)} cards, {total} combination texts, "
          f"{len(differs)} pairs worded differently on the two pages -> {OUT.name} "
          f"({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
