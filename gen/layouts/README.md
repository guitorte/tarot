# Layouts para o `/gen` — brainstorm com protótipos

Seis direções de interface para o **Gerador de Frases**, todas rodando de verdade,
com as 78 cartas e as cinco lentes que já existem. Abra
[`index.html`](./index.html) no celular e navegue entre elas.

O alvo é sempre o mesmo: **Android, tela em retrato, uma mão, polegar**.

---

## 1. O que o `/gen` faz hoje

Três tarefas em uma tela: **escolher duas cartas**, **ver o par**, **ler 5 lentes × 3 frases = 15 frases**.

O que já está bom: o motor de frases (pareamento temático por eixo), o texto enxuto,
a folha inferior de busca, `viewport-fit=cover`, alvos de 48 px, `prefers-reduced-motion`.

O que atrapalha no polegar:

| Ponto | Efeito no uso com uma mão |
|---|---|
| Os dois seletores ficam **no topo** (~15% da altura) | é onde o polegar menos chega; obriga a mudar a pegada a cada troca de carta |
| O seletor é **lista de texto** | você tem 78 fotos em `/img` e nenhuma aparece |
| As 15 frases descem numa **coluna única** | ~3 telas de rolagem para ver a leitura inteira; a 5ª lente quase nunca é lida |
| Só o botão **Mais ideias** está fixo embaixo | o resto da interação sobe pro topo |
| Sem **modo escuro** | neumorfismo claro (#e9edf3) com sombras suaves é o pior caso sob sol e à noite |
| Nada de **compartilhar / guardar** | a frase boa morre na tela |

---

## 2. Princípios que os seis protótipos seguem

- **Zona do polegar.** Tudo que se toca vive nos ~35% de baixo. O topo é área de leitura.
- **Alvo mínimo de 48 px** e espaçamento de 8 px entre alvos.
- **`100dvh`, não `100vh`** — a barra do Chrome no Android some e volta; `dvh` acompanha.
- **`env(safe-area-inset-*)`** em cima e embaixo (gesture bar do Android).
- **`scroll-snap`** onde a navegação é por gesto, com `overscroll-behavior: contain` nas folhas.
- **Imagem certa pro tamanho certo** — ver §5.
- **Sem `:hover`** para nada essencial; estado visível vem de `outline`/cor.
- **`navigator.vibrate(8)`** no toque que confirma escolha (opcional, mas o Android dá).

---

## 3. As seis direções

### 01 · Rail de cartas — [`01-rail.html`](./01-rail.html)
O baralho inteiro numa faixa horizontal fixa na base. Rola com o polegar, toca, pronto:
**nenhum modal**. Abas de naipe acima da faixa levam o rolo direto pro grupo.
As duas cartas escolhidas ficam grandes no topo; a leitura fica entre as duas coisas.

- **Ganha:** menos passos que qualquer outro (2 toques até a leitura); o baralho fica sempre visível.
- **Custa:** a faixa come ~150 px fixos; achar uma carta específica no meio de 78 exige rolagem lateral longa (as abas mitigam).
- **Bom se:** você troca cartas o tempo todo e explora mais do que busca.

### 02 · Carrossel de lentes — [`02-carrossel.html`](./02-carrossel.html)
Aplicação de tela fixa: **zero rolagem vertical**. Cartas no topo, e cada lente é uma tela
que você desliza pro lado, com pontinhos de progresso. Fundo escuro, foto grande.

- **Ganha:** uma ideia por vez, sem parede de texto; a foto ganha protagonismo; dá pra ler no ônibus com uma mão só.
- **Custa:** comparar duas lentes exige ir e voltar; cinco telas escondem o "todo".
- **Bom se:** a leitura é contemplativa, uma lente de cada vez.

### 03 · Feed de frases — [`03-feed.html`](./03-feed.html)
Gramática de Reels/TikTok: cada uma das **15 faíscas ocupa a tela inteira**, com as duas
cartas desfocadas ao fundo, e você desliza pra cima. Botões de compartilhar/copiar/remixar
na coluna direita, na altura do polegar.

- **Ganha:** é o único formato em que a frase vira **print compartilhável** sem esforço; gesto conhecido por todo mundo.
- **Custa:** perde-se a visão de conjunto; 15 telas é muito se você só quer bater o olho.
- **Bom se:** o valor está em achar *uma* frase que destrave, não em ler as 15.

### 04 · Dock de polegar — [`04-dock.html`](./04-dock.html)
A menor mudança possível a partir do `/gen` atual: a leitura continua em coluna, mas
**todo controle desce** para uma barra fixa (carta A · ⇄ · 🎲 · carta B · Mais ideias),
o seletor vira **grade de fotos** e uma barra fina com o par gruda no topo enquanto você rola.

- **Ganha:** conserva o que já funciona; risco baixíssimo; a leitura corrida continua possível.
- **Custa:** a barra consome ~130 px; ainda são ~2,5 telas de rolagem.
- **Bom se:** você quer melhorar o `/gen` sem reescrevê-lo. **É a base que eu recomendo.**

### 05 · Mesa — [`05-mesa.html`](./05-mesa.html)
Metáfora de tiragem: duas cartas **de costas** sobre o feltro. Toque vira (sorteia),
segure para escolher, e a leitura **sobe numa folha** que você puxa até a altura que quiser
(escondida → espiando → cheia).

- **Ganha:** clima de ritual; alvos gigantes; o gesto de virar carta é satisfatório e óbvio.
- **Custa:** mais passos até o texto; a folha cheia cobre as cartas.
- **Bom se:** o app quer parecer uma tiragem, não uma ferramenta.

### 06 · Chips e palavras — [`06-chips.html`](./06-chips.html)
O oposto do 03: **denso**. As lentes viram chips (uma aberta por vez, sem rolagem longa) e
as palavras-chave das duas cartas viram botões — toque em `paz` e as frases daquela lente
passam a girar em torno de `paz`.

- **Ganha:** tudo numa tela; a **âncora por palavra** é uma função nova de verdade — deixa você puxar o fio que interessa em vez de aceitar o sorteio.
- **Custa:** menos contemplativo, mais "ferramenta"; nuvem de palavras cresce bastante em cartas ricas.
- **Bom se:** você usa o gerador para destravar um tema específico.

---

## 4. Comparação rápida

| | 01 Rail | 02 Carrossel | 03 Feed | 04 Dock | 05 Mesa | 06 Chips |
|---|---|---|---|---|---|---|
| Toques até a 1ª frase | 2 | 4 | 1 (sortear) | 3 | 1 | 3 |
| Rolagem vertical | média | **nenhuma** | por gesto | longa | curta | **nenhuma** |
| Usa as fotos | muito | muito | muito | pouco | muito | pouco |
| Vê as 5 lentes juntas | sim | não | não | sim | sim | não |
| Pronto pra compartilhar | não | não | **sim** | não | não | não |
| Esforço de implementação | médio | médio | médio | **baixo** | alto | médio |

**Combinação que eu faria:** `04` como tela padrão + `03` como um botão "modo faísca"
(mesma leitura, outra apresentação) + a **âncora por palavra** do `06` como recurso extra.
Os três compartilham o mesmo motor — trocar de modo é trocar o renderizador, não a lógica.

---

## 5. Peso das imagens (isso é decisivo no celular)

Os arquivos de `/img` são grandes: **~800 kB cada, 68 MB o baralho**. Uma grade com as 78
cartas em tamanho original é inviável em rede móvel. Por isso os protótipos usam dois
tamanhos, gerados por [`img/make-thumbs.py`](../../img/make-thumbs.py):

| Pasta | Largura | Peso médio | Onde usar |
|---|---|---|---|
| `img/mini/` | 110 px | ~6 kB | grades, rail, fundos, chips (deck inteiro ≈ 650 kB) |
| `img/thumbs/` | 260 px | ~28 kB | a carta em foco |
| `img/` (original) | ~1100 px | ~800 kB | só se um dia existir "ver carta em tela cheia" |

Além disso: `loading="lazy"` + `decoding="async"` em toda imagem de lista,
`aspect-ratio` fixo pra não haver salto de layout, e `object-fit: cover`
(as cartas variam entre 1086×1810 e 1112×1920).

Próximo passo natural: gerar `.webp` (~40% menor) e servir com `<picture>`.

---

## 6. Ideias que não viraram protótipo

- **Guardar e favoritar** — `localStorage` com as últimas tiragens; deslizar a frase pro lado para salvar.
- **Frase como imagem** — `canvas` compondo a frase sobre as duas cartas, para o botão compartilhar entregar PNG (hoje o 03 compartilha só texto).
- **Agitar para sortear** — `devicemotion` (no Android não precisa de permissão explícita como no iOS).
- **Instalar como app** — `manifest.json` + ícone; a tela cheia sem barra do navegador melhora todos os seis layouts.
- **Modo escuro automático** — `prefers-color-scheme`; hoje só os protótipos 02/03/05 são escuros por decisão estética.
- **Tiragem de três cartas** — origem → meio → destino; o motor já aceitaria pares encadeados (A→B, B→C).
- **Carta única** — só as palavras-chave de uma carta, sem par, para consulta rápida.
- **Busca invertida** — digitar "medo" e ver quais cartas carregam a palavra.
- **Cor por naipe** — o `engine.js` já expõe `SUIT_COLOR`; dá pra tingir a leitura conforme o par.

---

## 7. Estrutura dos arquivos

```
gen/layouts/
├── index.html          galeria dos seis protótipos
├── README.md           este texto
├── 01-rail.html … 06-chips.html
└── data/
    ├── deck.js         as 78 cartas (extraídas de gen/index.html)
    ├── img.js          nome da carta -> arquivo em /img
    ├── engine.js       lentes, pareamento temático, sorteio (a lógica do /gen isolada)
    ├── picker.js       folha inferior com grade de fotos + busca (compartilhada)
    └── base.css        tokens e peças comuns
```

Tudo é HTML/CSS/JS puro, sem build e sem rede: dá para abrir por `file://`, por GitHub Pages
ou por `python3 -m http.server` na raiz do repositório.

> Nada aqui substitui o `gen/index.html` — os protótipos vivem ao lado dele.
