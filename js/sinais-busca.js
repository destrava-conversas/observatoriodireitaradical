/* Lista de Sinais: filtro por dossiê e busca (Enter ou botão Buscar), com retorno claro.
   - ignora acentos e palavras vazias; aceita singular e plural; alguns sinônimos;
   - ordena por relevância (título > destaque > texto);
   - se nenhum Sinal tem todas as palavras, mostra os que têm parte delas, avisando. */
(function () {
  var C = window.SB || {}, LB = C.LB || {}, SL = C.SL || {};
  var k = 'all', st = document.getElementById('st'), q = document.getElementById('q'), form = document.getElementById('sform'),
    clr = document.getElementById('sclr'), ul = document.getElementById('sl'), none = document.getElementById('none'),
    lis = [].slice.call(document.querySelectorAll('#sl li')), chips = [].slice.call(document.querySelectorAll('.chip'));
  var ORIG = lis.slice(), TERMS = [], ACTIVE = '';
  var STOP = 'a o e as os de da do das dos em no na nos nas um uma uns umas por para com sem que se ao aos sobre entre ou mas foi ser ele ela eles elas seu sua quem como qual quando onde ja mais menos muito tem ter ha nao sim isso esse essa este esta fez faz fazem fizeram diz disse dizem foram sao era tinha'.split(' ');
  var SYN = { golpe: ['golpista', 'golpistas', 'trama'], golpista: ['golpe', 'trama'], fuga: ['saida', 'deixou', 'deixa', 'exilio', 'exilado', 'fugiu'], exilio: ['exilado', 'exilados', 'fuga'], exilado: ['exilio', 'fuga'],
    eleicao: ['eleitoral', 'eleicoes', 'urnas', 'votacao'], urna: ['urnas', 'eleicao', 'voto'], anistia: ['indulto', 'perdao'], perdao: ['anistia', 'indulto'], stf: ['supremo', 'moraes'], supremo: ['stf'],
    imprensa: ['jornalista', 'jornalistas', 'midia'], violencia: ['forca', 'agressao', 'ataque'], eua: ['trump', 'estados unidos'], trump: ['eua'], assedio: ['demissao', 'demitir'] };
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function stem(w) { return w.length > 4 ? w.replace(/(oes|aes|ais|eis|res|ses|s)$/, function (m) { return m === 's' ? '' : m.slice(0, -2); }) : w; }
  lis.forEach(function (li) {
    var t = li.querySelector('.t'), d = li.querySelector('.d');
    li._t = norm(t ? t.textContent : ''); li._d = norm(d ? d.textContent : ''); li._i = li.getAttribute('data-i') || '';
    li._T = t ? t.innerHTML : ''; li._D = d ? d.innerHTML : '';
  });
  function terms(v) {
    return norm(v).split(/[^a-z0-9]+/).filter(function (w) { return w && STOP.indexOf(w) < 0; }).map(function (w) {
      var alts = [stem(w)].concat((SYN[w] || SYN[stem(w)] || []).map(stem));
      return { w: w, alts: alts.filter(function (a, i) { return a && alts.indexOf(a) === i; }) };
    });
  }
  function score(li, ts) {
    var s = 0, hit = 0;
    ts.forEach(function (x) {
      var best = 0;
      x.alts.forEach(function (a, i) { var w = i === 0 ? 1 : 0.6;
        if (li._t.indexOf(a) >= 0) best = Math.max(best, 3 * w); else if (li._d.indexOf(a) >= 0) best = Math.max(best, 2 * w); else if (li._i.indexOf(a) >= 0) best = Math.max(best, 1 * w); });
      if (best) { hit++; s += best; }
    });
    return { s: s, hit: hit };
  }
  function mark(html, ts) {
    if (!ts.length) return html;
    var alts = []; ts.forEach(function (x) { alts = alts.concat(x.alts); });
    return html.replace(/(^|>)([^<]+)/g, function (m, a, txt) {
      var n = norm(txt), out = '', pos = 0, rg = [];
      alts.forEach(function (al) { var i = 0; while ((i = n.indexOf(al, i)) >= 0) { var e = i + al.length; while (e < n.length && /[a-z0-9]/.test(n[e])) e++; var b = i; while (b > 0 && /[a-z0-9]/.test(n[b - 1])) b--; rg.push([b, e]); i = e; } });
      if (!rg.length || n.length !== txt.length) return m;
      rg.sort(function (x, y) { return x[0] - y[0]; }); var mm = [];
      rg.forEach(function (r) { if (mm.length && r[0] <= mm[mm.length - 1][1]) mm[mm.length - 1][1] = Math.max(mm[mm.length - 1][1], r[1]); else mm.push(r.slice()); });
      mm.forEach(function (r) { out += txt.slice(pos, r[0]) + '<mark>' + txt.slice(r[0], r[1]) + '</mark>'; pos = r[1]; });
      return a + out + txt.slice(pos);
    });
  }
  function inDossie(li) { return li.getAttribute('data-f').split(' ').indexOf(k) >= 0; }
  function paint(list, ts) {
    lis.forEach(function (li) { var t = li.querySelector('.t'), d = li.querySelector('.d'); if (t) t.innerHTML = mark(li._T, ts); if (d) d.innerHTML = mark(li._D, ts); });
    list.forEach(function (li) { ul.appendChild(li); });
  }
  function run(scroll) {
    var v = ACTIVE, ts = terms(v), n = 0, partial = false, num = /^\s*\d{1,3}\s*$/.test(v) ? ('000' + v.trim()).slice(-3) : null, list;
    if (!v) {
      list = ORIG.slice(); ORIG.forEach(function (li) { var ok = inDossie(li); li.hidden = !ok; if (ok) n++; });
      paint(list, []);
    } else if (num) {
      list = ORIG.slice(); ORIG.forEach(function (li) { var ok = inDossie(li) && li._i.indexOf(num + ' ') === 0; li.hidden = !ok; if (ok) n++; }); paint(list, []);
    } else {
      var sc = ORIG.map(function (li) { var r = score(li, ts); r.li = li; return r; }).filter(function (r) { return inDossie(r.li); });
      var full = sc.filter(function (r) { return ts.length && r.hit === ts.length; });
      if (!full.length) { full = sc.filter(function (r) { return r.hit > 0; }); partial = full.length > 0; }
      full.sort(function (a, b) { return b.hit - a.hit || b.s - a.s; });
      var keep = full.map(function (r) { return r.li; });
      ORIG.forEach(function (li) { li.hidden = keep.indexOf(li) < 0; });
      n = keep.length; list = keep.concat(ORIG.filter(function (li) { return keep.indexOf(li) < 0; }));
      paint(list, ts);
    }
    none.hidden = n > 0;
    none.innerHTML = (!v && SL[k]) ? 'Ainda não há Sinais neste dossiê. Por enquanto, as evidências dele são ações de governo: <a href="../dossies/' + SL[k] + '/">abrir o dossiê</a>.'
      : 'Nenhum Sinal encontrado para “' + v.replace(/</g, '&lt;') + '”' + (LB[k] ? LB[k] : '') + '. Tente outra palavra, ou veja <a href="#" data-all>todos os Sinais</a>.';
    var lbl = (n === 1 ? '1 Sinal' : n + ' Sinais') + (LB[k] || '');
    st.innerHTML = v ? (partial ? 'Nenhum Sinal tem todas as palavras. Mostrando ' + lbl + ' com parte delas para “' + v.replace(/</g, '&lt;') + '”.' : lbl + ' para “' + v.replace(/</g, '&lt;') + '”.') : lbl + '.';
    clr.hidden = !v;
    st.classList.remove('flash'); void st.offsetWidth; st.classList.add('flash');
    if (scroll) { var first = lis.filter(function (li) { return !li.hidden; })[0] || none; (st || first).scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }
    pop();
  }
  function pop() {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var v = lis.filter(function (li) { return !li.hidden; }), i = 0;
    v.forEach(function (li) { li.classList.remove('pop'); }); void document.body.offsetWidth;
    v.slice(0, 10).forEach(function (li) { li.style.setProperty('--d', (i++ * 35) + 'ms'); li.classList.add('pop'); });
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); ACTIVE = q.value.trim(); run(true); q.blur(); });
  q.addEventListener('input', function () { if (!q.value.trim() && ACTIVE) { ACTIVE = ''; run(false); } });
  clr.addEventListener('click', function () { q.value = ''; ACTIVE = ''; run(false); q.focus(); });
  none.addEventListener('click', function (e) { if (e.target.closest('[data-all]')) { e.preventDefault(); q.value = ''; ACTIVE = ''; k = 'all'; chips.forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-k') === 'all' ? 'true' : 'false'); }); run(false); } });
  chips.forEach(function (c) { c.addEventListener('click', function () { k = c.getAttribute('data-k'); chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); }); run(false); try { history.replaceState(null, '', k === 'all' ? location.pathname : '#' + k); } catch (e) {} }); });
  run(false);
  var h = location.hash.slice(1); if (h) { var c = chips.filter(function (x) { return x.getAttribute('data-k') === h; })[0]; if (c) c.click(); }
})();
