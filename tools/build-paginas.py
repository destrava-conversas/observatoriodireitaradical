#!/usr/bin/env python3
"""Gera as páginas internas do painel a partir do topo e do rodapé da home (index.html)
e dos trechos em tools/paginas/:
  quem-sao-eles/index.html  <- _quem.html
  metodo/index.html         <- _obs.html + critérios das pautas + _info.html
  data/flavio.js            <- itens de "E o próprio Flávio?" (para a busca da home)
Uso: python3 tools/build-paginas.py   (rodar depois de mudar index.html ou um trecho)"""
import re, json, html, os
from datetime import date

ROOT = os.path.join(os.path.dirname(__file__), '..')
P = lambda *a: os.path.join(ROOT, *a)
BASE = 'https://destrava-conversas.com.br/observatoriodireitaradical/'
BRAND = 'Painel Observatório da Direita Radical e Extrema'
home = open(P('index.html'), encoding='utf-8').read()
frag = lambda n: open(P('tools', 'paginas', n), encoding='utf-8').read()

ver = re.search(r'js/app\.js\?v=([\w]+)', home).group(1)
fonts = re.search(r'<link href="https://fonts\.googleapis\.com[^>]*>', home).group(0)
topbar = re.search(r'<div class="topbar" id="topo">.*?\n</div>\n', home, re.S).group(0)
pxbar = frag('_pxbar.html')
footer = re.search(r'  <footer class="foot-note">.*?</footer>\n', home, re.S).group(0)
svgdefs = frag('_svgdefs.html')
upd = re.search(r'<p class="upd">([^<]*)</p>', home).group(1)

HOME_ANCHORS = {'#topo': '../', '#busca': '../?busca'}
PAGES = {'quem-sao-eles/': 'quem', 'metodo/': 'metodo', 'se-te-disserem/': 'respostas'}

def fix_top(t, page):
    def href(m):
        h = m.group(1)
        if h.startswith(('http', 'mailto:', '../')): return m.group(0)
        if h in HOME_ANCHORS: n = HOME_ANCHORS[h]
        elif h.startswith('#'): n = '../' + h
        else: n = '../' + h
        if h in ('#parcas',): n = '../quem-sao-eles/'
        cur = ' aria-current="page"' if PAGES.get(h.split('#')[0]) == page else ''
        return 'href="%s"%s' % (n, cur)
    t = re.sub(r'href="([^"]*)"', href, t)
    t = t.replace(' data-top aria-label="%s, voltar ao início"' % BRAND, ' aria-label="%s, ir para o início"' % BRAND)
    # o totop volta ao topo desta página
    t = t.replace('<a class="totop" id="totop" href="../"', '<a class="totop" id="totop" href="#topo"')
    # o botão de busca vira link para a busca da home
    t = re.sub(r'<button type="button" class="part-btn busca-btn" id="busca-btn"([^>]*)>(.*?)</button>',
               lambda m: '<a class="part-btn busca-btn" href="../?busca"' + re.sub(r' aria-controls="[^"]*"', '', m.group(1)) + '>' + m.group(2) + '</a>', t, flags=re.S)
    # itens que só fazem sentido com uma pauta escolhida
    t = re.sub(r'\n\s*<a href="[^"]*" class="nav-pick">[^<]*</a>', '', t)
    return t

def page(slug, key, title, desc, h1, lead, body, extra_top=''):
    url = BASE + slug
    doc = f'''<!doctype html>
<html lang="pt-BR" data-page="{key}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<link rel="icon" href="../favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="../apple-touch-icon.png">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="{BRAND}">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:image" content="{BASE}og-observatorio.jpg">
<meta property="og:image:alt" content="Olho verde sobre fundo azul-marinho e o nome: {BRAND}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="{url}">
<link rel="canonical" href="{url}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{BASE}og-observatorio.jpg">
{fonts}
<link rel="stylesheet" href="../css/painel.css?v={ver}">
</head>
<body>
{extra_top}{fix_top(topbar, key)}<main class="wrap pg">
  <header class="pg-h">
    <p class="pg-crumb"><a href="../">← Painel completo</a></p>
    <h1>{h1}</h1>
    <p class="pg-lead">{lead}</p>
    <p class="upd">{upd}</p>
  </header>
{body}{svgdefs}{footer}</main>

<script src="../data/base.js?v={ver}"></script>
<script src="../data/acoes.js?v={ver}"></script>
<script src="../data/fontes.js?v={ver}"></script>
<script src="../data/sinais.js?v={ver}"></script>
<script src="../data/rede.js?v={ver}"></script>
<script src="../data/flavio.js?v={ver}"></script>
<script src="../js/app.js?v={ver}"></script>
<script data-goatcounter="https://destrava-conversas.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
</body>
</html>
'''
    os.makedirs(P(slug), exist_ok=True)
    open(P(slug, 'index.html'), 'w', encoding='utf-8').write(doc)

