"""
Anna.K Lenormand Scraper
Scrapes keywords, interpretations, and combinations for all 36 Lenormand cards
from annak-tarot.at and writes them to lenormand.md.

Usage:
    pip install playwright beautifulsoup4 lxml
    playwright install chromium
    python3 scraper.py
"""

import asyncio
import random
import re
import sys

from bs4 import BeautifulSoup
from playwright.async_api import async_playwright

# =============================================================================
# SECTION 1: Constants
# =============================================================================

BASE = "https://www.annak-tarot.at/lenormand"
OUTPUT_FILE = "lenormand.md"

DELAY_MIN = 1.2
DELAY_MAX = 2.5

# (number, url-slug, display name)
# Card 30 has two variants on the site: lily (sensual) and lily2 (virtuous)
CARDS = [
    ("01", "rider",     "The Rider"),
    ("02", "clover",    "The Clover"),
    ("03", "ship",      "The Ship"),
    ("04", "house",     "The House"),
    ("05", "tree",      "The Tree"),
    ("06", "clouds",    "The Clouds"),
    ("07", "snake",     "The Snake"),
    ("08", "coffin",    "The Coffin"),
    ("09", "bouquet",   "The Bouquet"),
    ("10", "scythe",    "The Scythe"),
    ("11", "whip",      "The Whip"),
    ("12", "birds",     "The Birds"),
    ("13", "child",     "The Child"),
    ("14", "fox",       "The Fox"),
    ("15", "bear",      "The Bear"),
    ("16", "stars",     "The Stars"),
    ("17", "stork",     "The Stork"),
    ("18", "dog",       "The Dog"),
    ("19", "tower",     "The Tower"),
    ("20", "garden",    "The Garden"),
    ("21", "mountain",  "The Mountain"),
    ("22", "crossroad", "The Crossroads"),
    ("23", "mice",      "The Mice"),
    ("24", "heart",     "The Heart"),
    ("25", "ring",      "The Ring"),
    ("26", "book",      "The Book"),
    ("27", "letter",    "The Letter"),
    ("28", "man",       "The Man"),
    ("29", "woman",     "The Woman"),
    ("30", "lily",      "The Lily (Sensual)"),
    ("30", "lily2",     "The Lily (Virtuous)"),
    ("31", "sun",       "The Sun"),
    ("32", "moon",      "The Moon"),
    ("33", "key",       "The Key"),
    ("34", "fish",      "The Fish"),
    ("35", "anchor",    "The Anchor"),
    ("36", "cross",     "The Cross"),
]

SKIP_TEXT = {
    "home", "back", "next", "previous", "lenormand", "tarot",
    "anna", "annak", "overview", "all cards", "deutsch", "english",
    "kontakt", "contact", "impressum", "imprint", "sitemap",
}


# =============================================================================
# SECTION 2: Browser / page helpers
# =============================================================================

async def fetch_page(page, url: str) -> str | None:
    """Fetch a URL with Playwright and return the rendered HTML, or None on failure."""
    try:
        response = await page.goto(
            url,
            wait_until="domcontentloaded",
            timeout=30_000,
        )
        if response is None or response.status in (404, 403, 410):
            print(f"  [SKIP] {url} → HTTP {response.status if response else 'no response'}")
            return None
        # Give dynamic content a moment to settle
        try:
            await page.wait_for_load_state("networkidle", timeout=8_000)
        except Exception:
            pass  # networkidle timeout is acceptable
        return await page.content()
    except Exception as exc:
        print(f"  [ERROR] {url} → {exc}")
        return None


def _make_soup(html: str) -> BeautifulSoup:
    soup = BeautifulSoup(html, "lxml")
    for tag in soup(["script", "style", "nav", "header", "footer", "noscript", "aside"]):
        tag.decompose()
    return soup


def _get_main_content(soup: BeautifulSoup) -> BeautifulSoup | None:
    """Return the element most likely containing the page's main content."""
    for selector in ["main", "article", "#content", ".content", "#main", ".main"]:
        el = soup.select_one(selector)
        if el:
            return el
    # Fallback: div with the most <p> children
    best, best_count = None, 0
    for div in soup.find_all("div"):
        count = len(div.find_all("p", recursive=False))
        if count > best_count:
            best, best_count = div, count
    return best or soup.body or soup


