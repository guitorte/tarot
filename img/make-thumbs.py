#!/usr/bin/env python3
"""Gera as duas versões leves das cartas usadas nas interfaces.

    python3 img/make-thumbs.py

    img/mini/    110 px de largura  (~6 kB)  -> grades, rails, fundos
    img/thumbs/  260 px de largura  (~28 kB) -> carta em foco

Os originais em img/*.jpg têm ~800 kB cada (68 MB o baralho) e não devem ser
servidos direto para o celular. Requer Pillow: pip install pillow
"""
import os
from PIL import Image

SRC = os.path.dirname(os.path.abspath(__file__))
SIZES = [(260, "thumbs", 70), (110, "mini", 68)]

def main():
    files = sorted(f for f in os.listdir(SRC) if f.lower().endswith(".jpg"))
    for width, folder, quality in SIZES:
        os.makedirs(os.path.join(SRC, folder), exist_ok=True)
    for name in files:
        im = Image.open(os.path.join(SRC, name)).convert("RGB")
        for width, folder, quality in SIZES:
            height = round(im.height * width / im.width)
            out = os.path.join(SRC, folder, name)
            im.resize((width, height), Image.LANCZOS).save(
                out, quality=quality, optimize=True, progressive=True)
    print(f"{len(files)} cartas -> " + ", ".join(f"img/{f}/" for _, f, _ in SIZES))

if __name__ == "__main__":
    main()