# Quem são eles: o bloco já aberto, sem o cabeçalho recolhível
quem = frag('_quem.html')
quem = quem.replace('class="legend parcas closed"', 'class="legend parcas"', 1)
quem = quem.replace('<div class="legend-head">', '<div class="legend-head" hidden>', 1)
quem = quem.replace('aria-expanded="false" aria-controls="parcas-body">Abrir</button>', 'aria-expanded="true" aria-controls="parcas-body">Fechar</button>', 1)
quem = quem.replace('<div class="lg-panel" id="parcas-panel" hidden>', '<div class="lg-panel" id="parcas-panel">', 1)
page('quem-sao-eles/', 'quem', 'Quem são eles · ' + BRAND,
     'Bolsonaro, Trump, Milei, Bukele, Kast, Orbán e o PiS: o que é extrema direita, os pilares, o que têm em comum, como se conectam e o que o próprio Flávio fez nos mandatos. Tudo com fonte.',
     'Quem são eles',
     'Bolsonaro, Trump, Milei, Bukele, Kast, Orbán e o PiS: o que é extrema direita, o que eles têm em comum, como se conectam e o que o próprio Flávio fez nos mandatos.',
     quem, pxbar)

# Método e critérios
crit = '''  <section id="criterios" aria-labelledby="h-crit">
    <h2 id="h-crit">Critérios das pautas</h2>
    <p>O que entra em cada pauta. Uma ação só é classificada como “piorou” ou “melhorou” quando se encaixa no critério e tem fonte.</p>
    <dl class="crit-list" id="crit-list"></dl>
  </section>
'''
page('metodo/', 'metodo', 'Método e critérios · ' + BRAND,
     'Por que um observatório, como olhamos, os critérios de cada pauta, as regras de fonte, a privacidade e a lista completa de fontes do painel.',
     'Método e critérios',
     'Por que o painel existe, como cada ação é escolhida e classificada, quais fontes valem e como tratamos seus dados.',
     frag('_obs.html') + crit + frag('_info.html'))

# Se te disserem…
page('se-te-disserem/', 'respostas', 'Se te disserem… · ' + BRAND,
     'Frases que circulam sobre a extrema direita e a resposta curta, com dado e fonte, para usar numa conversa.',
     'Se te disserem…',
     'Frases que circulam e a resposta curta, com dado e fonte, para usar numa conversa. O assunto é o fato, não a pessoa.',
     frag('_respostas.html'))

# itens de Flávio para a busca da home
fl = re.search(r'<section class="px-sec" id="px-flavio">(.*?)</section>', quem, re.S).group(1)
items, cur = [], ''
for m in re.finditer(r'<h4 class="px-h4">(.*?)</h4>|<li>(.*?)</li>\n', fl, re.S):
    if m.group(1): cur = html.unescape(re.sub('<[^>]+>', '', m.group(1)))
    else: items.append({'p': cur, 'h': m.group(2)})
open(P('data', 'flavio.js'), 'w', encoding='utf-8').write('window.PD = window.PD || {};\n/* gerado por tools/build-paginas.py a partir de "E o próprio Flávio?" */\nPD.FLAVIO = ' + json.dumps(items, ensure_ascii=False, indent=0) + ';\n')
print('quem-sao-eles/, metodo/ e data/flavio.js gerados;', len(items), 'itens de Flávio')