# =============================================================================
# SECTION 3: Per-page parsers
# =============================================================================

def parse_keywords(html: str) -> list[str]:
    """Extract keywords from the keywords page."""
    soup = _make_soup(html)
    content = _get_main_content(soup)

    # Strategy 1: explicit ul/ol lists
    lists = content.find_all(["ul", "ol"])
    if lists:
        items = []
        for lst in lists:
            for li in lst.find_all("li"):
                text = li.get_text(separator=" ", strip=True)
                if text and text.lower() not in SKIP_TEXT and len(text) < 120:
                    items.append(text)
        if items:
            return _dedupe(items)

    # Strategy 2: elements with keyword-ish class names
    for el in content.find_all(True):
        cls = " ".join(el.get("class", []))
        if any(k in cls.lower() for k in ("keyword", "key", "word", "tag")):
            text = el.get_text(separator="\n", strip=True)
            items = [l.strip() for l in text.splitlines() if l.strip() and l.strip().lower() not in SKIP_TEXT]
            if items:
                return _dedupe(items)

    # Strategy 3: any <li> tags in content
    li_items = []
    for li in content.find_all("li"):
        text = li.get_text(separator=" ", strip=True)
        if text and text.lower() not in SKIP_TEXT and len(text) < 120:
            li_items.append(text)
    if li_items:
        return _dedupe(li_items)

    # Strategy 4: split largest text block by commas / bullets / newlines
    all_text = content.get_text(separator="\n", strip=True)
    lines = [l.strip() for l in re.split(r"[,\n•·\-–]", all_text) if l.strip()]
    candidates = [l for l in lines if l.lower() not in SKIP_TEXT and 1 < len(l) < 80]
    if candidates:
        return _dedupe(candidates[:30])

    return ["[keywords not extracted]"]


def parse_interpretation(html: str) -> str:
    """Extract the full interpretation text from the interpretation page."""
    soup = _make_soup(html)
    content = _get_main_content(soup)

    # Collect all paragraph texts
    paragraphs = []
    for p in content.find_all("p"):
        text = p.get_text(separator=" ", strip=True)
        if text and len(text) > 30:
            paragraphs.append(text)

    if paragraphs:
        return "\n\n".join(paragraphs)

    # Fallback: full content text
    full = content.get_text(separator="\n", strip=True)
    lines = [l.strip() for l in full.splitlines() if len(l.strip()) > 30]
    if lines:
        return "\n\n".join(lines)

    return "[interpretation not extracted]"


def parse_combinations(html: str) -> list[dict]:
    """Extract combination entries from the combinations page.

    Returns a list of {"paired_card": str, "text": str} dicts.
    """
    soup = _make_soup(html)
    content = _get_main_content(soup)

    combos = []

    # Strategy 1: heading (h2/h3/h4) → following sibling text blocks
    headings = content.find_all(["h2", "h3", "h4"])
    if headings:
        for heading in headings:
            title = heading.get_text(separator=" ", strip=True)
            if not title or title.lower() in SKIP_TEXT or len(title) > 100:
                continue
            # Collect text from siblings until the next heading
            texts = []
            for sib in heading.find_next_siblings():
                if sib.name in ("h2", "h3", "h4"):
                    break
                t = sib.get_text(separator=" ", strip=True)
                if t and len(t) > 5:
                    texts.append(t)
            if texts:
                combos.append({"paired_card": title, "text": " ".join(texts)})

        if combos:
            return combos

    # Strategy 2: definition lists <dl><dt><dd>
    dls = content.find_all("dl")
    for dl in dls:
        for dt in dl.find_all("dt"):
            title = dt.get_text(strip=True)
            dd = dt.find_next_sibling("dd")
            text = dd.get_text(separator=" ", strip=True) if dd else ""
            if title and text:
                combos.append({"paired_card": title, "text": text})
    if combos:
        return combos

    # Strategy 3: table rows (two-column: card | meaning)
    for table in content.find_all("table"):
        for row in table.find_all("tr"):
            cells = row.find_all(["td", "th"])
            if len(cells) >= 2:
                title = cells[0].get_text(strip=True)
                text = " ".join(c.get_text(separator=" ", strip=True) for c in cells[1:])
                if title and text:
                    combos.append({"paired_card": title, "text": text})
    if combos:
        return combos

    # Strategy 4: paragraphs — treat each as a standalone entry
    paragraphs = []
    for p in content.find_all("p"):
        t = p.get_text(separator=" ", strip=True)
        if t and len(t) > 20:
            paragraphs.append(t)
    if paragraphs:
        return [{"paired_card": "Combinations", "text": "\n\n".join(paragraphs)}]

    # Final fallback
    all_text = content.get_text(separator="\n", strip=True)
    if all_text.strip():
        return [{"paired_card": "Combinations", "text": all_text.strip()}]

    return []


