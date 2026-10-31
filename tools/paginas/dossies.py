# Dossiês: dossies/<slug>/index.html a partir de data/dossies.js, data/sinais.js e data/acoes.js.
# Executado por tools/build-paginas.py (usa page, P, frag, BRAND, re, json, html de lá).

def _jsarr(path, start):
    txt = open(P(*path.split('/')), encoding='utf-8').read()
    i = txt.index(start) + len(start)
    out = []
    for ln in txt[i:].split('\n'):
        s = ln.strip()
        if s.startswith('];'):
            break
        if s.startswith('{'):
            out.append(json.loads(s.rstrip(',')))
    return out

_base = open(P('data', 'base.js'), encoding='utf-8').read()
DOS = json.loads(re.search(r'PD\.DOSSIES = (\[.*?\n\]);', open(P('data', 'dossies.js'), encoding='utf-8').read(), re.S).group(1))
NEWS = _jsarr('data/sinais.js', 'PD.NEWS = [')
ACOES = _jsarr('data/acoes.js', 'PD.A = [')
CN = {c['k']: c for c in json.loads(re.search(r'PD\.COUNTRIES = (\[.*?\]);', _base, re.S).group(1))}
GN = {}
for _k in ('GROUPS', 'THEMES'):
    for g in json.loads(re.search(r'PD\.' + _k + r' = (\[.*?\]);', _base, re.S).group(1)):
        GN[g['k']] = g['n']
MES = ['jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.']
E = html.escape
ORDER = ['bb', 'us', 'hu', 'pl', 'sv', 'ar', 'cl']
RSP = frag('_respostas.html')


def _nd(n):
    if n.get('quando'):
        return n['quando']
    y, m, d = n['d'].split('-')
    if m == '01' and d == '01':
        return y
    return '%d %s %s' % (int(d), MES[int(m) - 1], y)


def provas(k):
    sn = sorted([n for n in NEWS if k in (n.get('dossie') or [])], key=lambda n: n['d'], reverse=True)
    seen, ac = set(), []
    for a in ACOES:
        if k not in (a.get('dossie') or []):
            continue
        key = (a['c'], a['t'])
        if key in seen:
            continue
        seen.add(key)
        ac.append(a)
    return sn, ac


def acao_id(s):
    h = 5381
    for ch in s:
        h = ((h * 33) ^ ord(ch)) & 0xFFFFFFFF
    n, out = h, ''
    while True:
        n, r = divmod(n, 36)
        out = '0123456789abcdefghijklmnopqrstuvwxyz'[r] + out
        if not n:
            break
    return out


def olho_img(d, cls=''):
    return '<img%s src="../../img/olhos/olho-%s.jpg" alt="" width="1080" height="300">' % (cls, d['olho'])


