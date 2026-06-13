"""Same-suit position-label normalizer (§9): differing cards get named labels
<word>_of_swords_position; self-pairings keep swords_position_1/_2.
Usage: python3 pairing/_relabel_samesuit.py <file_to_swords.txt> ..."""
import sys, re
WORD = {"Ace":"ace","2":"two","3":"three","4":"four","5":"five","6":"six",
        "7":"seven","8":"eight","9":"nine","10":"ten","Page":"page",
        "Knight":"knight","Queen":"queen","King":"king"}
for path in sys.argv[1:]:
    blocks = open(path, encoding="utf-8").read().split("\n---\n")
    out = []
    for b in blocks:
        m = re.search(r"card_pair:\s*(.+?) of Swords,\s*(.+?) of Swords", b)
        if m:
            r1, r2 = m.group(1).strip(), m.group(2).strip()
            if r1 != r2:
                b = b.replace("  swords_position_1:", f"  {WORD[r1]}_of_swords_position:")
                b = b.replace("  swords_position_2:", f"  {WORD[r2]}_of_swords_position:")
        out.append(b)
    open(path, "w", encoding="utf-8").write("\n---\n".join(out))
    print(f"relabeled {path}")