def _dedupe(items: list[str]) -> list[str]:
    seen = set()
    result = []
    for item in items:
        key = item.lower()
        if key not in seen:
            seen.add(key)
            result.append(item)
    return result


# =============================================================================
# SECTION 4: Markdown renderer
# =============================================================================

def render_card_md(num: str, name: str, keywords: list[str], interpretation: str, combos: list[dict]) -> str:
    lines = []
    lines.append(f"## Card {num}: {name}\n")

    # Keywords
    lines.append("### Keywords\n")
    for kw in keywords:
        lines.append(f"- {kw}")
    lines.append("")

    # Interpretation
    lines.append("### Interpretation\n")
    lines.append(interpretation)
    lines.append("")

    # Combinations
    if combos:
        lines.append("### Combinations\n")
        for combo in combos:
            paired = combo["paired_card"]
            text = combo["text"]
            # Only add a sub-heading if the paired card label is meaningful
            if paired and paired.lower() not in ("combinations", "all combinations"):
                lines.append(f"#### {paired}\n")
            lines.append(text)
            lines.append("")

    lines.append("---\n")
    return "\n".join(lines)


# =============================================================================
# SECTION 5: Main orchestrator
# =============================================================================

async def main():
    print("Anna.K Lenormand Scraper")
    print(f"Output: {OUTPUT_FILE}")
    print(f"Cards: {len(CARDS)} entries (including lily variant)\n")

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            locale="en-US",
            viewport={"width": 1280, "height": 800},
        )
        page = await context.new_page()

        md_sections = [
            "# Anna.K Lenormand — Complete Reference\n",
            (
                "_Content scraped from [annak-tarot.at](https://www.annak-tarot.at/lenormand/) "
                "— all rights and original text belong to Anna K. Schwarz._\n"
            ),
            "---\n",
        ]

        for num, slug, display_name in CARDS:
            print(f"[{num}] {display_name} ({slug})")

            kw_url   = f"{BASE}/{num}_{slug}_e.html"
            int_url  = f"{BASE}/{num}_{slug}-annak_e.html"
            comb_url = f"{BASE}/{num}_{slug}-komb_e.html"

            # --- Keywords ---
            sys.stdout.write("  keywords... ")
            sys.stdout.flush()
            kw_html = await fetch_page(page, kw_url)
            await asyncio.sleep(random.uniform(DELAY_MIN, DELAY_MAX))

            # --- Interpretation ---
            sys.stdout.write("interpretation... ")
            sys.stdout.flush()
            int_html = await fetch_page(page, int_url)
            await asyncio.sleep(random.uniform(DELAY_MIN, DELAY_MAX))

            # --- Combinations ---
            sys.stdout.write("combinations\n")
            sys.stdout.flush()
            comb_html = await fetch_page(page, comb_url)
            await asyncio.sleep(random.uniform(DELAY_MIN, DELAY_MAX))

            # Parse
            keywords       = parse_keywords(kw_html)       if kw_html   else ["[page not available]"]
            interpretation = parse_interpretation(int_html) if int_html  else "[page not available]"
            combos         = parse_combinations(comb_html)  if comb_html else []

            md_sections.append(render_card_md(num, display_name, keywords, interpretation, combos))

        await browser.close()

    # Write output
    output = "\n".join(md_sections)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(output)

    print(f"\nDone. Written {len(output):,} characters to {OUTPUT_FILE}")


# =============================================================================
# SECTION 6: Entry point
# =============================================================================

if __name__ == "__main__":
    asyncio.run(main())