for D in DOS:
    k = D['k']
    sn, ac = provas(k)
    b = []
    b.append('  <figure class="dz-olho">' + olho_img(D) + '</figure>\n')
    b.append('  <section class="dz-q" aria-labelledby="h-q"><p class="dz-k" id="h-q">A pergunta</p>'
             '<p class="dz-qt">' + E(D['q']) + '</p><p class="dz-qd">Adaptado de <i>Como as democracias morrem</i>, de Steven Levitsky e Daniel Ziblatt.</p></section>\n')
    amp = ('<p class="dz-amp"><b>Ampliação declarada:</b> ' + E(D['amp']) + '</p>') if D.get('amp') else ''
    pts = ''.join('<li>' + (('<b>' + E(x.split(': ', 1)[0]) + ':</b> ' + E(x.split(': ', 1)[1])) if (': ' in x and len(x.split(': ', 1)[0]) <= 26) else E(x)) + '</li>' for x in D.get('sp', []))
    pass  # síntese removida a pedido do Ces (31/10)
    b.append('  <section class="dz-pv" aria-labelledby="h-pv"><h2 id="h-pv">As evidências <span class="dz-n">%d</span></h2>\n' % (len(sn) + len(ac)))
    if sn:
        b.append('    <h3 class="dz-h3">Sinais <span>%d</span></h3>\n    <ol class="dz-list">\n' % len(sn))
        for n in sn:
            dst = ('<span class="dz-d">' + E(n['destaque']) + '</span>') if n.get('destaque') else ''
            b.append('      <li class="dz-i dz-sinal"><a href="../../sinais/%s/"><span class="dz-m">Sinal %s · %s</span><b>%s</b>%s</a></li>\n'
                     % (n['n'], n['n'], E(_nd(n)), E(n['t']), dst))
        b.append('    </ol>\n')
    if ac:
        b.append('    <h3 class="dz-h3">Ações de governo <span>%d</span></h3>\n' % len(ac))
        for c in ORDER:
            lst = [a for a in ac if a['c'] == c]
            if not lst:
                continue
            cc = CN.get(c, {'n': c, 'p': ''})
            b.append('    <h4 class="dz-gov">%s · %s <span>%d</span></h4>\n    <ol class="dz-list">\n' % (E(cc['p']), E(cc['n']), len(lst)))
            for a in sorted(lst, key=lambda a: str(a.get('y') or ''), reverse=True):
                links = '; '.join('<a href="%s" target="_blank" rel="noopener noreferrer">%s</a>' % (E(u), E(nm)) for nm, u in (a.get('links') or [])[:3])
                ol = ('<p class="dz-ol"><b>Outro lado:</b> ' + E(a['note']) + '</p>') if a.get('note') else ''
                fl = ('<p class="dz-f">Fontes: ' + links + '</p>') if links else ''
                go = '<a class="dz-go" href="../../?pauta=%s&amp;gov=%s&amp;acao=%s#acoes">Ver na pauta %s →</a>' % (a['g'], a['c'], acao_id(a['t']), E(GN.get(a['g'], a['g'])))
                b.append('      <li class="dz-i dz-acao"><span class="dz-m">%s · pauta %s</span><p>%s</p>%s%s%s</li>\n'
                         % (E(str(a.get('y') or '')), E(GN.get(a['g'], a['g'])), E(a['t']), ol, fl, go))
            b.append('    </ol>\n')
    b.append('  </section>\n')
    if False and D.get('rsp'):
        lis = []
        for rid in D['rsp']:
            m = re.search(r'      <li class="rsp-i" id="' + re.escape(rid) + r'">.*?\n      </li>', RSP, re.S)
            if m:
                lis.append(m.group(0).replace('href="img/', 'href="../../se-te-disserem/img/'))
        b.append('  <section class="dz-rsp" aria-labelledby="h-rsp"><h2 id="h-rsp">Se te disserem…</h2>\n    <ol class="rsp">\n' + '\n'.join(lis) + '\n    </ol>\n  </section>\n')
    b.append('  <section class="dz-rem" aria-labelledby="h-rem"><h2 id="h-rem">Remédios</h2><p class="dz-wip">Em pesquisa: soluções com base acadêmica e práticas de países que reverteram a erosão democrática ou estão no topo dos índices, com o medidor de cada governo observado.</p></section>\n')
    nav = ''.join('<a href="__DZ__%s/">%s<span>%s</span></a>' % (d['slug'], olho_img(d), E(d['n'])) for d in DOS if d['k'] != k)
    b.append('  <nav class="dz-nav" aria-label="Outros dossiês"><p class="dz-k">Outros dossiês</p><div>' + nav + '</div></nav>\n')
    slug = 'dossies/' + D['slug'] + '/'
    page(slug, 'dossie', D['n'] + ' · Dossiê · ' + BRAND, D['q'] + ' ' + D['qd'], 'Dossiê: ' + E(D['n']),
         '',
         ''.join(b))
    f = P(slug, 'index.html')
    doc = open(f, encoding='utf-8').read()
    doc = re.sub(r'(href|src)="\.\./(?!\.\./)', r'\1="../../', doc)
    stick = ('<div class="dz-stick" id="dz-stick" aria-hidden="true" hidden><span>Dossiê:</span> <b>%s</b></div>\n'
             '<script>(function(){var h=document.querySelector(".pg-h h1"),s=document.getElementById("dz-stick");if(!h||!s||!("IntersectionObserver" in window))return;'
             'new IntersectionObserver(function(e){s.hidden=e[0].isIntersecting;},{rootMargin:"-70px 0px 0px 0px"}).observe(h);})();</script>\n') % E(D['n'])
    doc = doc.replace('</main>', stick + '</main>', 1)
    doc = doc.replace('href="__DZ__', 'href="../')  # links entre dossiês
    open(f, 'w', encoding='utf-8').write(doc)
print('dossiês gerados:', ', '.join(x['slug'] for x in DOS))

# índice: dossies/index.html
cards = []
for D in DOS:
    sn, ac = provas(D['k'])
    cards.append('<li><a href="%s/"><img src="../img/olhos/olho-%s.jpg" alt="" width="1080" height="300"><span class="dt"><b>%s</b><em>%d evidências <span aria-hidden="true">→</span></em></span></a></li>'
                 % (D['slug'], D['olho'], E(D['n']), len(sn) + len(ac)))
body = ('  <ul class="dzc">' + ''.join(cards) + '</ul>\n'
        '  <section class="dz-s"><h2>Como os dossiês funcionam</h2><p>Cada dossiê responde a uma pergunta do livro de Steven Levitsky e Daniel Ziblatt. Uma evidência entra quando responde a essa pergunta, com fonte e outro lado: pode ser um <a href="../sinais/">Sinal</a> (um fato, uma fala, uma decisão) ou uma ação de governo já registrada nas pautas. Notícia que não responde a nenhuma pergunta não entra.</p></section>\n')
_ = None
page('dossies/', 'dossies', 'Dossiês · ' + BRAND, 'Os quatro sinais de alerta de Como as democracias morrem e as evidências de cada um, com fonte e outro lado.',
     'Dossiês', 'Os quatro sinais de alerta de Levitsky e Ziblatt, em <i>Como as democracias morrem</i>, e as evidências que o painel reuniu para cada um.', body)

f = P('dossies', 'index.html'); doc = open(f, encoding='utf-8').read()
doc = doc.replace('    <p class="pg-crumb"><a href="../">← Painel completo</a></p>\n', '')
open(f, 'w', encoding='utf-8').write(doc)
