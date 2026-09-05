# Skins do `/gen`

Seis peles para a **mesma tela**. Nada de funcionalidade nova: continuam os dois seletores
no topo, inverter, sortear par, as cinco lentes em coluna, a folha de busca e o botão
*Mais ideias* fixo embaixo — igual ao `gen/index.html` de hoje.

Abra [`index.html`](./index.html) no celular para ver as seis.

> **A skin 04 (Editorial) já está aplicada no [`gen/index.html`](../index.html).** As outras cinco continuam aqui como alternativas — trocar é trocar o `<style>`.

| | Skin | Ideia visual | Fontes |
|---|---|---|---|
| 01 | [Sobreimpressão](./01-riso.html) | risografia de duas tintas, retícula de pontos, papel granulado, sombra dura | Archivo Black · Archivo |
| 02 | [Blocos](./02-bauhaus.html) | geometria primária, contorno preto grosso, sombra sólida deslocada | Outfit |
| 03 | [Traço](./03-traco.html) | índigo com linha fina dourada e motivos celestes vetoriais | Syne · DM Sans |
| 04 | [Editorial](./04-editorial.html) | grid suíço, tipo enorme, fio de cabelo, um acento só | Anton · Work Sans |
| 05 | [Solar](./05-solar.html) | ilustração 2D de crepúsculo, degradês chapados, formas orgânicas | Sora · Manrope |
| 06 | [Recorte](./06-recorte.html) | colagem de papel cortado, cor cheia, cantos irregulares | Fraunces · Karla |

## Como está montado

```
gen/skins/
├── index.html          menu das seis skins
├── 01-riso.html … 06-recorte.html   markup igual + um <style> por skin
└── data/
    ├── shell.css       só esqueleto: posição, fluxo, área de toque (sem cor, sem fonte)
    └── app.js          o /gen de sempre: seleção, inverter, sortear, cinco lentes, folha
```

O baralho e o motor de frases vêm de `../layouts/data/` (`deck.js`, `img.js`, `engine.js`) —
os mesmos dados e a mesma lógica do `gen/index.html`.

Cada skin é um arquivo com **o mesmo HTML** e um `<style>` diferente. As classes que uma
skin pinta são sempre estas:

`header .kicker h1 .sub .rule` · `.pair .slot .slot-label .card-btn (.glyph .ph .name .suit)`
`.arrow` · `.tools .tool` · `.empty` · `.results .pairline` ·
`.lens (.lens-head .lens-n .lens-name .lens-gloss .seeds .seed .dot .txt .kw)` ·
`.footnote` · `.dock .gen` · `.scrim .sheet .grab .sheet-head .sheet-title .sheet-x .search .list .grp .row`

A variável `--ac` chega em cada `.lens` com a cor daquela lente (as cinco cores vêm do
`engine.js`), então a skin pode usá-la em borda, sombra, número ou marcador.

## Como adotar uma delas no `/gen`

Duas opções:

1. **Trocar o CSS**: copie o `<style>` da skin escolhida para dentro do `gen/index.html`,
   ajustando os nomes de classe que diferem (`.seed .txt` continua igual; o `/gen` usa
   `.lens-n` como círculo, por exemplo). O JS não muda.
2. **Trocar o arquivo**: adote a estrutura daqui — `shell.css` + `app.js` + um `<style>` —
   e o `gen/index.html` passa a ser só a skin escolhida. Fica mais fácil trocar de estilo depois.

## Detalhes que valem manter em qualquer skin

- Alvo de toque mínimo de 48 px e `env(safe-area-inset-*)` em cima e embaixo — já estão no `shell.css`.
- `prefers-reduced-motion` desliga todas as animações.
- Cada skin assume **um mundo visual só** (não tem modo claro/escuro alternativo): a
  `<meta name="theme-color">` acompanha o fundo para a barra do Android combinar.
- As fontes vêm do Google Fonts por `<link>`; sem rede, cada skin cai numa pilha de fallback
  declarada na própria `--display`/`--body`.
