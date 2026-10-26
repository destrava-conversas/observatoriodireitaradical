(function(){
  var COUNTRIES = PD.COUNTRIES;
  var CONTROL = PD.CONTROL;
  var ALLC = COUNTRIES.concat([CONTROL]);
  var GROUPS = PD.GROUPS;
  var THEMES = PD.THEMES;
  var CRITERIA = PD.CRITERIA;
  var A = PD.A;
  function add(c,g,s,y,t,src,note){ A.push({c:c,g:g,s:s,y:y,t:t,src:src,note:note||'',disc:/^Discut[íi]vel/i.test(note||'')}); }
  /* HUNGRIA */
  /* POLÔNIA */
  /* EUA */
  /* ARGENTINA */
  /* BRASIL, BOLSONARO */
  /* EL SALVADOR */
  /* CHILE, KAST */
  /* ITÁLIA */
  /* TEMAS: MEIO AMBIENTE */
  /* TEMAS: INSTITUIÇÕES E IMPRENSA */
  /* TEMAS: SEGURANÇA PÚBLICA */
  /* TEMAS: SAÚDE E SAÚDE MENTAL */
  /* GRUPOS NOVOS: APOSENTADOS E TRABALHADORES */
  /* PAUTA: EDUCAÇÃO E CIÊNCIA */
  /* BRASIL, LULA 3 (CONTROLE) */
  /* RESULTADOS (não entram no placar) */
  var R = PD.R;
  function mark(c,g,frag,key){ A.forEach(function(i){ if(i.c===c && i.g===g && i.t.indexOf(frag)===0) i.x=key; }); }
  var SRC = PD.SRC;
  var SRC_CATS = PD.SRC_CATS;
  function cloneTo(c,gFrom,frag,gTo,key,over){
    var done=0;
    A.slice().forEach(function(i){
      if(i.c===c && i.g===gFrom && i.t.indexOf(frag)===0){
        var n={c:i.c,g:gTo,s:i.s,y:i.y,t:i.t,src:i.src,note:i.note};
        if(over){ for(var k in over) n[k]=over[k]; }
        i.x=key; n.x=key; A.push(n); done++;
      }
    });
    if(!done){ (window.__cloneMiss=window.__cloneMiss||[]).push(c+'/'+frag); }
  }
  var LK_A = [];
  var LK_R = [];
  function attachLinks(list, arr){
    var miss = [];
    list.forEach(function(e){
      var hit = arr.filter(function(i){ return i.c===e[0] && i.g===e[1] && i.t.indexOf(e[2])===0; });
      if(!hit.length) miss.push(e[2]);
      hit.forEach(function(i){ i.links = (i.links||[]).concat(e[3]); });
    });
    return miss;
  }
  /* pauta Educação e ciência: contexto e links */
  /* links diretos (out. 2026) */
  /* v153 pautas novas: Renda e custo de vida; Liberdade religiosa */
  /* pauta Crianças e adolescentes */
  /* pauta Cidades, transporte e moradia */
  /* Segurança: revisão out/2026 */
  /* Segurança: ampliação out/2026 */
  /* Abin paralela */
  /* revisão de fontes Brasil: lote 1 */
  window.__lkMiss = [];
  var QS = [];
  function attachQ(){
    var miss=[];
    QS.forEach(function(e){
      var n=0;
      A.concat(R).forEach(function(i){ if(i.c===e[0] && i.t.indexOf(e[1])===0){ i.q=e[2]; n++; } });
      if(!n) miss.push(e[1]);
    });
    return miss;
  }
  window.__qMiss = [];
  var VQ = [];
  window.__vMiss = [];
  var CONST_EV = PD.CONST_EV;
  var state = {c:'all', g:'all', picked:false};
  var PAUTA_ORDER = ['saude','aposentados','trabalhadores','renda','seguranca','educacao','criancas','pobres','cidades','religiao','ambiente','instituicoes','soberania','mulheres','lgbt','etnicas'];
  function byOrder(a,b){ return PAUTA_ORDER.indexOf(a.k)-PAUTA_ORDER.indexOf(b.k); }
  var PARA = {saude:'na saúde',aposentados:'para aposentados',trabalhadores:'para trabalhadores',renda:'na renda e no custo de vida',seguranca:'na segurança pública',educacao:'na educação e na ciência',criancas:'para crianças e adolescentes',pobres:'para pessoas pobres',cidades:'nas cidades, no transporte e na moradia',religiao:'na liberdade religiosa',ambiente:'no meio ambiente',instituicoes:'nas instituições e na imprensa',mulheres:'para mulheres',lgbt:'para pessoas LGBTQIA+',etnicas:'para minorias étnicas',soberania:'na soberania'};
  var GROUP_KEYS = GROUPS.map(function(x){ return x.k; });
  var THEME_KEYS = THEMES.map(function(x){ return x.k; });
  var $ = function(id){ return document.getElementById(id); };
  function cname(k){ for(var i=0;i<ALLC.length;i++) if(ALLC[i].k===k) return ALLC[i].n; return ''; }
  function gname(k){ var all=GROUPS.concat(THEMES); for(var i=0;i<all.length;i++) if(all[i].k===k) return all[i].n; return ''; }
  function pickRaw(c,g,arr){
    return arr.filter(function(i){ return (c==='all' ? (i.c!=='br' && i.c!=='tr' && i.c!=='in') : i.c===c) && (g==='all' || i.g===g); });
  }
  function pick(c,g,arr){
    var out = pickRaw(c,g,arr);
    if(g!=='all') return out;
    var seen = {}, res = [];
    out.forEach(function(i){
      if(!i.x){ res.push(i); return; }
      var k = i.c+'|'+i.x;
      if(seen[k]){ seen[k].gs.push(i.g); return; }
      var cp = {c:i.c,g:i.g,s:i.s,y:i.y,t:i.t,src:i.src,note:i.note,disc:i.disc,x:i.x,links:i.links,q:i.q,gs:[i.g]};
      seen[k] = cp; res.push(cp);
    });
    return res;
  }
  function nfmt(x){ return String(Math.round(x*10)/10).replace('.',','); }
  function plural(n, s1, s2){ return n + ' ' + (n===1 ? s1 : s2); }
  function listAnd(a){ return a.length<2 ? a.join('') : a.slice(0,-1).join(', ') + ' e ' + a[a.length-1]; }
  function renderSummary(t){
    var box = $('sel-sum'); if(!box) return;
    var allC = state.c==='all', allG = state.g==='all';
    var quem = allC ? 'os governos observados' : cname(state.c);
    var onde = allG ? 'somando todas as pautas' : 'na pauta ' + gname(state.g);
    var out = [];
    function cap(x){ return x.charAt(0).toUpperCase()+x.slice(1); }
    if(!t.total){
      out.push(cap(onde) + ', não há ações de ' + quem + ' registradas neste painel. Isso não quer dizer que não existam: só que não apareceram nas fontes consultadas.');
    } else {
      out.push(cap(onde) + ', ' + quem + (allC ? ' somam ' : ' soma ') + '<b>' + plural(t.contra,'medida que piorou','medidas que pioraram') + '</b> e <b>' + plural(t.pro,'que melhorou','que melhoraram') + '</b>.');
      if(t.contra && !t.pro) out.push('Nenhuma medida que melhorou foi registrada.');
      else if(t.pro && !t.contra) out.push('Nenhuma medida que piorou foi registrada.');
      else if(t.contra >= t.pro*1.5) out.push('São ' + nfmt(t.contra/t.pro) + ' medidas que pioraram para cada uma que melhorou.');
      else if(t.pro >= t.contra*1.5) out.push('As medidas que melhoraram superam as que pioraram.');
      else out.push('Os dois lados aparecem em quantidade parecida.');
      if(allC){
        var tops = COUNTRIES.map(function(c){ return {n:c.n, v:tally(c.k, state.g).contra}; }).filter(function(x){ return x.v>0; }).sort(function(a,b){ return b.v-a.v; });
        if(tops.length){ var mx = tops[0].v; var lead = tops.filter(function(x){ return x.v===mx; }).map(function(x){ return x.n; });
          out.push((lead.length>1 ? 'Os que mais somam ações contra são ' : 'Quem mais soma ações contra é ') + '<b>' + listAnd(lead) + '</b> (' + plural(mx,'ação','ações') + (lead.length>1 ? ' cada' : '') + ').'); }
      }
      if(allG){
        var gs = GROUPS.concat(THEMES).map(function(g){ return {n:g.n, v:tally(state.c, g.k).contra}; }).filter(function(x){ return x.v>0; }).sort(function(a,b){ return b.v-a.v; }).slice(0,2);
        if(gs.length) out.push('As pautas com mais ações contra são ' + listAnd(gs.map(function(x){ return '<b>' + x.n + '</b> (' + x.v + ')'; })) + '.');
      }
    }
    var br = tally('br', state.g);
    out.push('Para comparação, o governo Lula (2023 a 2025) tem ' + plural(br.contra,'ação contra','ações contra') + ' e ' + br.pro + ' a favor ' + (allG ? 'no total.' : 'nesta pauta.'));
    box.innerHTML = out.join(' ');
  }
  function shortAct(t){
    var x = t, cut = -1;
    function bal(t){ return (t.split('(').length) === (t.split(')').length); }
    for(var k = x.indexOf(';'); k >= 0; k = x.indexOf(';', k+1)){ if(k >= 30 && bal(x.slice(0,k))){ cut = k; break; } }
    if(cut < 0){ var re = /\.\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕ“"])/g, mm; while((mm = re.exec(x))){ var before = x.slice(0, mm.index).split(/\s/).pop(); if(mm.index >= 30 && bal(x.slice(0,mm.index)) && !/^[a-zç]{1,4}$/.test(before) && !/^\(?[A-Z]{1,3}$/.test(before)){ cut = mm.index; break; } } }
    if(cut > 0) x = x.slice(0, cut);
    x = x.replace(/[\s,.;:]+$/,'');
    if(x.length > 140){ x = x.slice(0, 140); x = x.slice(0, x.lastIndexOf(' ')).replace(/[\s,;:(]+$/,''); if(!bal(x)) x = x.replace(/\s*\([^)]*$/,''); x += '…'; }
    return x;
  }
  function yr(i){ var m = String(i.y||'').match(/\d{4}/g); return m ? +m[m.length-1] : 0; }
  function pickEx(items, n){
    items = items.slice().sort(function(a,b){ return yr(b)-yr(a); });
    var out = [], seen = {};
    items.forEach(function(i){ if(out.length<n && !seen[i.c]){ seen[i.c]=1; out.push(i); } });
    items.forEach(function(i){ if(out.length<n && out.indexOf(i)<0) out.push(i); });
    return out;
  }
  function renderExamples(){
    var box = $('sel-ex'); if(!box) return; box.innerHTML='';
    var items = pick(state.c, state.g, A);
    if(!items.length){ box.hidden = true; return; }
    box.hidden = false;
    var con = items.filter(function(i){ return i.s!=='pro'; }), pro = items.filter(function(i){ return i.s==='pro'; });
    function group(list, side, title, n){
      if(!list.length) return;
      var g = el('div','ex-g ex-'+side);
      g.appendChild(el('p','ex-h', title));
      var ul = el('ul','ex-l');
      pickEx(list, n).forEach(function(i){
        var li = el('li');
        var st = shortAct(i.t);
        li.appendChild(el('b','', [state.c==='all' ? cname(i.c) : '', i.y || ''].filter(Boolean).join(', ') || '—'));
        li.appendChild(document.createTextNode(' — ' + st + (/[….!?]$/.test(st) ? '' : '.')));
        ul.appendChild(li);
      });
      g.appendChild(ul); box.appendChild(g);
    }
    group(con, 'contra', con.length > 3 ? 'Algumas das que pioraram' : (con.length===1 ? 'A que piorou' : 'As que pioraram'), 3);
    group(pro, 'pro', pro.length > 2 ? 'Algumas das que melhoraram' : (pro.length===1 ? 'A que melhorou' : 'As que melhoraram'), 2);
    var a = el('a','ex-all','Ver todas as ' + items.length + ' ações, com fontes ↓'); a.href = '#acoes';
    box.appendChild(a);
  }
  function tally(c,g){
    var items = pick(c,g,A), p=0, k=0;
    items.forEach(function(i){ if(i.s==='pro') p++; else k++; });
    return {pro:p, contra:k, total:p+k};
  }
  function el(tag, cls, text){
    var e = document.createElement(tag);
    if(cls) e.className = cls;
    if(text!==undefined) e.textContent = text;
    return e;
  }
  var TRUST_G = PD.TRUST_G;
  var TRUST_SET = {}; TRUST_G.forEach(function(n){ TRUST_SET[n]=1; });
  function trust(n){ return TRUST_SET[n] ? 'g' : 'y'; }
  function dot(n){
    var t = trust(n), d = el('span','tl '+t,'');
    d.setAttribute('role','img');
    d.setAttribute('aria-label', t==='g' ? 'Fonte muito confiável' : 'Fonte confiável');
    d.title = t==='g' ? 'Muito confiável' : 'Confiável';
    return d;
  }
  function splitSrc(str){
    var out=[], depth=0, cur='';
    for(var i=0;i<str.length;i++){
      var ch=str.charAt(i);
      if(ch==='(') depth++;
      if(ch===')') depth--;
      if(ch===';' && depth===0){ out.push(cur); cur=''; } else cur+=ch;
    }
    out.push(cur);
    return out;
  }
  function baseName(x){
    x = x.replace(/\s*\([^)]*\)/g,'').replace(/,\s*via .*/,'').replace(/\s+via .*/,'');
    return x.trim();
  }
  function buildSources(){
    var use = {};
    function reg(name, c){
      if(!name) return;
      var u = use[name] || (use[name] = {n:0, c:{}});
      u.n++; u.c[cname(c)] = true;
    }
    A.concat(R, CONST_EV).forEach(function(it){
      splitSrc(it.src).forEach(function(part){ reg(baseName(part), it.c); });
    });
    var names = Object.keys(use);
    var box = $('src-body'); box.innerHTML='';
    var nG = names.filter(function(n){ return trust(n)==='g'; }).length;
    var sum = el('p','tl-sum','');
    var dg = el('span','tl g',''); sum.appendChild(dg); sum.appendChild(document.createTextNode(nG+' muito confiáveis'));
    var dy = el('span','tl y',''); sum.appendChild(dy); sum.appendChild(document.createTextNode((names.length-nG)+' confiáveis'));
    box.appendChild(sum);
    var total = 0;
    SRC_CATS.forEach(function(cat){
      var list = names.filter(function(n){ return SRC[n] && SRC[n].t===cat.k; }).sort(function(a,b){ return a.localeCompare(b,'pt'); });
      if(!list.length) return;
      total += list.length;
      var wrap = el('div','src-cat');
      wrap.appendChild(el('h3','',cat.n+' ('+list.length+')'));
      var ul = el('ul','src-list');
      list.forEach(function(n){
        var li = el('li','src-item');
        li.appendChild(dot(n));
        li.appendChild(el('b','',n));
        li.appendChild(el('span','tlchip', trust(n)==='g' ? 'Muito confiável' : 'Confiável'));
        li.appendChild(document.createElement('br'));
        li.appendChild(document.createTextNode(SRC[n].d));
        var u = use[n];
        var cs = Object.keys(u.c).join(', ');
        li.appendChild(el('span','use','Usada em '+u.n+(u.n===1?' item':' itens')+': '+cs));
        ul.appendChild(li);
      });
      wrap.appendChild(ul);
      box.appendChild(wrap);
    });
    var missing = names.filter(function(n){ return !SRC[n]; });
    if(missing.length){
      var wrap2 = el('div','src-cat');
      wrap2.appendChild(el('h3','','Outras fontes ('+missing.length+')'));
      var ul2 = el('ul','src-list');
      missing.sort().forEach(function(n){ var li=el('li','src-item'); li.appendChild(el('b','',n)); ul2.appendChild(li); });
      wrap2.appendChild(ul2);
      box.appendChild(wrap2);
      total += missing.length;
    }
    window.__srcTotal = total;
    window.__srcMissing = missing;
  }
  function initSelects(){
    var tp=$('top-pais'), tf=$('top-foco');
    function opt(v,t){ var o=document.createElement('option'); o.value=v; o.textContent=t; return o; }
    var ph1 = opt('','Filtrar por governo'); ph1.disabled = true; tp.appendChild(ph1);
    tp.appendChild(opt('all','Todos os governos'));
    COUNTRIES.forEach(function(c){ tp.appendChild(opt(c.k, c.n)); });
    var ph2 = opt('','Escolha a pauta'); ph2.disabled = true; tf.appendChild(ph2);
    tf.appendChild(opt('all','Todas as pautas'));
    GROUPS.concat(THEMES).sort(byOrder).forEach(function(x){ tf.appendChild(opt(x.k,x.n)); });
    var mq = window.matchMedia ? window.matchMedia('(max-width:760px)') : null;
    function topLabels(){
      var narrow = false;
      [].slice.call(tf.options).forEach(function(o){ if(o.value==='all') o.textContent = narrow ? 'Todas' : 'Todas as pautas'; });
      [].slice.call(tp.options).forEach(function(o){ if(o.value==='all') o.textContent = 'Todos os governos'; });
    }
    topLabels();
    if(mq){ if(mq.addEventListener) mq.addEventListener('change', topLabels); else if(mq.addListener) mq.addListener(topLabels); }
    function afterTop(){
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var t=$(state.picked ? 'resumo' : 'result'); if(t && t.scrollIntoView) t.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'start'});
      if(typeof setBlk==='function' && state.picked){ setBlk('acoes', true); setBlk('rank', true); setBlk('ctx', true); }
    }
    var pbs=$('pb-sel'); var pbGo=function(){ var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; $('result').scrollIntoView({behavior: reduce?'auto':'smooth', block:'start'}); setTimeout(function(){ tf.focus({preventScroll:true}); }, reduce?0:450); }; if($('pb-go')) $('pb-go').addEventListener('click', pbGo); if($('hero-pauta')) $('hero-pauta').addEventListener('click', function(e){ e.preventDefault(); pbGo(); }); if(pbs) pbs.addEventListener('click', function(){ var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; $('result').scrollIntoView({behavior: reduce?'auto':'smooth', block:'start'}); setTimeout(function(){ tf.focus({preventScroll:true}); }, reduce?0:450); });
    [].slice.call(document.querySelectorAll('.reset-pauta')).forEach(function(b){ b.addEventListener('click', function(){ state.c='all'; state.g='all'; state.picked=false; render(); afterTop(); tf.focus({preventScroll:true}); }); });
    tp.addEventListener('change', function(){ state.c=tp.value; state.picked=true; render(); afterTop(); });
    tf.addEventListener('change', function(){ state.g=tf.value; state.picked=true; render(); afterTop(); });
  }
  function syncSelects(){
    $('top-pais').value = state.picked ? state.c : '';
    $('top-foco').value = state.picked ? state.g : '';
    var filtered = state.picked;
    if($('top-clear')) $('top-clear').disabled = !filtered;
  }
  function searchUrl(name, it){
    if(it.q) return 'https://www.google.com/search?q=' + encodeURIComponent(it.q + ' ' + name);
    return 'https://www.google.com/search?q=' + encodeURIComponent('"'+name+'" '+it.t.split(' ').slice(0,9).join(' '));
  }
  function srcNode(it){
    var span = el('span','srcs','Fontes: ');
    var parts = splitSrc(it.src).map(function(p){ return p.trim(); }).filter(Boolean);
    var links = it.links || [];
    var used = {};
    parts.forEach(function(part, idx){
      if(idx>0) span.appendChild(document.createTextNode('; '));
      var bn = baseName(part), hit = null;
      links.forEach(function(l){ if(!hit && l[0].toLowerCase()===bn.toLowerCase() && !used[l[1]]) hit = l; });
      span.appendChild(dot(bn));
      if(hit){
        used[hit[1]] = 1;
        var a = el('a','',part);
        a.href = hit[1]; a.target = '_blank'; a.rel = 'noopener noreferrer';
        span.appendChild(a);
      } else {
        span.appendChild(document.createTextNode(part+' '));
        var b = el('a','srch','(buscar)');
        b.href = searchUrl(bn, it); b.target = '_blank'; b.rel = 'noopener noreferrer';
        b.title = (it.c==='br' || it.c==='bb') ? 'Abre uma busca no Google por esta fonte' : 'Abre uma busca no Google, em inglês, por esta fonte';
        span.appendChild(b);
      }
    });
    links.forEach(function(l){
      if(used[l[1]]) return;
      used[l[1]] = 1;
      span.appendChild(document.createTextNode('; '));
      span.appendChild(dot(baseName(l[0])));
      var x = el('a','',l[0]);
      x.href = l[1]; x.target = '_blank'; x.rel = 'noopener noreferrer';
      x.title = 'Fonte adicional que confirma o item';
      span.appendChild(x);
    });
    return span;
  }
  function pillA(e,t){ e.setAttribute('tabindex','0'); e.setAttribute('role','button'); e.title=t; e.classList.add('pill-go'); }
  function legendTag(c, labels){
    var who = cname(c);
    var rest = (labels||[]).filter(function(x){ return x; }).join(', ');
    return el('span','tag'+(c==='br'?' ctrl':''), who + (rest ? ' & ' + rest : ''));
  }
  function itemNode(i, showC, showG){
    var li = el('li','item');
    li.appendChild(el('p','',i.t));
    var m = el('div','meta');
    var lt=legendTag(i.c, (i.gs||[i.g]).map(gname)); lt.setAttribute('data-pc',i.c); pillA(lt,'Ver o resumo de '+gname(i.g)+(i.c==='br'?'':' · '+cname(i.c))); lt.setAttribute('data-pg',i.g); m.appendChild(lt);
    if(i.y) m.appendChild(el('span','',i.y));
    if(i.note) m.appendChild(el('span','tag note'+(i.disc?' disc':''),(i.disc?'* ':'')+i.note));
    li.appendChild(m);
    var ft = el('div','ifoot');
    ft.appendChild(srcNode(i));
    var acts = el('div','iacts'); ft.appendChild(acts);
    acts.appendChild(copyBtn(i));
    acts.appendChild(imgBtn('Imagem', function(){ return actionCanvas(i); }, function(){ return 'acao-'+i.c+'-'+i.g+'-'+slug(i.t)+'.png'; }, i.t));
    li.appendChild(ft);
    return li;
  }
  var BRAND_A='Observatório da ', BRAND_B='Direita Radical e Extrema', BRAND='Painel Observatório da Direita Radical e Extrema';
  function brandHead(g, x, y, maxW, px, font){
    var s1=Math.round(px*.62), s2=px;
    g.font='800 '+s2+'px '+font; while(g.measureText(BRAND_B).width>maxW && s2>18){ s2-=2; g.font='800 '+s2+'px '+font; s1=Math.round(s2*.62); }
    g.textBaseline='middle';
    g.font='700 '+s1+'px '+font; g.fillStyle='#FFFFFF'; g.fillText('Painel '+BRAND_A.trim(), x, y-s2*.48);
    g.font='800 '+s2+'px '+font; g.fillStyle='#A6F36A'; g.fillText(BRAND_B, x, y+s2*.36);
  }
  var BRANDF="'Montserrat','Bricolage Grotesque','Public Sans',Arial,sans-serif";
  /* topo e rodapé comuns das imagens de compartilhar */
  function eyeMark(g, cx, cy, w){
    var h=w/2, lw=Math.max(3, w*0.045);
    g.save(); g.strokeStyle='#A6F36A'; g.lineWidth=lw; g.beginPath(); g.ellipse(cx, cy, w/2-lw/2, h/2-lw/2, 0, 0, Math.PI*2); g.stroke();
    g.fillStyle='#A6F36A'; g.beginPath(); g.arc(cx, cy, h*0.36, 0, Math.PI*2); g.fill();
    g.fillStyle='#0A1A3F'; g.beginPath(); g.arc(cx, cy, h*0.16, 0, Math.PI*2); g.fill();
    g.fillStyle='#FFFFFF'; g.beginPath(); g.arc(cx+h*0.08, cy-h*0.08, h*0.05, 0, Math.PI*2); g.fill(); g.restore();
  }
  function shareHead(g, W, P, HEADH){ g.fillStyle='#0A1A3F'; g.fillRect(0,0,W,HEADH); var ew=150; eyeMark(g, P+ew/2, HEADH/2, ew); brandHead(g, P+ew+30, HEADH/2+8, W-2*P-ew-30, 76, BRANDF); g.textBaseline='alphabetic'; }
  function shareDate(g, W, P, y, sans){ var upd=((document.querySelector('.upd')||{}).textContent||'').replace('Atualizado em ','').trim(); if(!upd) return; g.textBaseline='middle'; g.textAlign='right'; g.fillStyle='#4A5663'; g.font='600 26px '+sans; g.fillText(upd.replace(/ de (\d{4})$/,' $1'), W-P, y); g.textAlign='left'; g.textBaseline='alphabetic'; }
  function shareFoot(g, W, H, P, FOOTH, sans){
    g.fillStyle='#0A1A3F'; g.fillRect(0,H-FOOTH,W,FOOTH);
    g.textBaseline='middle'; g.fillStyle='#fff'; g.font='800 34px '+sans; g.fillText('destrava-conversas.com.br', P, H-FOOTH/2);
    var cta='Veja as fontes no painel'; g.font='800 30px '+sans; var cw=g.measureText(cta).width;
    g.fillStyle='#A6F36A'; roundRect(g, W-P-cw-36, H-FOOTH/2-30, cw+36, 60, 30); g.fill();
    g.fillStyle='#0A1A3F'; g.fillText(cta, W-P-cw-18, H-FOOTH/2+1);
    g.textBaseline='alphabetic';
  }
  var PANEL_URL = 'https://destrava-conversas.com.br/observatoriodireitaradical/';
  function copyText(i){
    var who = cname(i.c) + (i.y ? ', ' + i.y : '');
    var parts = splitSrc(i.src).map(function(p){ return p.trim(); }).filter(Boolean);
    var links = i.links || [], used = {}, out = [];
    parts.forEach(function(part){
      var bn = baseName(part), hit = null;
      links.forEach(function(l){ if(!hit && l[0].toLowerCase()===bn.toLowerCase() && !used[l[1]]) hit = l; });
      if(hit){ used[hit[1]] = 1; out.push(part + ': ' + hit[1]); } else out.push(part);
    });
    links.forEach(function(l){ if(!used[l[1]]){ used[l[1]] = 1; out.push(l[0] + ': ' + l[1]); } });
    return i.t + ' (' + who + ')\n' + (out.length>1 ? 'Fontes:\n- ' + out.join('\n- ') : 'Fonte: ' + (out[0]||'')) + '\n\nVia '+BRAND+': ' + PANEL_URL;
  }
  function ndate(n){ return n.quando || fdate(n.d); }
  function newsText(n){
    var out = n.src.map(function(sr){ return sr[0] + ': ' + sr[1]; });
    return (n.n ? 'Sinal '+n.n+' · ' : '') + (n.tipo==='Você sabia?' ? 'Você sabia?' : ndate(n)) + '\n' + n.t + ((n.alerta&&n.alerta.length) ? '\n⚠ Alerta democrático: ' + n.alerta.map(function(k){ return ALERTA[k]; }).join(' · ') : '') + '\n\n' + n.s + (n.why ? '\n\n' + (n.wl||'Por que ler:') + ' ' + n.why : '') + '\n\n' + (out.length>1 ? 'Fontes:\n- ' + out.join('\n- ') : 'Fonte: ' + out[0]) + '\n\nVia '+BRAND+': ' + PANEL_URL;
  }
  function doCopy(txt){
    if(navigator.clipboard && window.isSecureContext){
      return navigator.clipboard.writeText(txt).catch(function(){ return legacyCopy(txt); });
    }
    return Promise.resolve(legacyCopy(txt));
  }
  function legacyCopy(txt){
    var ta = document.createElement('textarea');
    ta.value = txt; ta.setAttribute('readonly',''); ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select();
    var ok = false; try{ ok = document.execCommand('copy'); }catch(e){}
    document.body.removeChild(ta);
    if(!ok) throw new Error('copy failed');
  }
  function copyBtn(i){
    var b = el('button','cp','Copiar com fonte');
    b.type = 'button';
    b.setAttribute('aria-label','Copiar esta informação com a fonte e o link do painel');
    b.addEventListener('click', function(){
      Promise.resolve().then(function(){ return doCopy(typeof i==='function' ? i() : copyText(i)); }).then(function(){
        b.textContent = 'Copiado'; b.classList.add('ok');
      }).catch(function(){
        b.textContent = 'Não deu para copiar'; 
      }).then(function(){
        setTimeout(function(){ b.textContent = 'Copiar com fonte'; b.classList.remove('ok'); }, 1800);
      });
    });
    return b;
  }
  function verdictFor(t){
    if(t.total===0) return 'Nenhuma ação documentada nesta seleção.';
    var b = (t.pro - t.contra)/t.total;
    if(b<=-0.6) return 'Predominam fortemente as ações contra.';
    if(b<=-0.2) return 'Predominam as ações contra.';
    if(b<0.2) return 'Quadro misto: a favor e contra em quantidade parecida.';
    if(b<0.6) return 'Predominam as ações a favor.';
    return 'Predominam fortemente as ações a favor.';
  }
  var SHOW = 3;
  function cutIdx(ul){
    var n=0, ch=ul.children;
    for(var i=0;i<ch.length;i++){ if(!ch[i].classList.contains('grp')){ if(n===SHOW) return i; n++; } }
    return ch.length;
  }
  function fitCollapsed(ul, tries){
    var it = ul.children[cutIdx(ul)];
    if(!it || !ul.classList.contains('collapsed')) return;
    var h = it.offsetTop + Math.min(it.offsetHeight*0.55, 90);
    if(it.offsetTop > 0 && h > 150){ ul.style.maxHeight = h + 'px'; return; }
    /* lista ainda sem medida (oculta ou fora do layout): tenta de novo; se não der, mostra tudo sem bloquear */
    tries = (tries||0) + 1;
    if(tries <= 40){ setTimeout(function(){ fitCollapsed(ul, tries); }, 100); return; }
    ul.classList.remove('collapsed'); ul.style.maxHeight = '';
    [].slice.call(ul.children).forEach(function(li){ li.removeAttribute('inert'); });
  }
  function setCollapsed(ul, btn, n, on){
    var items = ul.children;
    if(on){
      ul.classList.add('collapsed');
      for(var i=cutIdx(ul);i<items.length;i++) items[i].setAttribute('inert','');
      fitCollapsed(ul);
      btn.setAttribute('aria-expanded','false');
      var un = (ul.getAttribute('data-unit') || 'ação|ações').split('|');
      btn.textContent = 'Ver mais ('+(n-SHOW)+' '+(n-SHOW===1?un[0]:un[1])+')';
    } else {
      ul.classList.remove('collapsed');
      ul.style.maxHeight = '';
      for(var j=0;j<items.length;j++) items[j].removeAttribute('inert');
      btn.setAttribute('aria-expanded','true');
      btn.textContent = 'Ver menos';
    }
  }
  function setupCollapse(ul, btn, n){
    ul.classList.remove('collapsed');
    ul.style.maxHeight = '';
    for(var k=0;k<ul.children.length;k++) ul.children[k].removeAttribute('inert');
    btn.onclick = null;
    if(n <= SHOW){ btn.hidden = true; return; }
    btn.hidden = false;
    setCollapsed(ul, btn, n, true);
    btn.onclick = function(){
      var open = btn.getAttribute('aria-expanded') === 'true';
      setCollapsed(ul, btn, n, open);
    };
  }
  var __rt;
  window.addEventListener('resize', function(){
    clearTimeout(__rt);
    __rt = setTimeout(function(){
      ['list-contra','list-pro','list-ctx','list-eco','vs-list-contra','vs-list-pro'].forEach(function(id){
        var ul = $(id);
        if(ul && ul.classList.contains('collapsed')){ ul.style.maxHeight=''; fitCollapsed(ul); }
      });
    }, 150);
  });
  var ARROW = {
    pro:{g:'▲', t:'Favorável: o dado está bem para as pessoas'},
    contra:{g:'▼', t:'Desfavorável: o dado está mal para as pessoas'},
    neutro:{g:'▶', t:'Misto ou sem base de comparação'}
  };
  function ctxItem(r, showC, showG, stripEco){
    var v = ARROW[r.v] ? r.v : 'neutro';
    var li = el('li','item arrowed');
    var ar = el('span','arrow '+v, ARROW[v].g);
    ar.setAttribute('role','img'); ar.setAttribute('aria-label', ARROW[v].t); ar.title = ARROW[v].t;
    li.appendChild(ar);
    var body = el('div','body');
    var tx = r.t.replace(/^Economia:\s*/,''); tx = tx.charAt(0).toUpperCase() + tx.slice(1);
    body.appendChild(el('p','', stripEco ? tx.charAt(0).toUpperCase()+tx.slice(1) : tx));
    var m = el('div','meta');
    var lt=legendTag(r.c, [gname(r.g)]); lt.setAttribute('data-pc',r.c); pillA(lt,'Ver o resumo de '+gname(r.g)+(r.c==='br'?'':' · '+cname(r.c))); lt.setAttribute('data-pg',r.g); m.appendChild(lt);
    body.appendChild(m);
    var ft = el('div','ifoot');
    ft.appendChild(srcNode(r));
    ft.appendChild(copyBtn(r));
    body.appendChild(ft);
    li.appendChild(body);
    return li;
  }
  function renderResult(){
    var t = tally(state.c, state.g);
    var cn = state.c==='all' ? 'Todos os governos' : cname(state.c);
    var gn = state.g==='all' ? 'Todas as pautas' : gname(state.g);
    $('sel-pill').textContent = gn + ' · ' + cn;
    var cLab = state.c==='all' ? 'Todos os governos' : cname(state.c);
    $('ctx-sel').textContent = gn + ' · ' + cLab;
    (function(){ var box=$('sel-crit'); box.innerHTML=''; var t = state.g==='all' ? '' : (CRITERIA[state.g] || ''); box.hidden = !t; if(!t) return;
      var m = t.match(/^A favor:\s*([\s\S]*?)\s*Contra:\s*([\s\S]*)$/);
      if(!m){ box.appendChild(document.createTextNode(t)); return; }
      var lc = m[2].replace(/\.\s*$/,''), lp = m[1].replace(/\.\s*$/,'');
      box.appendChild(document.createTextNode('Conta como contra o que ' + lc.charAt(0).toLowerCase() + lc.slice(1) + '; como a favor, o que ' + lp.charAt(0).toLowerCase() + lp.slice(1) + '.'));
    })();
    renderExamples();
    $('sel-crit').hidden = !$('sel-crit').textContent; $('crit-det').hidden = $('sel-crit').hidden; $('crit-det').open = false;
    renderSplit();
    var sub = '';
    var subC = null;
    ALLC.forEach(function(c){ if(c.k===state.c){ subC = c; sub = c.ctrl ? 'Governo Lula, 2023 a 2025: centro-esquerda usado como régua, não como equivalente' : (c.sub || (c.p+' sob '+c.n+', '+c.s)); } });
    var ss = $('sel-sub'); ss.textContent = '';
    if(subC && !subC.ctrl && sub.indexOf(subC.n) >= 0){
      var ix = sub.indexOf(subC.n);
      ss.appendChild(document.createTextNode(sub.slice(0,ix)));
      var la = el('a','parca-link',subC.n); la.href = '#parca-'+subC.k; la.title = 'Ver quem é '+subC.n+' e a ligação com Flávio';
      ss.appendChild(la);
      ss.appendChild(document.createTextNode(sub.slice(ix+subC.n.length)));
    } else if(!subC){
      ss.appendChild(document.createTextNode('Soma de '));
      var lp = el('a','parca-link','todos os governos'); lp.href = '#parcas'; lp.title = 'Ver quem são e como se ligam';
      ss.appendChild(lp);
    } else ss.textContent = sub;
    $('n-contra').textContent = t.contra; (function(){ [['go-contra',t.contra],['go-pro',t.pro]].forEach(function(x){ var a=$(x[0]); if(!a) return; if(x[1]>0){ a.removeAttribute('aria-disabled'); a.setAttribute('title','Ver as ações'); } else { a.setAttribute('aria-disabled','true'); a.removeAttribute('title'); } }); })();
    $('n-pro').textContent = t.pro;
    (function(){ var dd=pick(state.c,state.g,A).filter(function(i){ return i.disc; }), n=dd.length, dl=$('disc-line'); [['n-contra','contra'],['n-pro','pro']].forEach(function(x){ var e=$(x[0]); if(!e) return; if(dd.some(function(i){ return (i.s==='pro'?'pro':'contra')===x[1]; })){ var a=document.createElement('span'); a.className='ast'; a.textContent='*'; a.setAttribute('aria-label','inclui ação discutível'); e.appendChild(a); } }); if(!dl) return; dl.textContent = n ? '* Inclui '+n+(n===1?' ação discutível, marcada na lista com os dois lados.':' ações discutíveis, marcadas na lista com os dois lados.') : ''; dl.hidden = !n; })();
    var lc0 = document.querySelector('.c-contra .l'), lp0 = document.querySelector('.c-pro .l');
    if(lc0) lc0.textContent = t.contra===1 ? 'medida que piorou' : 'medidas que pioraram';
    var rt=$('res-title'); if(rt) rt.textContent = state.g==='all' ? 'O que eles fizeram' : 'O que mudou '+(PARA[state.g]||'');
    if(lp0) lp0.textContent = t.pro===1 ? 'medida que melhorou' : 'medidas que melhoraram';
    function shareW(v){ return (t.total && v>0) ? Math.max(2, v/t.total*50) : 0; }
    $('fill-l').style.width = shareW(t.contra).toFixed(1)+'%';
    $('fill-r').style.width = shareW(t.pro).toFixed(1)+'%';
    $('track').setAttribute('aria-label','Termômetro: '+t.contra+' ações contra e '+t.pro+' ações a favor, mostradas como parte do total');
    $('verdict').textContent = '';
    renderSummary(t);
    renderVs(t);
    renderRank();
    renderConst();
    var items = pick(state.c, state.g, A);
    var showC = state.c==='all', showG = state.g==='all';
    var lc = $('list-contra'), lp = $('list-pro');
    lc.innerHTML=''; lp.innerHTML='';
    var nc=0, np=0;
    if(showC){
      var ord = {}; ALLC.forEach(function(c,ix){ ord[c.k]=ix; });
      items = items.slice().sort(function(a,b){ return (ord[a.c]-ord[b.c]); });
    }
    var cntBy = {contra:{}, pro:{}};
    items.forEach(function(i){ var sd = i.s==='contra'?'contra':'pro'; cntBy[sd][i.c]=(cntBy[sd][i.c]||0)+1; });
    var lastC = {contra:null, pro:null};
    items.forEach(function(i){
      var sd = i.s==='contra'?'contra':'pro', ul = sd==='contra'?lc:lp;
      if(showC && lastC[sd]!==i.c){
        lastC[sd]=i.c;
        var gh = el('li','grp'); gh.setAttribute('role','presentation');
        gh.appendChild(el('span','',cname(i.c)));
        gh.appendChild(el('span','grp-n',String(cntBy[sd][i.c])));
        ul.appendChild(gh);
      }
      ul.appendChild(itemNode(i,showC,showG));
      if(sd==='contra') nc++; else np++;
    });
    if(!nc){ var e1 = el('li','empty','Nenhuma ação contra documentada.'); lc.appendChild(e1); }
    if(!np){ var e2 = el('li','empty','Nenhuma ação a favor documentada.'); lp.appendChild(e2); }
    $('cnt-contra').textContent = '('+nc+')';
    $('cnt-pro').textContent = '('+np+')';
    setupCollapse(lc, $('more-contra'), nc);
    setupCollapse(lp, $('more-pro'), np);
    var res = pick(state.c, state.g, R);
    var box = $('ctx'), lr = $('list-ctx');
    lr.innerHTML='';
    if(res.length){
      res.forEach(function(r){ lr.appendChild(ctxItem(r, showC, showG, false)); });
    } else { lr.appendChild(el('li','empty','Sem itens de contexto geral.')); }
    box.hidden = false;
    setupCollapse(lr, $('more-ctx'), res.length);
  }
  function tallyKeys(c, keys){
    var p=0,k=0;
    pickRaw(c,'all',A).forEach(function(i){ if(keys.indexOf(i.g)>=0){ if(i.s==='pro') p++; else k++; } });
    return {pro:p, contra:k, total:p+k};
  }
  function scopeText(c, g){
    var who = c==='all' ? 'Todos os governos' : cname(c);
    var rec = g==='all' ? 'Todas as pautas' : gname(g);
    return who + ' & ' + rec;
  }
  function addNums(mini, t){
    var l = el('span','num l'+(t.contra>0?'':' zero'), String(t.contra));
    var r = el('span','num r'+(t.pro>0?'':' zero'), String(t.pro));
    mini.appendChild(l); mini.appendChild(r);
  }
  function axisRow(){
    var row = el('div','srow axis');
    row.setAttribute('aria-hidden','true');
    row.appendChild(el('div',''));
    var ax = el('div','ax');
    ax.appendChild(el('span','a','Ações contra'));
    ax.appendChild(el('span','b','Ações a favor'));
    row.appendChild(ax);
    return row;
  }
  function splitRow(label, sub, t, scale, scope){
    var row = el('div','srow');
    var lab = el('div','lab',label);
    if(sub || scope){
      var sm = el('small','',sub || '');
      if(scope) sm.appendChild(el('span','scope',(sub ? ' · ' : '') + scope));
      lab.appendChild(sm);
    }
    row.appendChild(lab);
    var mini = el('div','mini');
    mini.setAttribute('role','img');
    mini.setAttribute('aria-label', label+': '+t.contra+' ações contra e '+t.pro+' ações a favor');
    var sc = Math.max(1, scale || Math.max(t.contra, t.pro));
    function w(v){ return v>0 ? Math.max(2, v/sc*50) : 0; }
    var fl = el('div','f l'); fl.style.width = w(t.contra).toFixed(1)+'%'; mini.appendChild(fl);
    var fr = el('div','f r'); fr.style.width = w(t.pro).toFixed(1)+'%'; mini.appendChild(fr);
    mini.appendChild(el('div','m'));
    addNums(mini, t);
    row.appendChild(mini);
    return row;
  }
  function maxOf(){ var m=1; for(var i=0;i<arguments.length;i++){ m=Math.max(m, arguments[i].contra, arguments[i].pro); } return m; }
  function pctPro(t){ return t.total ? Math.round(t.pro/t.total*100) : null; }
  var constOpen = {};
  function renderConst(){
    var rows = $('crank-rows');
    if(!rows) return;
    var list = COUNTRIES.map(function(c){ return c.k; }).concat(['br']);
    var data = list.map(function(k){
      var ev = CONST_EV.filter(function(e){ return e.c===k; });
      return {k:k, ev:ev, conc:ev.filter(function(e){ return e.st==='conc'; }).length, barr:ev.filter(function(e){ return e.st==='barr'; }).length};
    });
    data.sort(function(a,b){ return ((a.k==='br')-(b.k==='br')) || (b.conc-a.conc) || (b.barr-a.barr) || cname(a.k).localeCompare(cname(b.k),'pt-BR'); });
    var sc = 1; data.forEach(function(d){ sc = Math.max(sc, d.conc, d.barr); });
    function w(v){ return v>0 ? Math.max(2, v/sc*50) : 0; }
    rows.innerHTML = '';
    data.forEach(function(d,i){
      var wrap = el('div','crow'+(state.c===d.k?' sel':''));
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'rrow' + (i<3 && d.conc>0 ? ' top' : '');
      var open = !!constOpen[d.k];
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      b.setAttribute('aria-label', (i+1)+'º, '+cname(d.k)+': '+d.conc+' concretizadas e '+d.barr+' barradas ou revertidas. '+(open?'Ocultar':'Ver')+' os eventos.');
      b.appendChild(el('span','pos'+(d.k==='br'?' ctrl':''), d.k==='br' ? '—' : String(i+1)));
      var nm = el('span','nm',cname(d.k));
      nm.appendChild(el('small', d.k==='br' ? '' : 'ev', d.k==='br' ? 'Comparação' : (open ? 'Ocultar eventos' : 'Ver eventos')));
      b.appendChild(nm);
      var mini = el('div','mini');
      var fl = el('div','f l'); fl.style.width = w(d.conc).toFixed(1)+'%'; mini.appendChild(fl);
      var fr = el('div','f r'); fr.style.width = w(d.barr).toFixed(1)+'%'; mini.appendChild(fr);
      mini.appendChild(el('div','m'));
      addNums(mini, {contra:d.conc, pro:d.barr});
      b.appendChild(mini);
      b.addEventListener('click', function(){ constOpen[d.k] = !constOpen[d.k]; renderConst(); });
      wrap.appendChild(b);
      if(open){
        var box = el('div','evs');
        var ul = el('ul','list');
        if(!d.ev.length){
          ul.appendChild(el('li','empty', d.k==='cl' ? 'Governo em exercício desde março de 2026, sem eventos documentados até agora.' : 'Nenhum evento documentado. Isso não prova que não houve.'));
        }
        d.ev.forEach(function(e){
          var li = el('li','item'+(e.st==='barr'?' barr':''));
          li.appendChild(el('p','',e.t));
          var m = el('div','meta');
          m.appendChild(el('span','tag st', e.lab || (e.st==='conc' ? 'Concretizada' : 'Barrada ou revertida')));
          m.appendChild(el('span','tag', e.cat));
          m.appendChild(el('span','', e.y));
          if(e.note) m.appendChild(el('span','tag note', e.note));
          m.appendChild(srcNode(e));
          li.appendChild(m);
          ul.appendChild(li);
        });
        box.appendChild(ul);
        wrap.appendChild(box);
      }
      rows.appendChild(wrap);
    });
  }
  function renderRank(){
    var rows = $('rank-rows');
    if(!rows) return;
    var keys = GROUPS.map(function(g){ return {k:g.k,n:g.n,kind:'grupo'}; }).concat(THEMES.map(function(t){ return {k:t.k,n:t.n,kind:'área'}; }));
    var data = keys.map(function(x){ var t = tally(state.c, x.k); return {k:x.k,n:x.n,kind:x.kind,contra:t.contra,pro:t.pro,total:t.total}; });
    data.sort(function(a,b){ return (b.contra-a.contra) || (a.pro-b.pro) || a.n.localeCompare(b.n,'pt-BR'); });
    var sc = 1; data.forEach(function(d){ sc = Math.max(sc, d.contra, d.pro); });
    function w(v){ return v>0 ? Math.max(2, v/sc*50) : 0; }
    var cLab = state.c==='all' ? 'Todos os governos' : cname(state.c);
    $('rank-sel').textContent = cLab;
    $('rank-sub').textContent = (state.c==='all' ? 'Soma de todos os governos. ' : '') + 'Barras: ações contra (laranja) e a favor (azul).';
    rows.innerHTML = '';
    data.forEach(function(d,i){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'rrow' + (i<3 && d.contra>0 ? ' top' : '') + (d.k===state.g ? ' sel' : '');
      if(d.k===state.g) b.setAttribute('aria-current','true');
      b.setAttribute('aria-label', (i+1)+'º, '+d.n+': '+d.contra+' ações contra e '+d.pro+' a favor. Ver as ações.');
      b.appendChild(el('span','pos',String(i+1)));
      var nm = el('span','nm',d.n);
      b.appendChild(nm);
      var mini = el('div','mini');
      var fl = el('div','f l'); fl.style.width = w(d.contra).toFixed(1)+'%'; mini.appendChild(fl);
      var fr = el('div','f r'); fr.style.width = w(d.pro).toFixed(1)+'%'; mini.appendChild(fr);
      mini.appendChild(el('div','m'));
      addNums(mini, d);
      b.appendChild(mini);
      b.addEventListener('click', function(){ state.g = d.k; state.picked = true; render(); goToResult(); });
      rows.appendChild(b);
    });
  }
  function renderVs(t){
    var box = $('vs');
    vsOpen = true; vsActOpen = false;
    if(state.c==='br'){ box.hidden = true; return; }
    var tc = tally('br', state.g);
    var rows = $('vs-rows');
    rows.innerHTML = '';
    var who = state.c==='all' ? 'Todos os governos' : cname(state.c);
    var scv = maxOf(t, tc);
    var rec = state.g==='all' ? 'Todas as pautas' : gname(state.g);
    $('vs-sel').textContent = who + ' & ' + rec;
    rows.appendChild(splitRow(who, '', t, scv, ''));
    var rowC = splitRow(cname('br'), '', tc, scv, '');
    rowC.title = cname('br') + ' é usado como régua de comparação, não como equivalente.';
    rows.appendChild(rowC);
    var a = pctPro(t), b = pctPro(tc), note = $('vs-note');
    if(a===null || b===null){
      note.textContent = tc.total===0 ? 'O governo Lula não tem ações documentadas nesta pauta, então não há o que comparar.' : 'Esta seleção não tem ações documentadas, então só o governo Lula aparece.';
    } else {
      note.textContent = '';
    }
    note.hidden = !note.textContent;
    box.hidden = false;
    lastTc = tc;
    applyVs();
  }
  var lastTc = null, vsActOpen = false;
  function fillSet(items, ids, showG, noneC, noneP){
    var lc = $(ids.lc), lp = $(ids.lp), nc=0, np=0;
    lc.innerHTML=''; lp.innerHTML='';
    items.forEach(function(i){
      if(i.s==='contra'){ lc.appendChild(itemNode(i,false,showG)); nc++; }
      else { lp.appendChild(itemNode(i,false,showG)); np++; }
    });
    if(!nc) lc.appendChild(el('li','empty',noneC));
    if(!np) lp.appendChild(el('li','empty',noneP));
    $(ids.hc).textContent = 'O que piorou ('+nc+')';
    $(ids.hp).textContent = 'O que melhorou ('+np+')';
    setupCollapse(lc, $(ids.mc), nc);
    setupCollapse(lp, $(ids.mp), np);
  }
  function renderVsActions(){
    var tg = $('vs-act-toggle'), panel = $('vs-actions');
    if(!tg || !panel) return;
    var tc = lastTc;
    if(!tc || !tc.total){ tg.hidden = true; panel.hidden = true; return; }
    tg.hidden = false;
    tg.setAttribute('aria-expanded', vsActOpen ? 'true' : 'false');
    tg.textContent = (vsActOpen ? 'Ocultar' : 'Ver') + ' ações do governo Lula (' + tc.total + ')';
    panel.hidden = !vsActOpen;
    if(!vsActOpen) return;
    var showG = state.g==='all';
    $('vs-act-title').hidden = true;
    fillSet(pick('br', state.g, A), {lc:'vs-list-contra',lp:'vs-list-pro',hc:'vs-h-contra',hp:'vs-h-pro',mc:'vs-more-contra',mp:'vs-more-pro'}, showG, 'O governo Lula não tem ações contra nesta pauta.', 'O governo Lula não tem ações a favor nesta pauta.');
  }
  var vsOpen = false;
  function applyVs(){
    var body = $('vs-body'), tg = $('vs-toggle');
    if(!body || !tg) return;
    body.hidden = !vsOpen;
    var bx = $('vs'); if(bx) bx.classList.toggle('is-collapsed', !vsOpen);
    tg.setAttribute('aria-expanded', vsOpen ? 'true' : 'false');
    tg.textContent = vsOpen ? 'Recolher' : 'Expandir';
    var vsel = $('vs-sel'); if(vsel) vsel.hidden = !vsOpen;
    if(vsOpen) renderVsActions(); else { var pn=$('vs-actions'), ba=$('vs-act-toggle'); if(pn) pn.hidden = true; if(ba) ba.hidden = true; }
  }
  document.addEventListener('DOMContentLoaded', function(){
    var tg=$('vs-toggle'); if(tg) tg.addEventListener('click', function(){ vsOpen=!vsOpen; applyVs(); });
    var ta=$('vs-act-toggle'); if(ta) ta.addEventListener('click', function(){ vsActOpen=!vsActOpen; renderVsActions(); });
  });
  function renderSplit(){}
  function goToResult(){
    var target = $('resumo');
    if(!target) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(function(){
      if(target.scrollIntoView) target.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'start'});
      var t = $('res-title');
      if(t){ t.setAttribute('tabindex','-1'); t.focus({preventScroll:true}); }
      setBlk('acoes', true); setBlk('rank', true); setBlk('ctx', true);
    });
  }
  function renderMatrix(){
    var m = $('matrix');
    if(!m) return;
    m.innerHTML='';
    m.appendChild(el('div','hd',''));
    var cols = [{k:'all',n:'Todos',kind:'consolidado'}]
      .concat(GROUPS.concat(THEMES).sort(byOrder).map(function(x){ return {k:x.k,n:x.n,kind:'assunto'}; }));
    var fc = window.innerWidth < 640 ? 112 : 170;
    m.style.gridTemplateColumns = fc+'px repeat('+cols.length+',minmax(92px,1fr))';
    m.style.minWidth = (fc + cols.length*100) + 'px';
    cols.forEach(function(g){ m.appendChild(el('div','hd',g.n)); });
    ALLC.forEach(function(c){
      if(c.ctrl){ m.appendChild(el('div','sep','')); }
      var rw = el('div','rw',c.n);
      if(c.ctrl){ rw.appendChild(el('small','','Comparação')); }
      m.appendChild(rw);
      cols.forEach(function(g){
        var t = tally(c.k,g.k);
        var btn = el(c.ctrl ? 'div' : 'button', c.ctrl ? 'cell static' : 'cell');
        if(!c.ctrl){ btn.type='button'; btn.setAttribute('aria-pressed', (state.c===c.k && state.g===g.k) ? 'true':'false'); }
        btn.setAttribute('aria-label', c.n+', '+g.n+': '+t.contra+' ações contra e '+t.pro+' ações a favor');
        var bar = el('div','bar');
        if(t.total){
          var x = el('i','x'); x.style.width = (t.contra/t.total*100)+'%';
          var y = el('i','y'); y.style.width = (t.pro/t.total*100)+'%';
          bar.appendChild(x); bar.appendChild(y);
        }
        btn.appendChild(bar);
        var num = el('span','num');
        if(t.total){
          num.appendChild(el('b','nc',String(t.contra)));
          num.appendChild(el('span','dotsep','·'));
          num.appendChild(el('b','np',String(t.pro)));
        } else {
          num.appendChild(el('span','nd','sem dado'));
          btn.classList.add('nodata');
          btn.setAttribute('aria-label', c.n+', '+g.n+': nenhuma ação documentada');
        }
        btn.appendChild(num);
        if(!c.ctrl) btn.addEventListener('click', function(){ state.c=c.k; state.g=g.k; state.picked=true; render(); goToResult(); });
        m.appendChild(btn);
      });
    });
  }
  /* ---------- blocos recolhíveis ---------- */
  var BLK = {};
  var XSVG='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  function xBtn(bt, open, onLbl, offLbl){
    bt.classList.toggle('x-close', open);
    if(open){ bt.innerHTML=XSVG; bt.setAttribute('aria-label', onLbl); bt.title=onLbl; }
    else { bt.textContent=offLbl; bt.removeAttribute('aria-label'); bt.removeAttribute('title'); }
  }
  function makeBlock(id, headSel, openLbl){
    var box = $(id); if(!box) return;
    var head = box.querySelector(headSel); if(!head) return;
    var bar = el('div','blk-bar');
    var tz = el('p','blk-teaser',''); tz.id = 'tz-'+id;
    var bt = el('button','toggle blk-tg',openLbl);
    bt.type='button'; bt.setAttribute('aria-expanded','false'); bt.setAttribute('aria-controls','bd-'+id);
    bar.appendChild(tz); bar.appendChild(bt);
    var body = el('div','blk-body'); body.id='bd-'+id; body.hidden = true;
    var n = head.nextSibling;
    while(n){ var nx = n.nextSibling; body.appendChild(n); n = nx; }
    box.appendChild(bar); box.appendChild(body);
    box.classList.add('blk','blk-closed');
    BLK[id] = {box:box, body:body, bt:bt, lbl:openLbl};
    bt.addEventListener('click', function(){ setBlk(id, body.hidden); });
  }
  function setBlk(id, open){
    var b = BLK[id]; if(!b) return;
    b.body.hidden = !open;
    b.box.classList.toggle('blk-closed', !open);
    b.bt.setAttribute('aria-expanded', open ? 'true' : 'false');
    xBtn(b.bt, open, 'Fechar '+(((b.box.querySelector('h2')||{}).textContent||'').trim()), b.lbl);
    if(open){
      ['list-contra','list-pro','list-ctx'].forEach(function(lid){ var ul=$(lid); if(ul && b.body.contains(ul) && ul.classList.contains('collapsed')){ ul.style.maxHeight=''; fitCollapsed(ul); } });
      if(id==='visao-geral' && typeof mxFade==='function') setTimeout(mxFade,30);
    }
  }
  function openFor(target){
    if(!target) return;
    Object.keys(BLK).forEach(function(k){ if(BLK[k].box.contains(target) || BLK[k].box===target) setBlk(k, true); });
  }
  function teasers(){
    var tz;
    var nc = ($('cnt-contra')||{}).textContent||'', np = ($('cnt-pro')||{}).textContent||'';
    if((tz=$('tz-acoes'))) tz.textContent = nc.replace(/[()]/g,'')+' contra · '+np.replace(/[()]/g,'')+' a favor, cada uma com fonte' + (state.c==='all' ? ', agrupadas por governo.' : '.');
    var r1 = document.querySelector('#rank-rows .rrow .nm');
    var rn = document.querySelector('#rank-rows .rrow .num.l');
    if((tz=$('tz-rank'))) tz.textContent = r1 ? 'Pauta com mais ações contra: ' + r1.firstChild.textContent + (rn ? ' (' + rn.textContent + ')' : '') + '.' : '';
    var nctx = ($('list-ctx')||{children:[]}).querySelectorAll ? $('list-ctx').querySelectorAll('li.item').length : 0;
    if((tz=$('tz-ctx'))) tz.textContent = nctx ? nctx + (nctx===1?' item':' itens') + ' com resultados medidos, como indicadores e estatísticas. Não entram no placar.' : 'Sem itens de contexto nesta seleção.';
    if((tz=$('tz-visao-geral'))) tz.textContent = 'Todos os governos cruzados com todas as pautas, numa tabela. Toque numa célula para filtrar.';
    var top = [].slice.call(document.querySelectorAll('#crank-rows .rrow')).slice(0,2).map(function(b){ return b.querySelector('.nm').firstChild.textContent; });
    if((tz=$('tz-informacoes'))) tz.textContent = (function(){ var u=((document.querySelector('.upd')||{}).textContent||'').trim(); return (u ? u+'. ' : '') + 'Privacidade, licença, autoria e uso de IA, período coberto de cada governo e '+(window.__srcTotal ? 'as '+window.__srcTotal+' fontes usadas' : 'as fontes usadas')+', com o semáforo de confiabilidade.'; })();
    if((tz=$('tz-democracia'))) tz.textContent = top.length ? 'Intervenções em limites constitucionais ao poder. Lideram: ' + top.join(' e ') + '.' : '';
  }
  /* ---------- rede de conexões ---------- */
  var PX = PD.PX;
  var CX_N = PX.nos, CX_E = PX.arestas.map(function(e){ return {a:e.a,b:e.b,t:e.tipo,d:e.data,ti:e.titulo,txt:e.texto,src:e.fontes,f:e.forca}; });
  var CX_T = {rede:'Redes e eventos', eleitoral:'Apoio eleitoral', dinheiro:'Dinheiro e pressão'};
  var cxSel = null, cxType = 'todas';
  var MES3=['jan.','fev.','mar.','abr.','maio','jun.','jul.','ago.','set.','out.','nov.','dez.'];
  function pxDate(d){ if(!d) return ''; var p=String(d).split('-'); if(p.length===1) return p[0]; var m=MES3[parseInt(p[1],10)-1]||''; return (p[2]?parseInt(p[2],10)+' ':'')+m+' '+p[0]; }
  function cxNode(id){ for(var i=0;i<CX_N.length;i++) if(CX_N[i].id===id) return CX_N[i]; }
  function cxOn(e){ return cxType==='todas' || e.t===cxType; }
  function pxSrc(list, lab){ var sp=el('span','srcs', lab===undefined?'Fontes: ':lab); (list||[]).forEach(function(sr,ix){ if(ix) sp.appendChild(document.createTextNode('; ')); if(sr[1]){ var a=el('a','',sr[0]); a.href=sr[1]; a.target='_blank'; a.rel='noopener noreferrer'; sp.appendChild(a); } else sp.appendChild(document.createTextNode(sr[0])); }); return sp; }
  function cxRender(){
    var svg = $('cx-map'); if(!svg) return;
    var NS='http://www.w3.org/2000/svg';
    while(svg.childNodes.length>1) svg.removeChild(svg.lastChild);
    var gE=document.createElementNS(NS,'g'), gN=document.createElementNS(NS,'g');
    svg.appendChild(gE); svg.appendChild(gN);
    var seen={}, F=cxNode('fl');
    CX_E.forEach(function(e){
      if(!cxOn(e)) return;
      var A=cxNode(e.a), B=cxNode(e.b); if(!A||!B) return;
      var key=[e.a,e.b].sort().join('|'); var k=seen[key]=(seen[key]||0)+1;
      var mx=(A.x+B.x)/2, my=(A.y+B.y)/2, dx=B.x-A.x, dy=B.y-A.y, len=Math.sqrt(dx*dx+dy*dy)||1;
      var b1=0.10*len*(1+(k-1)*0.7)*(k%2?1:-1);
      var cx=mx-dy/len*b1, cy=my+dx/len*b1;
      var p=document.createElementNS(NS,'path');
      p.setAttribute('d','M'+A.x+','+A.y+' Q'+cx.toFixed(1)+','+cy.toFixed(1)+' '+B.x+','+B.y);
      var on = !cxSel || e.a===cxSel || e.b===cxSel;
      p.setAttribute('class','cx-e '+e.t+(on?(cxSel?' on':''):' off'));
      gE.appendChild(p);
    });
    var lit={}; if(cxSel){ lit[cxSel]=1; CX_E.forEach(function(e){ if(!cxOn(e)) return; if(e.a===cxSel) lit[e.b]=1; if(e.b===cxSel) lit[e.a]=1; }); }
    CX_N.forEach(function(n){
      var g=document.createElementNS(NS,'g');
      g.setAttribute('class','cx-n click '+n.g+(cxSel?(lit[n.id]?(n.id===cxSel?' sel':' lit'):' dim'):''));
      g.setAttribute('transform','translate('+n.x+','+n.y+')');
      var r = n.g==='foco'?22:(n.g==='lider'?17:(n.g==='rede'?12:13));
      var c=document.createElementNS(NS,'circle'); c.setAttribute('r', r); g.appendChild(c);
      var t=document.createElementNS(NS,'text'); t.setAttribute('y', r+19); t.setAttribute('class','l'); t.textContent=n.n; g.appendChild(t);
      var t2=document.createElementNS(NS,'text'); t2.setAttribute('y', r+35); t2.setAttribute('class','s'); t2.textContent=n.sub; g.appendChild(t2);
      g.setAttribute('tabindex','0'); g.setAttribute('role','button'); g.setAttribute('aria-label', n.full+': ver ligações');
      var pick=function(){ if($('cx-map').dataset.dragged) return; cxPick(cxSel===n.id ? null : n.id, true); };
      g.addEventListener('click', pick);
      g.addEventListener('keydown', function(ev){ if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); pick(); } });
      gN.appendChild(g);
    });
  }
  function cxItem(e, me){
    var li=el('li','item cx-item '+e.t);
    var m=el('div','meta');
    m.appendChild(el('span','tag cx-tag '+e.t, CX_T[e.t]));
    var A=cxNode(e.a), B=cxNode(e.b);
    m.appendChild(el('span','tag', me ? (e.a===me ? B.n : A.n) : (A.n+' ↔ '+B.n)));
    if(e.d) m.appendChild(el('span','px-d',pxDate(e.d)));
    li.appendChild(m);
    li.appendChild(el('p','cx-ti',e.ti));
    li.appendChild(el('p','',e.txt));
    var ft=el('div','ifoot'); ft.appendChild(pxSrc(e.src)); li.appendChild(ft);
    return li;
  }
  function byDate(a,b){ return String(a.d)<String(b.d)?1:-1; }
  function cxSelBox(){
    var box=$('px-sel'); if(!box) return; box.innerHTML='';
    if(!cxSel){ box.hidden=true; return; } box.hidden=false;
    var n=cxNode(cxSel);
    var hd=el('div','px-selhd'); hd.appendChild(el('b','',n.full)); var x=el('button','px-x','Limpar seleção'); x.type='button'; x.onclick=function(){ cxPick(null); }; hd.appendChild(x); box.appendChild(hd);
    box.appendChild(el('p','px-small',n.bio));
    if(n.g==='lider'){ var a=el('a','px-flink','Ver ficha de '+n.n+' ↓'); a.href='#parca-'+n.id; box.appendChild(a); }
    var L=CX_E.filter(function(e){ return cxOn(e) && (e.a===cxSel||e.b===cxSel); }).sort(byDate);
    box.appendChild(el('p','px-count', L.length+(L.length===1?' ligação':' ligações')+(cxType==='todas'?'':' do tipo '+CX_T[cxType].toLowerCase())));
    var ul=el('ul','list cx-list'); L.forEach(function(e){ ul.appendChild(cxItem(e,cxSel)); }); box.appendChild(ul);
  }
  function cxPick(id, fromMap){
    cxSel=id; cxRender(); cxSelBox(); if(id) cxFocus(id);
    if(fromMap && id){ var d=$('px-sel'); if(d && d.scrollIntoView){ var r=d.getBoundingClientRect(); if(r.top>window.innerHeight-80) d.scrollIntoView({behavior:'smooth',block:'nearest'}); } }
  }
  function pxCell(c){ return (c&&c.nivel)||'nao'; }
  var PXP = {nativismo:'Nativismo',autoritarismo:'Autoritarismo',bodes:'Bodes expiatórios',populismo:'Populismo',militarismo:'Militarismo',religiao:'Religião e antigênero',personalismo:'Personalismo',desinformacao:'Desinformação'};
  var PXL = {ato:'ato',discurso:'discurso',nao:'—'};
  function pxInit(){
    // espectro
    var sp=$('px-spec'); if(!sp) return;
    PX.spec.forEach(function(b,i){ var d=el('div','px-band'+(i===6?' rad':'')+(i===7?' ext':'')); d.appendChild(el('b','',b.faixa)); d.appendChild(el('span','',b.descricao.split('. ')[0].replace(/\.$/,'')+'.')); sp.appendChild(d); });
    $('px-specnota').textContent = 'A régua não é econômica. A UDI chilena é mais liberal na economia que a AfD alemã, mas quase não é antipluralista. O PiS polonês fica levemente à esquerda do centro na economia e é 16 vezes mais antipluralista que a CDU alemã (V-Party).';
    PX.bars.forEach(function(v){ var r=el('div','px-bar '+v.k); r.appendChild(el('span','n',v.l)); var t=el('span','t'); var f=el('span','f'); f.style.width=(v.a*100).toFixed(1)+'%'; t.appendChild(f); r.appendChild(t); r.appendChild(el('span','v',String(v.a).replace('.',','))); $('px-bars').appendChild(r); });
    var vs=el('p','px-small'); vs.appendChild(pxSrc([['V-Party Dataset V2 (V-Dem, Lindberg et al., 2022)','https://www.v-dem.net/data/v-party-dataset/'],['V-Dem Democracy Report 2026','https://www.v-dem.net/documents/75/V-Dem_Institute_Democracy_Report_2026_lowres.pdf']])); $('px-bars').parentNode.appendChild(vs);
    // pilares
    PX.pil.filter(function(p){ return p.key!=='economia'; }).forEach(function(p){
      var d=el('details','px-p'+(p.nucleo?' core':'')); var sm=el('summary'); sm.appendChild(el('b','',p.nome)); if(p.nucleo) sm.appendChild(el('span','px-core','núcleo')); sm.appendChild(el('span','px-def',p.definicao)); d.appendChild(sm);
      var ul=el('ul'); (p.como_reconhecer||[]).forEach(function(x){ ul.appendChild(el('li','',x)); }); d.appendChild(ul);
      d.appendChild(el('p','px-small','Base: '+(p.autores||[]).join('; ')+'.'));
      $('px-pil').appendChild(d);
    });
    $('px-eco').textContent = 'Economia não é critério. Milei, Bolsonaro (com Paulo Guedes) e Kast aprofundam a agenda neoliberal; Orbán e o PiS fazem o contrário, com Estado forte e benefícios só "para os nossos", o chamado chauvinismo de bem-estar. Eles divergem na economia e convergem no autoritarismo.';
    // matriz
    var mx=$('px-mx'), hr=el('tr'); hr.appendChild(el('th','',''));
    PX.mx.pilares.forEach(function(p){ hr.appendChild(el('th','',PXP[p]||p)); }); hr.appendChild(el('th','','Economia')); mx.appendChild(hr);
    var rows = PX.mx.lideres.filter(function(l){ return l.k!=='fl'; }).concat(PX.mx.lideres.filter(function(l){ return l.k==='fl'; }));
    rows.forEach(function(L){
      var tr=el('tr', L.k==='fl'?'px-fl':''); var th=el('th','row'); th.appendChild(document.createTextNode(L.k==='fl'?'Flávio (candidato)':(cxNode(L.k)?cxNode(L.k).n:L.nome))); tr.appendChild(th);
      PX.mx.pilares.forEach(function(p){ var c=(L.celulas||{})[p]||{nivel:'nao'}; var lv=pxCell(c); var td=el('td'); var b=el('button','px-c '+lv, PXL[lv]+(c.escopo==='legislativo'?'*':'')); b.type='button'; b.setAttribute('aria-label',L.nome+', '+(PXP[p]||p)+': '+(lv==='nao'?'não encontrado':lv)); b.onclick=function(){ pxShow(L,PXP[p],c,b); }; td.appendChild(b); tr.appendChild(td); });
      var e=L.economia||{}; var td=el('td'); var b=el('button','px-c pxeco',(e.tipo||'—').replace('chauvinismo de bem-estar','bem-estar "dos nossos"')); b.type='button'; b.onclick=function(){ pxShow(L,'Economia',e,b); }; td.appendChild(b); tr.appendChild(td);
      mx.appendChild(tr);
    });
    var nt=el('p','px-small','* Flávio nunca governou: na linha dele, "ato" é ato legislativo (projeto de lei de que é coautor).'); $('px-mxd').parentNode.insertBefore(nt,$('px-mxd'));
    // rede: filtros
    [['todas','Todas']].concat(Object.keys(CX_T).map(function(k){ return [k,CX_T[k]]; })).forEach(function(t){ var b=el('button','px-chip'+(t[0]!=='todas'?' '+t[0]:''),t[1]); b.type='button'; b.setAttribute('aria-pressed',t[0]===cxType?'true':'false'); b.onclick=function(){ cxType=t[0]; [].slice.call($('px-ft').children).forEach(function(x){ x.setAttribute('aria-pressed','false'); }); b.setAttribute('aria-pressed','true'); cxRender(); cxSelBox(); }; $('px-ft').appendChild(b); });
    PX.padroes.forEach(function(p){ var d=el('div','px-padi'); d.appendChild(el('b','',p.titulo)); d.appendChild(el('span','px-who',p.quem.map(function(k){ return cxNode(k)?cxNode(k).n:k; }).join(' · '))); d.appendChild(el('p','',p.descricao)); d.appendChild(pxSrc(p.fontes)); $('px-pad').appendChild(d); });
    var all=$('cx-list'); CX_E.slice().sort(byDate).forEach(function(e){ all.appendChild(cxItem(e)); });
    var sm=document.querySelector('details.cx-all summary'); if(sm) sm.textContent='Todas as ligações, com fontes ('+CX_E.length+')';
    // fichas
    ['bb','us','ar','sv','cl','hu','pl'].forEach(function(k){ $('px-fichas').appendChild(pxFicha(k)); });
    var who=$('pxbar-who'); if(who){ ['bb','us','ar','sv','cl','hu','pl'].forEach(function(k){ var n=cxNode(k); var b=el('button','pxw',n.n); b.type='button'; b.setAttribute('data-k',k); b.onclick=function(){ pxOpenFicha(k); }; who.appendChild(b); }); }
    PX.mx.sec.forEach(function(S){ var n=cxNode(S.k)||{}; var d=el('div','px-seci'); d.appendChild(el('b','',S.nome)); d.appendChild(el('p','px-small',n.bio||'')); var ul=el('ul'); Object.keys(S.celulas||{}).forEach(function(k){ var c=S.celulas[k]; var li=el('li'); li.appendChild(el('span','lvl '+pxCell(c),PXL[pxCell(c)])); li.appendChild(document.createTextNode(' '+(PXP[k]||(k==='economia'?'Economia':k))+': '+(c.ex||''))); li.appendChild(pxSrc(c.fontes,' ')); ul.appendChild(li); }); d.appendChild(ul); $('px-secs').appendChild(d); });
    PX.refs.forEach(function(r){ var li=el('li'); li.appendChild(document.createTextNode(r.citation+' ')); var a=el('a','','link'); a.href=r.url; a.target='_blank'; a.rel='noopener noreferrer'; li.appendChild(a); $('px-refs').appendChild(li); });
    cxRender(); cxSelBox();
  }
  function pxShow(L,pn,c,btn){
    [].slice.call(document.querySelectorAll('#px-mx .px-c')).forEach(function(b){ b.classList.remove('on'); }); btn.classList.add('on');
    var d=$('px-mxd'); d.innerHTML='';
    var h=el('p','px-mxh'); h.appendChild(el('b','',(L.k==='fl'?'Flávio Bolsonaro':L.nome)+' · '+pn)); var lv=c.nivel||c.tipo||''; if(lv) h.appendChild(el('span','lvl '+(c.nivel||'eco'),c.nivel?PXL[c.nivel]:lv)); d.appendChild(h);
    d.appendChild(el('p','',c.ex||'Nada encontrado nas fontes consultadas.'));
    if(c.nota) d.appendChild(el('p','px-small',c.nota));
    if(c.fontes && c.fontes.length) d.appendChild(pxSrc(c.fontes));
  }
  function pxFicha(k){
    var n=cxNode(k), L=null; PX.mx.lideres.forEach(function(x){ if(x.k===k) L=x; });
    var d=el('details','px-f'); d.id='parca-'+k;
    var sm=el('summary'); var t=el('span','px-fn',n.full); sm.appendChild(t); sm.appendChild(el('span','px-fm',n.sub));
    var atos=PX.mx.pilares.filter(function(p){ return pxCell((L.celulas||{})[p])==='ato'; }).length;
    sm.appendChild(el('span','px-fs',atos+' de 8 pilares com ato de governo')); d.appendChild(sm);
    var body=el('div','px-fb');
    body.appendChild(el('p','px-small',L.periodo||n.bio));
    var chips=el('div','px-chips'); PX.mx.pilares.forEach(function(p){ var lv=pxCell((L.celulas||{})[p]); if(lv==='nao') return; chips.appendChild(el('span','lvl '+lv,PXP[p])); }); body.appendChild(chips);
    var ex=PX.mx.pilares.filter(function(p){ return pxCell((L.celulas||{})[p])==='ato'; }).slice(0,3);
    if(ex.length){ var ul=el('ul','px-ex'); ex.forEach(function(p){ var c=L.celulas[p]; var li=el('li'); li.appendChild(el('b','',PXP[p]+': ')); li.appendChild(document.createTextNode(c.ex)); li.appendChild(pxSrc(c.fontes,' ')); ul.appendChild(li); }); body.appendChild(ul); }
    if(L.economia && L.economia.tipo){ var e=el('p','px-small'); e.appendChild(el('b','','Economia: ')); e.appendChild(document.createTextNode(L.economia.tipo+'. '+(L.economia.ex||''))); body.appendChild(e); }
    var R=PX.regua[k]||{};
    if(R.vp||R.reg||R.acad){ var rg=el('div','px-rg'); rg.appendChild(el('b','','Régua externa')); if(R.vp) rg.appendChild(el('p','','Antipluralismo V-Party: '+String(R.vp.a).replace('.',',')+' ('+R.vp.p+', '+R.vp.e+'), numa escala de 0 a 1.')); if(R.reg){ var p=el('p','',R.reg.t+' ('+R.reg.ano+'). '); p.appendChild(pxSrc([R.reg.f],'')); rg.appendChild(p); } if(R.acad){ var p2=el('p','','Classificação acadêmica: '+R.acad.t+' ('+R.acad.ano+'). '); p2.appendChild(pxSrc([R.acad.f],'')); rg.appendChild(p2); } body.appendChild(rg); }
    if(k==='pl'){ var pn=el('p','px-key','Ligação de rede: não há ligação pessoal documentada entre Kaczyński e os Bolsonaros. O elo de governo foi com o presidente Andrzej Duda (2019–2021) e, hoje, passa por eurodeputados do PiS. Encaixe forte em Judiciário, mídia e gênero; fraco em personalismo e militarismo.'); body.appendChild(pn); }
    function sect(title, list, me){ if(!list.length) return; body.appendChild(el('p','px-sub',title+' ('+list.length+')')); var ul=el('ul','list cx-list'); list.sort(byDate).forEach(function(e){ ul.appendChild(cxItem(e,me)); }); body.appendChild(ul); }
    var withF=CX_E.filter(function(e){ return (e.a==='fl'&&e.b===k)||(e.b==='fl'&&e.a===k); });
    var fam=CX_E.filter(function(e){ return k!=='bb' && ((e.a===k&&(e.b==='bb'||e.b==='eb'))||(e.b===k&&(e.a==='bb'||e.a==='eb'))); });
    var LID={bb:1,us:1,ar:1,sv:1,cl:1,hu:1,pl:1};
    var peers=CX_E.filter(function(e){ return (e.a===k&&LID[e.b]&&e.b!=='bb')||(e.b===k&&LID[e.a]&&e.a!=='bb'); }).filter(function(e){ return k==='bb' ? true : !(e.a==='bb'||e.b==='bb'); });
    if(k==='bb') peers=CX_E.filter(function(e){ return (e.a==='bb'&&LID[e.b])||(e.b==='bb'&&LID[e.a]); });
    sect('Ligação com Flávio', withF, k);
    if(!withF.length) body.appendChild(el('p','px-small','Sem ligação direta com Flávio documentada.'));
    sect('Via Jair ou Eduardo Bolsonaro', fam, k);
    sect('Com os outros governos', peers, k);
    var act=el('div','px-act');
    var a=el('button','px-map','Ver no mapa'); a.type='button'; a.onclick=function(){ cxPick(k); var w=$('cx-wrap'); if(w) w.scrollIntoView({behavior:'smooth',block:'start'}); }; act.appendChild(a);
    var bk=el('button','px-map px-back','↑ Voltar à lista'); bk.type='button'; bk.onclick=function(){ d.open=false; var l=$('px-fichas'); if(l) l.scrollIntoView({behavior:'smooth',block:'start'}); }; act.appendChild(bk);
    act.appendChild(imgBtn('Compartilhar imagem', function(){ return fichaCanvas(k); }, 'parca-'+k+'.png', n.full+' e Flávio'));
    body.appendChild(act);
    d.addEventListener('toggle', function(){ if(d.open){ [].slice.call(document.querySelectorAll('#px-fichas details.px-f')).forEach(function(o){ if(o!==d && o.open) o.open=false; }); } pxWho(); });
    d.appendChild(body); return d;
  }
  function pxOpenFicha(k){
    var d=$('parca-'+k); if(!d) return;
    [].slice.call(document.querySelectorAll('#px-fichas details.px-f')).forEach(function(o){ if(o!==d && o.open) o.open=false; });
    d.open=true; pxWho();
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var go=function(){
      var tb=document.querySelector('.topbar'), bar=$('pxbar'), who=$('pxbar-who');
      var off=(tb?tb.offsetHeight:60) + (bar && !bar.hidden ? bar.offsetHeight : 0) + (who && who.hidden ? 44 : 0) + 12;
      window.scrollTo({top: d.getBoundingClientRect().top + window.scrollY - off, behavior: reduce?'auto':'smooth'});
    };
    requestAnimationFrame(function(){ requestAnimationFrame(go); });
  }
  window.pxOpenFicha=pxOpenFicha;
  function pxWho(){ var w=$('pxbar-who'); if(!w) return; [].slice.call(w.children).forEach(function(b){ var d=$('parca-'+b.getAttribute('data-k')); b.setAttribute('aria-pressed', d && d.open ? 'true':'false'); }); }
  function pxBarUpdate(){
    var bar=$('pxbar'), panel=$('parcas-panel'), tb=document.querySelector('.topbar'); if(!bar||!panel) return;
    var h = tb ? tb.offsetHeight : 60;
    bar.style.top = h+'px';
    var on=false;
    if(!panel.hidden){ var r=panel.getBoundingClientRect(); on = r.top < h+40 && r.bottom > h+160; }
    bar.hidden=!on; document.body.classList.toggle('in-px', on);
    if(!on) return;
    var bh=bar.offsetHeight, cur='px-espectro';
    ['px-espectro','px-pilares','px-matriz','px-rede','px-quem','px-flavio'].forEach(function(id){ var e=$(id); if(e && e.getBoundingClientRect().top < h+bh+170) cur=id; });
    [].slice.call(bar.querySelectorAll('.pxbar-nav a')).forEach(function(a){ if(a.getAttribute('data-s')===cur){ a.setAttribute('aria-current','true'); if(a.scrollIntoView && bar.dataset.cur!==cur){ var nav=a.parentNode; nav.scrollLeft = a.offsetLeft - 12; } } else a.removeAttribute('aria-current'); });
    bar.dataset.cur=cur;
    var who=$('pxbar-who'); if(who) who.hidden = cur!=='px-quem';
  }
  window.addEventListener('scroll', function(){ pxBarUpdate(); }, {passive:true});
  window.addEventListener('resize', function(){ pxBarUpdate(); });
  function cxInit(){ pxInit(); pxBarUpdate(); var fs=$('fx-share'); if(fs && !fs.firstChild) fs.appendChild(imgBtn('Compartilhar imagem', flavioCanvas, 'flavio-mandatos.png', 'O que Flávio fez nos mandatos')); fxItemButtons(); }
  var cxZ = {k:1, x:500, y:345};
  function cxView(){
    var svg=$('cx-map'); if(!svg) return;
    var w=1000/cxZ.k, h=690/cxZ.k;
    cxZ.x=Math.max(w/2, Math.min(1000-w/2, cxZ.x)); cxZ.y=Math.max(h/2, Math.min(690-h/2, cxZ.y));
    svg.setAttribute('viewBox',(cxZ.x-w/2).toFixed(1)+' '+(cxZ.y-h/2).toFixed(1)+' '+w.toFixed(1)+' '+h.toFixed(1));
    $('cx-wrap').classList.toggle('zoomed', cxZ.k>1);
  }
  function cxZoom(f){ cxZ.k=Math.max(1, Math.min(3.5, cxZ.k*f)); if(cxSel && f>1){ var n=cxNode(cxSel); cxZ.x=n.x; cxZ.y=n.y; } cxView(); }
  function cxFocus(id){ var n=cxNode(id); if(n && cxZ.k>1){ cxZ.x=n.x; cxZ.y=n.y; cxView(); } }
  (function(){
    var zi=$('cx-zin'), zo=$('cx-zout'), zf=$('cx-zfit'), svg=$('cx-map');
    if(!svg) return;
    zi.addEventListener('click', function(){ cxZoom(1.4); });
    zo.addEventListener('click', function(){ cxZoom(1/1.4); });
    zf.addEventListener('click', function(){ cxZ={k:1,x:500,y:345}; cxView(); });
    var drag=null;
    svg.addEventListener('pointerdown', function(ev){ if(cxZ.k<=1) return; drag={x:ev.clientX,y:ev.clientY,cx:cxZ.x,cy:cxZ.y,moved:false}; });
    window.addEventListener('pointermove', function(ev){ if(!drag) return; var r=svg.getBoundingClientRect(); var sc=(1000/cxZ.k)/r.width; var dx=ev.clientX-drag.x, dy=ev.clientY-drag.y; if(Math.abs(dx)+Math.abs(dy)>4) drag.moved=true; cxZ.x=drag.cx-dx*sc; cxZ.y=drag.cy-dy*sc; cxView(); });
    window.addEventListener('pointerup', function(){ if(drag && drag.moved){ svg.dataset.dragged='1'; setTimeout(function(){ svg.dataset.dragged=''; },50); } drag=null; });
    svg.addEventListener('wheel', function(ev){ if(!ev.ctrlKey) return; ev.preventDefault(); cxZoom(ev.deltaY<0?1.15:1/1.15); }, {passive:false});
  })();
  /* ---------- últimas notícias (mais recente primeiro) ---------- */
  var NEWS = PD.NEWS;
  var MESES=['jan.','fev.','mar.','abr.','maio','jun.','jul.','ago.','set.','out.','nov.','dez.'];
  function fdate(iso){ var p=iso.split('-'); return parseInt(p[2],10)+' '+MESES[parseInt(p[1],10)-1]+' '+p[0]; }
  var ALERTA={regras:'Regras do jogo',inimigo:'Adversário como inimigo',violencia:'Violência',liberdades:'Liberdades'};
  var newsOnlyAlert=false, newsOnlyRules=false;
  function alertChips(n, box){ (n.alerta||[]).forEach(function(k){ var c=el('span','alerta a-'+k,'⚠ '+ALERTA[k]); c.title='Ver todos os sinais com o alerta '+ALERTA[k]; c.setAttribute('data-palerta',k); pillA(c,c.title); box.appendChild(c); }); }
  function newsFilterUI(){
    var ul=$('news-list'); if(!ul || $('news-alert')) return;
    var box=el('div','news-alert'); box.id='news-alert';
    var n=NEWS.filter(function(x){ return x.alerta && x.alerta.length; }).length;
    var d=document.createElement('details'); d.className='alert-legend';
    var sm=document.createElement('summary'); sm.textContent='O que são os sinais de alerta democrático (⚠)'; d.appendChild(sm);
    d.appendChild(el('p','','Quatro indicadores de comportamento autoritário usados na ciência política, a partir de Steven Levitsky e Daniel Ziblatt (“Como as democracias morrem”, 2018). Valem para qualquer governo ou lado político. Nem todo sinal recebe rótulo: só os que tocam um destes critérios.'));
    var dl=el('ul','alert-defs');
    [['regras','não aceitar eleições ou decisões da Justiça, sugerir ruptura, mudar as regras para controlar quem arbitra o jogo.'],
     ['inimigo','tratar o oponente como criminoso, traidor ou ameaça, ou acusá-lo sem prova.'],
     ['violencia','incentivar, tolerar ou glorificar a violência, inclusive a do Estado, ou enfraquecer o controle sobre ela.'],
     ['liberdades','restringir imprensa, oposição, cultura, ciência ou crítica.']].forEach(function(x){ var li=el('li',''); li.appendChild(el('span','alerta a-'+x[0],'⚠ '+ALERTA[x[0]])); li.appendChild(document.createTextNode(' '+x[1])); dl.appendChild(li); });
    d.appendChild(dl); box.appendChild(d);
    var b=el('button','news-only','Só sinais de alerta ('+n+')'); b.type='button'; b.setAttribute('aria-pressed','false');
    b.addEventListener('click',function(){ newsOnlyAlert=!newsOnlyAlert; b.setAttribute('aria-pressed',newsOnlyAlert?'true':'false'); b.textContent=newsOnlyAlert?'Ver todos os sinais':'Só sinais de alerta ('+n+')'; renderNews(); });
    var nr=NEWS.filter(function(x){ return (x.tags||[]).indexOf('Eleições e regras')>=0; }).length;
    var b2=el('button','news-only news-rules','Eleições e regras ('+nr+')'); b2.type='button'; b2.setAttribute('aria-pressed','false');
    b2.addEventListener('click',function(){ newsOnlyRules=!newsOnlyRules; b2.setAttribute('aria-pressed',newsOnlyRules?'true':'false'); b2.textContent=newsOnlyRules?'Ver todos os sinais':'Eleições e regras ('+nr+')'; renderNews(); });
    box.appendChild(b); box.appendChild(b2);
    ul.parentNode.insertBefore(box, ul);
  }
  function renderNews(){
    var ul=$('news-list'); if(!ul) return;
    newsFilterUI();
    ul.innerHTML='';
    NEWS.filter(function(n){ return (!newsOnlyAlert || (n.alerta&&n.alerta.length)) && (!newsOnlyRules || (n.tags||[]).indexOf('Eleições e regras')>=0); }).slice().sort(function(a,b){ return a.d<b.d?1:(a.d>b.d?-1:0); }).forEach(function(n){
      var li=el('li','item news');
      var hd=el('div','news-hd'); if(n.n) hd.appendChild(el('span','news-n','Sinal '+n.n)); if(n.tipo) hd.appendChild(el('span','news-k'+(n.tipo==='Você sabia?'?' vs':''),n.tipo)); hd.appendChild(el('time','news-d',ndate(n))); hd.lastChild.setAttribute('datetime',n.d);
      (n.tags||[]).forEach(function(t){ var tg=el('span','tag',t); tg.setAttribute('data-ptag',t); pillA(tg,'Buscar tudo sobre '+t); hd.appendChild(tg); });
      alertChips(n, hd);
      li.appendChild(hd);
      li.appendChild(el('p','news-t',n.t));
      li.appendChild(el('p','news-s',n.s));
      if(n.why){ var w=el('p','news-w'); w.appendChild(el('b','',(n.wl||'Por que ler:')+' ')); w.appendChild(document.createTextNode(n.why)); li.appendChild(w); }
      var ft=el('div','ifoot'); var sp=el('span','srcs', n.tipo==='Vídeo' ? 'Assistir em: ' : (n.tipo==='Podcast' ? 'Ouvir em: ' : 'Ler em: '));
      n.src.forEach(function(sr,ix){ if(ix) sp.appendChild(document.createTextNode('; ')); var a=el('a','',sr[0]); a.href=sr[1]; a.target='_blank'; a.rel='noopener noreferrer'; sp.appendChild(a); });
      ft.appendChild(sp); var acts=el('div','iacts'); ft.appendChild(acts); acts.appendChild(copyBtn(function(){ return newsText(n); })); acts.appendChild(imgBtn('Imagem', function(){ return newsCanvas(n); }, 'sinal-'+n.d+'-'+slug(n.t)+'.png', n.t)); li.appendChild(ft); ul.appendChild(li);
    });
    var tz=$('tz-noticias');
    if(tz){ var last=NEWS.slice().sort(function(a,b){ return a.d<b.d?1:(a.d>b.d?-1:0); })[0]; tz.textContent = 'Últimas notícias que devem chamar nossa atenção.'; }
  }
  function render(){
    syncSelects();
    renderResult();
    var pdc=$('pandemia'); if(pdc) pdc.hidden = !(state.picked && state.g==='saude'); [].slice.call(document.querySelectorAll('.pd-go')).forEach(function(a){ a.hidden = pdc ? pdc.hidden : true; });
    renderMatrix();
    teasers();
    var rs = $('result'); if(rs) rs.classList.toggle('nopick', !state.picked);
    var nv = $('nav'); if(nv) nv.classList.toggle('nopick', !state.picked);
    if($('pb-g')){ $('pb-g').textContent = state.g==='all' ? 'Todas' : gname(state.g); $('pb-c').textContent = state.c==='all' ? 'Todos' : cname(state.c); }
    if(typeof pickbarUpdate==='function') pickbarUpdate();
  }
  function pickbarUpdate(){
    var pb=$('pickbar'), tf=$('tf'), rs=$('result'), tb=document.querySelector('.topbar'); if(!pb||!tf||!rs) return;
    var h = tb ? tb.offsetHeight : 60;
    pb.style.top = h + 'px';
    var show = tf.getBoundingClientRect().bottom < h;
    pb.classList.toggle('is-pick', !!state.picked);
    pb.classList.toggle('no-pick', !state.picked);
    if(show === !pb.hidden) return;
    pb.hidden = !show;
  }
  window.addEventListener('scroll', function(){ pickbarUpdate(); }, {passive:true});
  window.addEventListener('resize', function(){ pickbarUpdate(); });
  function mxFade(){
    var sc = $('mx-scroll'), wr = $('mx-wrap'), h = $('mx-hint');
    if(!sc) return;
    var over = sc.scrollWidth > sc.clientWidth + 4;
    var atEnd = sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 4;
    wr.classList.toggle('more-r', over && !atEnd);
    wr.classList.toggle('more-l', sc.scrollLeft > 4);
    if(h) h.hidden = !over;
  }
  initSelects();
  makeBlock('observatorio','h2','Ler o texto');
  if($('tz-observatorio')) $('tz-observatorio').textContent='Por que o painel continua depois da eleição: como olhamos, o que observamos e o que não fazemos.';
  makeBlock('noticias','h2','Ver seleção');
  makeBlock('visao-geral','h2','Ver tabela');
  makeBlock('democracia','h2','Ver ranking');
  makeBlock('informacoes','h2','Ver informações');
  render();
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if(!a) return;
    var t = document.getElementById(a.getAttribute('href').slice(1));
    if(t) openFor(t);
  }, true);
  (function(){ var sc=$('mx-scroll'); if(sc){ sc.addEventListener('scroll', mxFade, {passive:true}); window.addEventListener('resize', function(){ renderMatrix(); mxFade(); }); setTimeout(mxFade,50); } })();
  buildSources();
  teasers();
  renderNews();
  function fitTitle(){
    var h = document.querySelector('header h1');
    if(!h || !h.parentElement || h.classList.contains('hl-t')) return;
    var box = h.parentElement;
    h.style.display = 'inline-block';
    h.style.fontSize = '100px';
    var w = h.getBoundingClientRect().width;
    h.style.display = '';
    var avail = box.getBoundingClientRect().width;
    if(!(w > 0) || !(avail > 0)){ h.style.fontSize = ''; return; }
    var size = Math.min(120, (avail / w) * 100 * 0.985);
    h.style.fontSize = size.toFixed(2) + 'px';
  }
  fitTitle();
  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(fitTitle); }
  window.addEventListener('load', fitTitle);
  var __ft;
  window.addEventListener('resize', function(){ clearTimeout(__ft); __ft = setTimeout(fitTitle, 80); });
  /* ---------- menu fixo, hambúrguer e destaque da seção atual ---------- */
  (function(){
    var burger = document.getElementById('burger'), nav = document.getElementById('nav');
    if(!burger || !nav) return;
    var links = [].slice.call(nav.querySelectorAll('a[href^="#"]'));
    function setOpen(o){
      nav.classList.toggle('open', o);
      burger.setAttribute('aria-expanded', o ? 'true' : 'false');
      burger.setAttribute('aria-label', o ? 'Fechar menu' : 'Abrir menu');
    }
    burger.addEventListener('click', function(){ setOpen(!nav.classList.contains('open')); });
    [].slice.call(nav.querySelectorAll('a')).forEach(function(a){ a.addEventListener('click', function(){ setOpen(false); }); });
    [].slice.call(document.querySelectorAll('[data-top]')).forEach(function(a){
      a.addEventListener('click', function(e){
        e.preventDefault();
        setOpen(false);
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({top:0, behavior: reduce ? 'auto' : 'smooth'});
      });
    });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape' && nav.classList.contains('open')){ setOpen(false); burger.focus(); } });
    document.addEventListener('click', function(e){ if(nav.classList.contains('open') && !nav.contains(e.target) && !burger.contains(e.target)) setOpen(false); });
    var ids = links.map(function(a){ return a.getAttribute('href').slice(1); });
    var tick = false;
    function spy(){
      tick = false;
      var hdr = document.querySelector('.topbar').getBoundingClientRect().height;
      var cur = null;
      ids.forEach(function(id){
        var t = document.getElementById(id);
        if(t && t.getBoundingClientRect().top <= hdr + 90) cur = id;
      });
      if((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 4) cur = ids[ids.length-1];
      links.forEach(function(a){
        if(cur && a.getAttribute('href')==='#'+cur) a.setAttribute('aria-current','true'); else a.removeAttribute('aria-current');
      });
    }
    window.addEventListener('scroll', function(){ if(!tick){ tick = true; requestAnimationFrame(spy); } }, {passive:true});
    window.addEventListener('resize', spy);
    spy();
  })();
  var tabs=[
    {t:document.getElementById('legend-toggle'),b:document.getElementById('legend-body'),p:document.getElementById('legend-panel'),a:document.getElementById('legenda'),on:'Fechar legenda',off:'Abrir legenda'},
    {t:document.getElementById('parcas-toggle'),b:document.getElementById('parcas-body'),p:document.getElementById('parcas-panel'),a:document.getElementById('parcas'),on:'Fechar',off:'Abrir'}
  ];
  cxInit();
  /* ---------- ranking como imagem ---------- */
  function rankData(){
    var keys = GROUPS.map(function(g){ return {k:g.k,n:g.n}; }).concat(THEMES.map(function(t){ return {k:t.k,n:t.n}; }));
    var d = keys.map(function(x){ var t = tally(state.c, x.k); return {n:x.n,contra:t.contra,pro:t.pro}; });
    d.sort(function(a,b){ return (b.contra-a.contra) || (a.pro-b.pro) || a.n.localeCompare(b.n,'pt-BR'); });
    return d;
  }
  function rankCanvas(){
    var d = rankData();
    var W=1080, P=64, rowH=74, OFF=100, FOOTH=118, top=310+OFF, H=top + d.length*rowH + 120 + FOOTH;
    var c=document.createElement('canvas'); c.width=W; c.height=H;
    var g=c.getContext('2d');
    var SANS="'Public Sans', 'Segoe UI', Arial, sans-serif", HEAD="'Bricolage Grotesque','Public Sans','Segoe UI',Arial,sans-serif";
    g.fillStyle='#F4F6F8'; g.fillRect(0,0,W,H);
    shareHead(g, W, P, 210);
    shareDate(g, W, P, 145+OFF, SANS);
    var cc=null; ALLC.forEach(function(x){ if(x.k===state.c) cc=x; });
    var ttl = cc ? cc.n : 'Todos os governos';
    var sub = cc ? (cc.ctrl ? 'Brasil, 2023 a 2025 · comparação' : (cc.k==='pl' ? 'Polônia sob o PiS, 2015 a 2023' : cc.p+', '+cc.s)) : 'Ações de governos da direita radical e extrema';
    g.textBaseline='alphabetic';
    g.fillStyle='#4A5663'; g.font='700 20px '+SANS; g.fillText('RANKING DAS PAUTAS', P, 152+OFF);
    var tfs=52; g.font='800 '+tfs+'px '+HEAD; while(g.measureText(ttl).width>W-2*P && tfs>30){ tfs--; g.font='800 '+tfs+'px '+HEAD; }
    g.fillStyle='#1A2430'; g.fillText(ttl, P, 204+OFF);
    g.fillStyle='#4A5663'; g.font='500 27px '+SANS; g.fillText(sub, P, 244+OFF);
    var nameW=390, bx=P+nameW, bw=W-P-bx, mid=bx+bw/2, sc=1;
    d.forEach(function(r){ sc=Math.max(sc,r.contra,r.pro); });
    g.font='700 22px '+SANS; g.fillStyle='#A64A08'; g.textAlign='left'; g.fillText('Ações contra', bx, top-20);
    g.fillStyle='#0B6B8F'; g.textAlign='right'; g.fillText('Ações a favor', bx+bw, top-20); g.textAlign='left';
    d.forEach(function(r,i){
      var y=top+i*rowH+rowH/2;
      g.fillStyle = i<3 && r.contra>0 ? '#C2570C' : '#FFFFFF';
      g.beginPath(); g.arc(P+20,y,20,0,Math.PI*2); g.fill();
      if(!(i<3 && r.contra>0)){ g.strokeStyle='#D3DAE1'; g.lineWidth=2; g.stroke(); }
      g.fillStyle = i<3 && r.contra>0 ? '#1A2430' : '#4A5663'; g.font='800 20px '+SANS; g.textAlign='center'; g.textBaseline='middle'; g.fillText(String(i+1), P+20, y+1);
      g.textAlign='left'; g.fillStyle='#1A2430'; var fs=27; g.font='700 '+fs+'px '+SANS; while(g.measureText(r.n).width > nameW-76 && fs>16){ fs--; g.font='700 '+fs+'px '+SANS; } g.fillText(r.n, P+56, y);
      var bh=34, rr=17;
      g.fillStyle='#D3DAE1'; roundRect(g,bx,y-bh/2,bw,bh,rr); g.fill();
      var wl=r.contra>0?Math.max(26,r.contra/sc*(bw/2)):0, wr=r.pro>0?Math.max(26,r.pro/sc*(bw/2)):0;
      if(wl){ g.fillStyle='#C2570C'; roundRect(g,mid-wl,y-bh/2,wl,bh,{tl:rr,bl:rr,tr:0,br:0}); g.fill(); }
      if(wr){ g.fillStyle='#0B6B8F'; roundRect(g,mid,y-bh/2,wr,bh,{tl:0,bl:0,tr:rr,br:rr}); g.fill(); }
      g.fillStyle='#1A2430'; g.fillRect(mid-1.5,y-bh/2-5,3,bh+10);
      g.font='800 21px '+SANS; g.textAlign='right'; g.fillStyle = wl ? '#FFFFFF' : '#4A5663'; g.fillText(String(r.contra), mid-10, y+1);
      g.textAlign='left'; g.fillStyle = wr ? '#FFFFFF' : '#4A5663'; g.fillText(String(r.pro), mid+10, y+1);
    });
    var fy=top+d.length*rowH+56;
    g.textBaseline='alphabetic'; g.fillStyle='#4A5663'; g.font='500 22px '+SANS;
    g.fillText('Cada ação vale 1, sem peso por gravidade. Uma ação pode valer para mais de uma pauta.', P, fy);
    g.fillText('Mede o que foi documentado. Fonte de cada ação no painel.', P, fy+34);
    shareFoot(g, W, H, P, FOOTH, SANS);
    return c;
  }
  function roundRect(g,x,y,w,h,r){
    if(typeof r==='number') r={tl:r,tr:r,br:r,bl:r};
    g.beginPath(); g.moveTo(x+r.tl,y); g.lineTo(x+w-r.tr,y); g.quadraticCurveTo(x+w,y,x+w,y+r.tr);
    g.lineTo(x+w,y+h-r.br); g.quadraticCurveTo(x+w,y+h,x+w-r.br,y+h); g.lineTo(x+r.bl,y+h);
    g.quadraticCurveTo(x,y+h,x,y+h-r.bl); g.lineTo(x,y+r.tl); g.quadraticCurveTo(x,y,x+r.tl,y); g.closePath();
  }
  function wrapText(g, text, maxW){
    var words = String(text).split(/\s+/), lines = [], cur = '';
    words.forEach(function(w){
      var t = cur ? cur+' '+w : w;
      if(g.measureText(t).width > maxW && cur){ lines.push(cur); cur = w; } else cur = t;
    });
    if(cur) lines.push(cur);
    return lines;
  }
  function sumCanvas(){
    var W=1080, P=64, HEADH=210, FOOTH=118;
    var SANS="'Public Sans', 'Segoe UI', Arial, sans-serif", HEAD="'Bricolage Grotesque','Public Sans','Segoe UI',Arial,sans-serif";
    var INK='#1A2430', MUT='#4A5663', CON='#C2570C', CONI='#A64A08', PRO='#0B6B8F';
    var t = tally(state.c, state.g);
    var items = pick(state.c, state.g, A), nd = items.filter(function(i){ return i.disc; }).length;
    var cc=null; ALLC.forEach(function(x){ if(x.k===state.c) cc=x; });
    var pauta = state.g==='all' ? 'Todas as pautas' : gname(state.g);
    var who = !cc ? 'Ações de governos da direita radical e extrema' : (cc.ctrl ? 'Ações do governo Lula, 2023 a 2025 (comparação)' : ('Ações '+(cc.k==='pl'?'do ':'de ')+cc.n+' · '+cc.p+', '+cc.s));
    var note = nd ? '* '+nd+(nd===1?' ação discutível: veja os dois lados no painel':' ações discutíveis: veja os dois lados no painel') : '';
    var mc = document.createElement('canvas').getContext('2d');
    function fit(ctx, txt, weight, size, min, fam, maxW){ ctx.font=weight+' '+size+'px '+fam; while(ctx.measureText(txt).width>maxW && size>min){ size--; ctx.font=weight+' '+size+'px '+fam; } return size; }
    var maxW=W-2*P;
    var fs=fit(mc,pauta,'800',112,56,HEAD,maxW);
    var ws=fit(mc,who,'600',40,28,SANS,maxW);
    /* alturas dos blocos, de cima para baixo */
    /* tamanho único para os dois números, cabendo cada um (com asterisco) na sua metade */
    var dC=items.some(function(i){ return i.disc && i.s!=='pro'; }), dP=items.some(function(i){ return i.disc && i.s==='pro'; });
    var NS=300, half=maxW/2;
    function need(v, star, sz){ mc.font='800 '+sz+'px '+HEAD; var w=mc.measureText(String(v)).width; if(star){ mc.font='800 '+Math.round(sz*.47)+'px '+HEAD; w+=mc.measureText('*').width; } return w; }
    while(NS>120 && (need(t.contra,dC,NS)>half-40 || need(t.pro,dP,NS)>half-40)) NS-=4;
    var TOP=72, KICK=58, GAP1=fs+22, GAP2=ws+26, NUM=Math.round(NS*.76)+72, LAB=74, GAPT=50, BAR=44, NOTE=note?88:0, BOT=note?52:72;
    var H = HEADH+TOP+KICK+GAP1+GAP2+NUM+LAB+GAPT+BAR+NOTE+BOT+FOOTH;
    var c=document.createElement('canvas'); c.width=W; c.height=H;
    var g=c.getContext('2d');
    g.fillStyle='#EEF1F4'; g.fillRect(0,0,W,H);
    /* cabeçalho */
    shareHead(g, W, P, HEADH);
    var x=P, y=HEADH+TOP;
    shareDate(g, W, P, y+21, SANS);
    /* selo: piorou, melhorou ou indefinido, na cor do lado que predomina */
    var kick = t.contra>t.pro ? 'PIOROU' : (t.pro>t.contra ? 'MELHOROU' : 'INDEFINIDO'), kcol = t.contra>t.pro ? CONI : (t.pro>t.contra ? PRO : MUT);
    g.textBaseline='middle'; g.font='800 38px '+SANS; var kw=g.measureText(kick).width;
    g.fillStyle=kcol; roundRect(g, x-14, y-8, kw+28, 58, 10); g.fill();
    g.fillStyle='#fff'; g.fillText(kick, x, y+22);
    g.textBaseline='alphabetic';
    y+=KICK+fs; g.fillStyle=INK; g.font='800 '+fs+'px '+HEAD; g.fillText(pauta, x, y);
    y+=GAP2+4; g.fillStyle=MUT; g.font='600 '+ws+'px '+SANS; g.fillText(who, x, y);
    /* números */
    y+=NUM;
    function big(v, xx, col, star){ g.font='800 '+NS+'px '+HEAD; g.fillStyle=col; g.fillText(String(v), xx-8, y); if(star){ var w=g.measureText(String(v)).width; g.font='800 '+Math.round(NS*.47)+'px '+HEAD; g.fillText('*', xx+w-8, y-Math.round(NS*.47)); } }
    big(t.contra, x, CONI, dC); big(t.pro, x+half, PRO, dP);
    y+=LAB-10; g.font='700 52px '+SANS; g.fillStyle=CONI; g.fillText(t.contra===1?'piorou':'pioraram', x, y);
    g.fillStyle=PRO; g.fillText(t.pro===1?'melhorou':'melhoraram', x+half, y);
    /* termômetro */
    y+=GAPT+10; var bh=BAR, mid=x+maxW/2;
    g.fillStyle='#DDE3E9'; roundRect(g,x,y,maxW,bh,bh/2); g.fill();
    function sw(v){ return (t.total && v>0) ? Math.max(0.04, v/t.total)*(maxW/2) : 0; }
    var wl=sw(t.contra), wr=sw(t.pro);
    if(wl){ g.fillStyle=CON; roundRect(g,mid-wl,y,wl,bh,{tl:bh/2,bl:bh/2,tr:0,br:0}); g.fill(); }
    if(wr){ g.fillStyle=PRO; roundRect(g,mid,y,wr,bh,{tl:0,bl:0,tr:bh/2,br:bh/2}); g.fill(); }
    g.fillStyle=INK; g.fillRect(mid-3,y-10,6,bh+20);
    y+=bh;
    /* nota de ações discutíveis */
    if(note){ y+=NOTE-30; var ns=fit(g,note,'600',32,24,SANS,maxW); g.fillStyle=INK; g.font='600 '+ns+'px '+SANS; g.fillText(note, x, y); }
    /* rodapé */
    shareFoot(g, W, H, P, FOOTH, SANS);
    return c;
  }
  function imgShare(btId, msgId, makeCanvas, fname, title){
    var bt=$(btId), msg=$(msgId); if(!bt) return;
    var mobile = window.matchMedia && window.matchMedia('(pointer:coarse)').matches;
    var canShareFiles = !!(navigator.canShare && window.File);
    if(mobile && canShareFiles) bt.textContent = bt.textContent.replace(/^Copiar/, 'Compartilhar');
    function say(t){ msg.textContent=t; clearTimeout(say.t); say.t=setTimeout(function(){ msg.textContent=''; }, 4000); }
    var dlp = (window.claude && window.claude.use) ? window.claude.use('downloads') : Promise.resolve(null);
    function download(blob){
      Promise.resolve(dlp).then(function(dl){
        if(dl){ return dl.save({filename: fname(), data: blob}).then(function(){ say('Imagem salva.'); }).catch(function(err){ if(err && err.code==='declined') return; say('Não foi possível salvar a imagem aqui.'); }); }
        var u=URL.createObjectURL(blob), a=document.createElement('a'); a.href=u; a.download=fname();
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(u); }, 2000);
        say('Imagem baixada.');
      });
    }
    bt.addEventListener('click', function(){
      var go=function(){
        makeCanvas().toBlob(function(blob){
          if(!blob){ say('Não foi possível gerar a imagem.'); return; }
          var file; try{ file=new File([blob], fname(), {type:'image/png'}); }catch(e){}
          if(mobile && file && navigator.canShare && navigator.canShare({files:[file]})){
            navigator.share({files:[file], title:title(), text:BRAND+': '+PANEL_URL}).then(function(){ say('Imagem compartilhada.'); }).catch(function(err){ if(err && err.name==='AbortError') return; download(blob); });
            return;
          }
          if(navigator.clipboard && window.ClipboardItem && window.isSecureContext){
            navigator.clipboard.write([new ClipboardItem({'image/png': blob})]).then(function(){ say('Imagem copiada. É só colar.'); }).catch(function(){ download(blob); });
          } else download(blob);
        }, 'image/png');
      };
      if(document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
    });
  }
  window.__sumCanvas = sumCanvas;
  /* ---------- Imagens para compartilhar: Sinais, fichas dos parças e Flávio ---------- */
  function shareCanvasOut(makeCanvas, fname, title, say){
    var mobile = window.matchMedia && window.matchMedia('(pointer:coarse)').matches;
    function download(blob){
      var dlp = (window.claude && window.claude.use) ? window.claude.use('downloads') : Promise.resolve(null);
      Promise.resolve(dlp).then(function(dl){
        if(dl){ return dl.save({filename: fname, data: blob}).then(function(){ say('Imagem salva.'); }).catch(function(err){ if(err && err.code==='declined') return; say('Não foi possível salvar a imagem aqui.'); }); }
        var u=URL.createObjectURL(blob), a=document.createElement('a'); a.href=u; a.download=fname;
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(u); }, 2000);
        say('Imagem baixada.');
      });
    }
    var go=function(){
      makeCanvas().toBlob(function(blob){
        if(!blob){ say('Não foi possível gerar a imagem.'); return; }
        var file; try{ file=new File([blob], fname, {type:'image/png'}); }catch(e){}
        if(mobile && file && navigator.canShare && navigator.canShare({files:[file]})){
          navigator.share({files:[file], title:title, text:BRAND+': '+PANEL_URL}).then(function(){ say('Imagem compartilhada.'); }).catch(function(err){ if(err && err.name==='AbortError') return; download(blob); });
          return;
        }
        if(navigator.clipboard && window.ClipboardItem && window.isSecureContext){
          navigator.clipboard.write([new ClipboardItem({'image/png': blob})]).then(function(){ say('Imagem copiada. É só colar.'); }).catch(function(){ download(blob); });
        } else download(blob);
      }, 'image/png');
    };
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  }
  function imgBtn(label, makeCanvas, fname, title){
    var wrap=el('span','imgsh');
    var b=el('button','cp imgbt',label); b.type='button';
    var mobile = window.matchMedia && window.matchMedia('(pointer:coarse)').matches;
    b.setAttribute('aria-label', (mobile?'Compartilhar':'Copiar')+' como imagem');
    var msg=el('span','imgmsg',''); msg.setAttribute('aria-live','polite');
    function say(t){ msg.textContent=t; clearTimeout(say.t); say.t=setTimeout(function(){ msg.textContent=''; }, 4000); }
    b.addEventListener('click', function(){ shareCanvasOut(makeCanvas, typeof fname==='function'?fname():fname, title, say); });
    wrap.appendChild(b); wrap.appendChild(msg); return wrap;
  }
  var CARD = {W:1080, P:72, HEAD:"'Bricolage Grotesque','Public Sans','Segoe UI',Arial,sans-serif", SANS:"'Public Sans', 'Segoe UI', Arial, sans-serif", INK:'#1A2430', MUT:'#4A5663', NAVY:'#0A1A3F', BLUE:'#1A73C8', CON:'#A64A08', BG:'#EEF1F4'};
  function wrapLines(g, txt, maxW){
    var words=String(txt||'').split(/\s+/), lines=[], cur='';
    words.forEach(function(w){ var t=cur?cur+' '+w:w; if(g.measureText(t).width>maxW && cur){ lines.push(cur); cur=w; } else cur=t; });
    if(cur) lines.push(cur); return lines;
  }
  /* blocks: [{t:'kicker'|'title'|'text'|'label'|'chips'|'nums'|'small', ...}] */
  function cardCanvas(blocks, noDate){
    var W=CARD.W, P=CARD.P, maxW=W-2*P, HEADH=210, FOOTH=118, MAXH=1420;
    var m=document.createElement('canvas').getContext('2d');
    var plan=[], y=HEADH+70;
    function add(item,h){ plan.push({it:item,y:y}); y+=h; }
    blocks.forEach(function(b){
      if(b.t==='kicker'){ add(b, 58+22); }
      else if(b.t==='title'){ m.font='800 '+(b.size||64)+'px '+CARD.HEAD; b.lines=wrapLines(m,b.v,maxW).slice(0,b.max||4); var lh=Math.round((b.size||64)*1.12); add(b, b.lines.length*lh+26); b.lh=lh; }
      else if(b.t==='text'||b.t==='small'||b.t==='label'){ var sz=b.size||(b.t==='small'?28:(b.t==='label'?30:34)); var wt=b.t==='label'?'800':(b.weight||'500'); m.font=wt+' '+sz+'px '+CARD.SANS; var pre=b.lead?b.lead+' ':''; b.lines=wrapLines(m,pre+b.v,maxW); b.sz=sz; b.wt=wt; b.lh=Math.round(sz*1.42); add(b, 0); }
      else if(b.t==='chips'){ m.font='700 28px '+CARD.SANS; var x=0, rows=1; b.v.forEach(function(c){ var w=m.measureText(c.v).width+40; if(x+w>maxW){ rows++; x=0; } x+=w+12; }); add(b, rows*58+18); }
      else if(b.t==='nums'){ add(b, 190); }
      else if(b.t==='gap'){ y+=(b.v||20); }
    });
    /* texto: limitar ao espaço restante */
    var free = MAXH - FOOTH - 50;
    y=HEADH+70; plan.forEach(function(p){ p.y=y; var b=p.it;
      if(b.t==='text'||b.t==='small'||b.t==='label'){ var room=Math.floor((free-y)/b.lh); if(b.maxl) room=Math.min(room,b.maxl); if(b.lines.length>room){ b.lines=b.lines.slice(0,Math.max(room,0)); if(b.lines.length){ var L=b.lines.length-1; b.lines[L]=b.lines[L].replace(/[,.;:]?\s*\S*$/,'')+'…'; } } y+=b.lines.length*b.lh+(b.t==='label'?6:22); }
      else if(b.t==='kicker') y+=80; else if(b.t==='title') y+=b.lines.length*b.lh+26; else if(b.t==='chips'){ m.font='700 28px '+CARD.SANS; var x=0, rows=1; b.v.forEach(function(c){ var w=m.measureText(c.v).width+40; if(x+w>maxW){ rows++; x=0; } x+=w+12; }); y+=rows*58+18; } else if(b.t==='nums') y+=190; else if(b.t==='gap') y+=(b.v||20);
    });
    var H=Math.max(1080, Math.min(MAXH, y+40+FOOTH));
    var c=document.createElement('canvas'); c.width=W; c.height=H; var g=c.getContext('2d');
    g.fillStyle=CARD.BG; g.fillRect(0,0,W,H);
    shareHead(g, W, P, HEADH);
    (function(){ var kb=blocks.filter(function(b){ return b.t==='kicker'; })[0], kw=0; if(kb){ g.font='800 30px '+CARD.SANS; kw=g.measureText(kb.v).width+14; } g.font='600 26px '+CARD.SANS; var dw=g.measureText('24 de setembro 2026').width; if(!noDate && P+kw+40+dw <= W-P) shareDate(g, W, P, HEADH+70+26, CARD.SANS); })();
    g.textBaseline='middle';
    plan.forEach(function(p){ var b=p.it, yy=p.y;
      if(b.t==='kicker'){ g.font='800 30px '+CARD.SANS; var kw=g.measureText(b.v).width; g.fillStyle=b.color||CARD.BLUE; roundRect(g,P-14,yy,kw+28,52,10); g.fill(); g.fillStyle='#fff'; g.fillText(b.v,P,yy+27); }
      else if(b.t==='title'){ g.textBaseline='alphabetic'; g.fillStyle=CARD.INK; g.font='800 '+(b.size||64)+'px '+CARD.HEAD; b.lines.forEach(function(l,i){ g.fillText(l,P,yy+(i+1)*b.lh-Math.round(b.lh*0.18)); }); g.textBaseline='middle'; }
      else if(b.t==='text'||b.t==='small'||b.t==='label'){ g.textBaseline='alphabetic'; g.fillStyle=b.color||(b.t==='text'?CARD.INK:CARD.MUT); g.font=b.wt+' '+b.sz+'px '+CARD.SANS;
        b.lines.forEach(function(l,i){ var by=yy+(i+1)*b.lh-Math.round(b.lh*0.28);
          if(i===0 && b.lead && l.indexOf(b.lead)===0){ g.font='800 '+b.sz+'px '+CARD.SANS; g.fillText(b.lead,P,by); var lw=g.measureText(b.lead+' ').width; g.font=b.wt+' '+b.sz+'px '+CARD.SANS; g.fillText(l.slice(b.lead.length+1),P+lw,by); }
          else g.fillText(l,P,by); });
        g.textBaseline='middle'; }
      else if(b.t==='chips'){ g.font='700 28px '+CARD.SANS; var x=P, y2=yy; b.v.forEach(function(ch){ var w=g.measureText(ch.v).width+40; if(x+w>W-P){ x=P; y2+=58; } if(ch.fill){ g.fillStyle=ch.color||CARD.CON; roundRect(g,x,y2,w,46,23); g.fill(); g.fillStyle='#fff'; } else { g.strokeStyle=ch.color||CARD.CON; g.lineWidth=3; roundRect(g,x+1.5,y2+1.5,w-3,43,21.5); g.stroke(); g.fillStyle=ch.color||CARD.CON; } g.fillText(ch.v,x+20,y2+24); x+=w+12; }); }
      else if(b.t==='nums'){ var n=b.v.length, cw=(W-2*P-(n-1)*16)/n; b.v.forEach(function(it,i){ var x=P+i*(cw+16); g.fillStyle='#fff'; roundRect(g,x,yy,cw,170,16); g.fill(); g.fillStyle=CARD.INK; g.font='800 54px '+CARD.HEAD; g.textBaseline='alphabetic'; g.fillText(it.n,x+22,yy+72); g.fillStyle=CARD.MUT; g.font='600 23px '+CARD.SANS; wrapLines(g,it.l,cw-40).slice(0,3).forEach(function(l,j){ g.fillText(l,x+22,yy+108+j*28); }); g.textBaseline='middle'; }); }
    });
    shareFoot(g, W, H, P, FOOTH, CARD.SANS);
    return c;
  }
  function slug(t){ return String(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,50); }
  function actionCanvas(i){
    var cc=null; ALLC.forEach(function(x){ if(x.k===i.c) cc=x; });
    var pro=i.s==='pro', col=pro?'#0B6B8F':CARD.CON;
    var gs=(i.gs||[i.g]).map(gname).join(' · ');
    var who=!cc ? cname(i.c) : (cc.ctrl ? 'Governo Lula (comparação)' : cc.n+' · '+cc.p);
    var note=i.note||'', lead='Outro lado:';
    if(i.disc){ lead='* Discutível:'; note=note.replace(/^Discut[íi]vel[:.,]?\s*/i,''); note=note.charAt(0).toUpperCase()+note.slice(1); }
    var srcs=splitSrc(i.src).map(function(x){ return baseName(x.trim()); }).filter(Boolean);
    var uniq=[]; srcs.forEach(function(x){ if(uniq.indexOf(x)<0) uniq.push(x); }); if(!uniq.length) (i.links||[]).forEach(function(l){ var nm=l&&l[0]; if(nm && uniq.indexOf(nm)<0) uniq.push(nm); });
    /* maior fonte em que o texto inteiro cabe no espaço do card */
    var mc=document.createElement('canvas').getContext('2d'), room=note?600:720, size=76, lines;
    for(;size>34;size-=2){ mc.font='800 '+size+'px '+CARD.HEAD; lines=wrapLines(mc,i.t,CARD.W-2*CARD.P).length; if(lines*Math.round(size*1.12)<=room) break; }
    var bl=[
      {t:'kicker', v:(pro?'AÇÃO A FAVOR':'AÇÃO CONTRA')+' · '+gs.toUpperCase(), color:col},
      {t:'small', v:who+(i.y?' · '+i.y:''), size:32, weight:'700', color:CARD.INK},
      {t:'gap', v:8},
      {t:'title', v:i.t, size:size, max:30}
    ];
    if(note) bl.push({t:'text', v:note, lead:lead, size:28, color:CARD.MUT, maxl:4});
    bl.push({t:'small', v:(uniq.length>1?'Fontes: ':'Fonte: ')+uniq.join('; '), size:24, maxl:2});
    return cardCanvas(bl);
  }
  window.__actionCanvas=actionCanvas;
  function fitCardTitle(txt, room){
    var mc=document.createElement('canvas').getContext('2d'), size=76;
    for(;size>34;size-=2){ mc.font='800 '+size+'px '+CARD.HEAD; if(wrapLines(mc,txt,CARD.W-2*CARD.P).length*Math.round(size*1.12)<=room) break; }
    return size;
  }
  function fxItemCanvas(li){
    var h=li.closest('ul'); while(h && h.tagName!=='H4') h=h.previousElementSibling;
    var pauta=h?h.textContent.trim():'';
    var yr=(li.querySelector('.fx-yr')||{}).textContent||'';
    var txt=''; li.querySelectorAll('p').forEach(function(p){ if(!txt && !p.classList.contains('fx-o') && !p.classList.contains('fx-s')) txt=p.textContent.trim(); });
    var o=li.querySelector('.fx-o'), ot=o?o.textContent.replace(/^\s*Outro lado:\s*/,'').trim():'';
    var srcs=[].map.call(li.querySelectorAll('.fx-s a'), function(a){ return baseName(a.textContent.trim()); });
    var uniq=[]; srcs.forEach(function(x){ if(x && uniq.indexOf(x)<0) uniq.push(x); });
    var bl=[
      {t:'kicker', v:'E O PRÓPRIO FLÁVIO?'+(pauta?' · '+pauta.toUpperCase():''), color:'#B83280'},
      {t:'small', v:'Flávio Bolsonaro'+(yr?' · '+yr:''), size:32, weight:'700', color:CARD.INK},
      {t:'gap', v:8},
      {t:'title', v:txt, size:fitCardTitle(txt, ot?600:720), max:30}
    ];
    if(ot) bl.push({t:'text', v:ot, lead:'Outro lado:', size:28, color:CARD.MUT, maxl:4});
    bl.push({t:'small', v:(uniq.length>1?'Fontes: ':'Fonte: ')+uniq.join('; ')+'. Mandato legislativo: fora do placar.', size:24, maxl:2});
    return cardCanvas(bl);
  }
  function fxItemButtons(){
    document.querySelectorAll('#px-flavio .fx-list > li').forEach(function(li, k){
      if(li.querySelector('.fx-act')) return;
      var d=el('div','fx-act');
      var t=(li.querySelector('p')||{}).textContent||'';
      d.appendChild(imgBtn('Imagem', function(){ return fxItemCanvas(li); }, 'flavio-'+(k+1)+'-'+slug(t)+'.png', t.slice(0,90)));
      li.appendChild(d);
    });
  }
  window.__fxItemCanvas=fxItemCanvas;
  function newsCanvas(n){
    var tags=(n.tags||[]).join(' · ');
    return cardCanvas([
      n.tipo==='Você sabia?' ? {t:'kicker', v:'SINAL '+(n.n||'')+' · VOCÊ SABIA? · '+ndate(n).toUpperCase(), color:CARD.BLUE} : {t:'kicker', v:'SINAL '+(n.n||'')+' · '+ndate(n).toUpperCase(), color:CARD.CON},
      {t:'small', v:(n.tipo&&n.tipo!=='Você sabia?'?n.tipo+(tags?' · ':''):'')+tags, weight:'700'},
      (n.alerta&&n.alerta.length) ? {t:'small', v:'⚠ Alerta democrático: '+n.alerta.map(function(k){ return ALERTA[k]; }).join(' · '), weight:'800', color:'#8A1C1C', size:26} : {t:'gap',v:0},
      {t:'gap', v:6},
      {t:'title', v:n.t, size:60, max:4},
      {t:'text', v:n.s, size:(n.tipo==='Você sabia?'?30:31), maxl:(n.tipo==='Você sabia?'?12:8)},
      n.why ? {t:'text', v:n.why, lead:(n.wl||'Por que importa:'), size:28, color:CARD.MUT, maxl:(n.tipo==='Você sabia?'?6:4)} : {t:'gap',v:0},
      {t:'small', v:'Fontes: '+n.src.map(function(x){ return x[0]; }).join('; '), size:24, maxl:2}
    ], true);
  }
  function fichaCanvas(k){
    var n=cxNode(k), L=null; PX.mx.lideres.forEach(function(x){ if(x.k===k) L=x; });
    var atos=PX.mx.pilares.filter(function(p){ return pxCell((L.celulas||{})[p])==='ato'; });
    var disc=PX.mx.pilares.filter(function(p){ return pxCell((L.celulas||{})[p])==='discurso'; });
    var chips=atos.map(function(p){ return {v:PXP[p], fill:true}; }).concat(disc.map(function(p){ return {v:PXP[p], fill:false}; }));
    var withF=CX_E.filter(function(e){ return (e.a==='fl'&&e.b===k)||(e.b==='fl'&&e.a===k); }).sort(function(a,b){ return a.d<b.d?1:-1; });
    var ex=atos.slice(0,1).map(function(p){ return L.celulas[p]; })[0];
    var bl=[
      {t:'kicker', v:'QUEM SÃO OS PARÇAS', color:CARD.BLUE},
      {t:'title', v:n.full, size:72, max:2},
      {t:'small', v:(L.periodo||n.bio||''), size:30, weight:'600', maxl:2},
      {t:'gap', v:14},
      {t:'label', v:atos.length+' de 8 pilares da extrema direita com ato de governo'+(disc.length?' · '+disc.length+' só em discurso':''), color:CARD.INK},
      {t:'chips', v:chips},
      {t:'small', v:'Cheio: ato de governo. Contorno: só discurso.', size:22}
    ];
    if(ex) bl.push({t:'text', v:ex.ex, lead:'Exemplo:', size:28, color:CARD.MUT});
    if(withF.length) bl.push({t:'text', v:withF[0].ti+'. '+(withF[0].txt||''), lead:'Ligação com Flávio:', size:28});
    else bl.push({t:'text', v:'Sem ligação direta com Flávio documentada.', size:28});
    return cardCanvas(bl);
  }
  function flavioCanvas(){
    return cardCanvas([
      {t:'kicker', v:'E O PRÓPRIO FLÁVIO?', color:'#B83280'},
      {t:'title', v:'O que Flávio fez em 24 anos de mandato', size:62, max:3},
      {t:'small', v:'Deputado estadual no Rio (2003 a 2018) e senador desde 2019. Mandato legislativo, não governo.', size:28, weight:'600'},
      {t:'gap', v:10},
      {t:'nums', v:[{n:'51 de 208',l:'propostas viraram lei na Alerj'},{n:'2',l:'leis no Senado em que foi coautor, nenhuma de segurança'},{n:'R$ 271 mi',l:'em emendas, 16% para a Justiça'}]},
      {t:'text', v:'Segurança pública é a principal bandeira. Foi o único deputado da Alerj a votar contra a CPI das Milícias (2007) e deu a maior honraria da casa a um PM preso por homicídio. No Senado, relatou o fim das “saidinhas”.', size:28},
      {t:'text', v:'denunciado na “rachadinha” (arquivada sem julgamento do mérito, após anulação de provas) e investigado no STF no caso Dark Horse, sobre dinheiro de Daniel Vorcaro. Ele nega irregularidades.', lead:'Na Justiça:', size:28, color:CARD.MUT},
      {t:'small', v:'Fontes: Folhapress, Agência O Globo, DW, Estadão Conteúdo, CNN Brasil.', size:23}
    ]);
  }
  window.__fichaCanvas=fichaCanvas; window.__flavioCanvas=flavioCanvas;
  window.__newsCanvas = function(i){ var l=NEWS.slice().sort(function(a,b){ return a.d<b.d?1:(a.d>b.d?-1:0); }); return newsCanvas(l[i||0]); };
  imgShare('rank-img','rank-img-msg', rankCanvas, function(){ return 'ranking-parcas-do-flavio'+(state.c==='all'?'':'-'+state.c)+'.png'; }, function(){ return 'Ranking das pautas'; });
  /* ---------- Participe (Tally, carregado só sob demanda) ---------- */
  (function(){
    var FORM='eq1lDO', URL='https://tally.so/r/eq1lDO';
    function ctx(){ var p='',c=''; try{ if(state.g && state.g!=='all') p=gname(state.g); else if(state.picked) p='Todas as pautas'; if(state.c && state.c!=='all') c=cname(state.c); }catch(e){} return {pauta:p, parca:c}; }
    function link(){ var x=ctx(), q=[]; Object.keys(x).forEach(function(k){ if(x[k]) q.push(k+'='+encodeURIComponent(x[k])); }); return URL+(q.length?'?'+q.join('&'):''); }
    var loading=false, waiting=[];
    function load(cb){
      if(window.Tally && window.Tally.openPopup){ cb(true); return; }
      waiting.push(cb); if(loading) return; loading=true;
      var s=document.createElement('script'); s.src='https://tally.so/widgets/embed.js'; s.async=true;
      function done(ok){ loading=false; var w=waiting; waiting=[]; w.forEach(function(f){ f(ok); }); }
      s.onload=function(){ done(!!(window.Tally && window.Tally.openPopup)); };
      s.onerror=function(){ s.remove(); done(false); };
      document.head.appendChild(s);
    }
    function fallback(u){ var w=window.open(u,'_blank','noopener'); if(!w) location.href=u; }
    [].slice.call(document.querySelectorAll('[data-participe]')).forEach(function(b){
      ['pointerenter','focus','touchstart'].forEach(function(ev){ b.addEventListener(ev, function(){ load(function(){}); }, {passive:true, once:true}); });
      b.addEventListener('click', function(e){
        b.href = link();
        if(e.metaKey || e.ctrlKey || e.shiftKey || e.button===1) return;
        e.preventDefault();
        var settled=false, t=setTimeout(function(){ if(!settled){ settled=true; fallback(b.href); } }, 3500);
        load(function(ok){
          if(settled) return; settled=true; clearTimeout(t);
          if(ok){ try{ window.Tally.openPopup(FORM, {layout:'modal', width:560, overlay:true, autoClose:3000, hiddenFields:ctx()}); return; }catch(err){} }
          fallback(b.href);
        });
      });
    });
  })();
  imgShare('sum-img','sum-img-msg', sumCanvas, function(){ return 'resumo-'+(state.g==='all'?'todas-as-pautas':state.g)+(state.c==='all'?'':'-'+state.c)+'.png'; }, function(){ return 'Resumo: '+(state.g==='all'?'Todas as pautas':gname(state.g)); });
  (function(){
    var tt=document.getElementById('totop'); if(!tt) return;
    var tk=false;
    function chk(){ tk=false; tt.hidden = window.scrollY < 500; }
    window.addEventListener('scroll', function(){ if(!tk){ tk=true; requestAnimationFrame(chk); } }, {passive:true});
    chk();
  })();
  document.addEventListener('click', function(e){ var g=e.target.closest&&e.target.closest('a.c-go[aria-disabled="true"]'); if(g){ e.preventDefault(); } }, true);
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href="#parcas"], a[href="#legenda"], a[href^="#parca-"]');
    if(!a) return;
    var h = a.getAttribute('href');
    var tg = document.getElementById(h==='#legenda' ? 'legend-toggle' : 'parcas-toggle');
    if(tg && tg.getAttribute('aria-expanded')!=='true') tg.click();
    if(h.indexOf('#parca-')===0){
      e.preventDefault();
      var li = document.getElementById(h.slice(1));
      if(li){
        if(li.tagName==='DETAILS' && window.pxOpenFicha){ window.pxOpenFicha(li.id.slice(6)); li.classList.remove('flash'); void li.offsetWidth; li.classList.add('flash'); return; }
        if(li.tagName==='DETAILS') li.open=true;
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        setTimeout(function(){ li.scrollIntoView({behavior: reduce?'auto':'smooth', block: li.tagName==='DETAILS'?'start':'center'}); li.classList.remove('flash'); void li.offsetWidth; li.classList.add('flash'); }, 30);
      }
    }
  }, true);
  function setTab(x,open){
    x.t.setAttribute('aria-expanded',open?'true':'false');
    x.b.hidden=!open; x.p.hidden=!open;
    x.a.classList.toggle('closed',!open);
    xBtn(x.t, open, x.on, x.off);
  }
  tabs = tabs.filter(function(x){ return x.t && x.b && x.p && x.a; });
  tabs.forEach(function(x){
    x.t.addEventListener('click',function(){
      var open=x.t.getAttribute('aria-expanded')==='true';
      setTab(x, !open);
    });
  });
  /* ===== Busca ===== */
  (function(){
    var btn=$('busca-btn'), box=$('busca'), inp=$('busca-q'), res=$('busca-res'), st=$('busca-st'), cl=$('busca-x');
    if(!btn||!box) return;
    function nz(x){ return String(x||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,''); }
    var IDX=null;
    function build(){
      IDX={a:[],r:[],n:[],f:[]};
      var seen={};
      A.forEach(function(i){ var k=i.c+'|'+i.t; if(seen[k]) return; seen[k]=1;
        IDX.a.push({o:i, h:nz([i.t,i.note,i.src,cname(i.c),(i.gs||[i.g]).map(gname).join(' '),i.y,(i.links||[]).map(function(l){return l[0];}).join(' ')].join(' '))}); });
      var seenR={};
      R.forEach(function(r){ var k=r.c+'|'+r.t; if(seenR[k]) return; seenR[k]=1; IDX.r.push({o:r, h:nz([r.t,r.src,cname(r.c),gname(r.g)].join(' '))}); });
      NEWS.forEach(function(n){ IDX.n.push({o:n, h:nz([n.n?('sinal '+n.n+' '+parseInt(n.n,10)+' nº'+n.n):'',n.tipo,n.t,n.s,n.why,(n.tags||[]).join(' '),(n.alerta||[]).map(function(k){ return 'alerta '+ALERTA[k]; }).join(' '),(n.src||[]).map(function(x){return x[0];}).join(' ')].join(' '))}); });
      document.querySelectorAll('#px-flavio .fx-list > li').forEach(function(li){ var h=li.closest('ul'); while(h && h.tagName!=='H4') h=h.previousElementSibling;
        IDX.f.push({o:li, p:h?h.textContent.trim():'', h:nz('flavio bolsonaro '+(h?h.textContent:'')+' '+li.textContent)}); });
    }
    var LAST=[];
    function mark(root){
      if(!LAST.length) return;
      var w=document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {acceptNode:function(n){ var p=n.parentNode; if(!p||/^(BUTTON|MARK|SCRIPT|STYLE)$/.test(p.nodeName)||p.closest('button')||p.closest('.bs-lado')) return NodeFilter.FILTER_REJECT; return n.nodeValue.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT; }});
      var nodes=[]; while(w.nextNode()) nodes.push(w.currentNode);
      nodes.forEach(function(n){
        var t=n.nodeValue, z=nz(t); if(z.length!==t.length) return;
        var rg=[]; LAST.forEach(function(q){ var i=0; while((i=z.indexOf(q,i))>=0){ var e=i+q.length; while(e<t.length && /[0-9a-z]/.test(z[e])) e++; rg.push([i,e]); i=e; } });
        if(!rg.length) return;
        rg.sort(function(a,b){ return a[0]-b[0]; });
        var m=[]; rg.forEach(function(r){ if(m.length && r[0]<=m[m.length-1][1]) m[m.length-1][1]=Math.max(m[m.length-1][1],r[1]); else m.push(r.slice()); });
        var f=document.createDocumentFragment(), pos=0;
        m.forEach(function(r){ if(r[0]>pos) f.appendChild(document.createTextNode(t.slice(pos,r[0]))); var mk=document.createElement('mark'); mk.className='bs-hl'; mk.textContent=t.slice(r[0],r[1]); f.appendChild(mk); pos=r[1]; });
        if(pos<t.length) f.appendChild(document.createTextNode(t.slice(pos)));
        n.parentNode.replaceChild(f,n);
      });
    }
    var EYE='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/></svg>';
    function see(title, fn){ var a=el('a','bs-see','Ver mais'); a.href='#'; a.title=title; a.setAttribute('aria-label',title); a.addEventListener('click',function(e){ e.preventDefault(); fn(); }); return a; }
    function flashTo(t){ if(!t) return; setTimeout(function(){ t.scrollIntoView({block: t.classList&&t.classList.contains('item')?'center':'start'}); if(t.classList&&(t.classList.contains('item')||t.tagName==='LI')){ t.classList.remove('bs-flash'); void t.offsetWidth; t.classList.add('bs-flash'); } },60); }
    function verNoPainel(i){
      close();
      var f=$('top-foco'), q=$('top-pais'), ctrl=i.c==='br';
      f.value=i.g; f.dispatchEvent(new Event('change',{bubbles:true}));
      q.value=ctrl?'all':i.c; q.dispatchEvent(new Event('change',{bubbles:true}));
      setTimeout(function(){
        if(ctrl){ var c=$('comparacao'); if(c){ openFor(c); c.scrollIntoView({block:'start'}); } return; }
        if(BLK.acoes) setBlk('acoes', true);
        var lis=[].slice.call(document.querySelectorAll('#list-contra > li.item, #list-pro > li.item')), hit=null;
        lis.forEach(function(li){ var p=li.querySelector('p'); if(!hit && p && p.textContent===i.t) hit=li; });
        if(!hit){ var r=$('resumo'); if(r) r.scrollIntoView({block:'start'}); return; }
        var ul=hit.parentNode; if(ul.classList.contains('collapsed')){ var mb=$(ul.id==='list-contra'?'more-contra':'more-pro'); if(mb && !mb.hidden) mb.click(); }
        setTimeout(function(){ hit.scrollIntoView({block:'center'}); hit.classList.remove('bs-flash'); void hit.offsetWidth; hit.classList.add('bs-flash'); },80);
      }, 350);
    }
    var FILT=null;
    function fok(kind, x){
      if(!FILT) return true; var o=x.o, v=FILT.v;
      if(FILT.t==='c'){ if(kind==='a'||kind==='r') return o.c===v; if(kind==='n') return (o.tags||[]).some(function(t){ return nz(t)===nz(cname(v)); }); return false; }
      if(FILT.t==='g'){ if(kind==='a') return (o.gs||[o.g]).indexOf(v)>=0; if(kind==='r') return o.g===v; if(kind==='n'){ var gn=nz(gname(v)); return (o.tags||[]).some(function(t){ var z=nz(t); return z===gn || gn.indexOf(z)===0 || z.indexOf(gn)===0; }); } return false; }
      if(FILT.t==='tag'){ if(kind==='n') return (o.tags||[]).some(function(t){ return nz(t)===nz(v); }); if(kind==='f') return nz(v)==='flavio'; return false; }
      if(FILT.t==='alerta'){ return kind==='n' && (o.alerta||[]).indexOf(v)>=0; }
      return true;
    }
    function chipUI(){
      var old=box.querySelector('.bs-chip'); if(old) old.remove();
      if(!FILT) { inp.placeholder='Buscar: aposentadoria, Vorcaro, vacina, Milei…'; return; }
      var c=el('span','bs-chip'); c.appendChild(el('span','',FILT.label)); var x=el('button','bs-chip-x','×'); x.type='button'; x.setAttribute('aria-label','Remover o filtro '+FILT.label); x.addEventListener('click',function(){ FILT=null; run(); inp.focus(); }); c.appendChild(x);
      inp.parentNode.insertBefore(c, inp); inp.placeholder='Refinar (opcional)';
    }
    var CTRY={eua:'us','estados unidos':'us',argentina:'ar','el salvador':'sv',hungria:'hu','polonia':'pl',chile:'cl'};
    function filtFrom(el0){
      if(el0.hasAttribute('data-palerta')){ var k=el0.getAttribute('data-palerta'); return {t:'alerta',v:k,label:'⚠ '+ALERTA[k]}; }
      var t=el0.getAttribute('data-ptag'), z=nz(t), ck=null;
      ALLC.forEach(function(c){ if(!c.ctrl && nz(c.n)===z) ck=c.k; }); if(!ck && CTRY[z]) ck=CTRY[z];
      if(ck) return {t:'c',v:ck,label:cname(ck)};
      var gk=null; GROUPS.concat(THEMES).forEach(function(g){ var gn=nz(g.n); if(!gk && (gn===z || gn.indexOf(z)===0)) gk=g.k; });
      if(gk) return {t:'g',v:gk,label:gname(gk)};
      return {t:'tag',v:t,label:t};
    }
    window.__bsFilter=function(f, q){ if(box.hidden) open(); FILT=f; inp.value=q||''; run(); return res.querySelectorAll('li').length; };
    document.addEventListener('click', function(e){
      var pe=e.target.closest && e.target.closest('[data-pc],[data-ptag],[data-palerta]'); if(!pe) return;
      if(pe.closest('.bs-chip')) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if(pe.hasAttribute('data-pc')){ var pc=pe.getAttribute('data-pc'), pg=pe.getAttribute('data-pg'), ctrl=pc==='br'; close();
        var f0=$('top-foco'), q0=$('top-pais'); f0.value=pg; f0.dispatchEvent(new Event('change',{bubbles:true})); q0.value=ctrl?'all':pc; q0.dispatchEvent(new Event('change',{bubbles:true}));
        setTimeout(function(){ var t=$(ctrl?'comparacao':'resumo'); if(t){ openFor(t); t.scrollIntoView({block:'start'}); var h=$('res-title'); if(!ctrl && h){ h.setAttribute('tabindex','-1'); h.focus({preventScroll:true}); } } },300); return; }
      var f=filtFrom(pe); if(box.hidden) open(); FILT=f; inp.value=''; run(); box.scrollTop=0; setTimeout(function(){ inp.blur(); },30);
    }, true);
    document.addEventListener('keydown', function(e){ if(e.key!=='Enter'&&e.key!==' ') return; var pe=e.target.closest && e.target.closest('[data-pc],[data-ptag],[data-palerta]'); if(pe){ e.preventDefault(); pe.click(); } });
    function hits(list, terms){ return list.filter(function(x){ return terms.every(function(t){ return x.h.indexOf(t)>=0; }); }); }
    function sec(title, n){ var d=el('section','bs-sec'); d.appendChild(el('h3','bs-h',title+' ('+n+')')); return d; }
    function more(ul, n, cap){ if(n<=cap) return null; var b=el('button','more','Ver mais ('+(n-cap)+')'); b.type='button'; return b; }
    function go(hash, after){ close(); setTimeout(function(){ var a=document.createElement('a'); a.href=hash; document.body.appendChild(a); a.click(); a.remove(); if(after) setTimeout(after,120); },30); }
    function renderList(container, items, mk, cap){
      var ul=el('ul','list bs-list'); container.appendChild(ul);
      items.slice(0,cap).forEach(function(x){ ul.appendChild(mk(x)); });
      if(items.length>cap){ var b=el('button','more','Ver mais ('+(items.length-cap)+')'); b.type='button'; b.addEventListener('click',function(){ items.slice(cap).forEach(function(x){ ul.appendChild(mk(x)); }); b.remove(); mark(ul); }); container.appendChild(b); }
    }
    function run(){
      var q=nz(inp.value).trim(); res.innerHTML=''; chipUI();
      if(q.length<2 && !FILT){ st.textContent='Digite pelo menos 2 letras. Busca em ações, contexto, Sinais e nos mandatos de Flávio.'; LAST=[]; return; }
      if(!IDX) build();
      var terms=q.length<2?[]:q.split(/\s+/).filter(Boolean).map(function(t){ return t.length>6 ? t.slice(0, Math.max(6, Math.ceil(t.length*0.7))) : t; });
      var snm=q.match(/^(?:sinal\s*)?(?:n[o]?\s*)?#?\s*0*(\d{1,3})$/), byNum=null;
      if(snm && (/sinal|#/.test(q) || /^0\d/.test(q))){ var want=('00'+snm[1]).slice(-3); byNum=IDX.n.filter(function(x){ return x.o.n===want; }); }
      if(byNum){ terms=['\u0000']; }
      var a=hits(IDX.a,terms).filter(function(x){ return fok('a',x); }), r=hits(IDX.r,terms).filter(function(x){ return fok('r',x); }), n=(byNum||hits(IDX.n,terms)).filter(function(x){ return fok('n',x); }), f=hits(IDX.f,terms).filter(function(x){ return fok('f',x); });
      var tot=a.length+r.length+n.length+f.length;
      var what = (FILT?'“'+FILT.label+'”':'') + (FILT&&terms.length?' + ':'') + (terms.length?'“'+inp.value.trim()+'”':'');
      st.textContent = tot ? (tot===1?'1 resultado':tot+' resultados')+' para '+what+'.' : 'Nada encontrado para '+what+'. Tente outra palavra, sem acento ou mais curta.';
      if(a.length){ var s1=sec('Ações',a.length); res.appendChild(s1); renderList(s1,a,function(x){ var i=x.o, pro=i.s==='pro', li=itemNode(i,true,true); li.classList.add(pro?'bs-pro':'bs-con'); var top=el('div','bs-top'); top.appendChild(el('span','bs-lado '+(pro?'pro':'con'),(pro?'Melhorou ':'Piorou ')+(PARA[i.g]||''))); top.appendChild(see('Ver '+gname(i.g)+(i.c==='br'?'':' · '+cname(i.c))+' no painel', function(){ verNoPainel(i); })); li.insertBefore(top, li.firstChild); return li; },12); }
      if(n.length){ var s2=sec('Sinais',n.length); res.appendChild(s2); renderList(s2,n,function(x){ var o=x.o, li=el('li','item news bs-news');
          var top=el('div','bs-top'); var hd=el('div','news-hd'); if(o.n) hd.appendChild(el('span','news-n','Sinal '+o.n)); if(o.tipo) hd.appendChild(el('span','news-k'+(o.tipo==='Você sabia?'?' vs':''),o.tipo)); hd.appendChild(el('time','news-d',ndate(o))); (o.tags||[]).forEach(function(t){ var tg=el('span','tag',t); tg.setAttribute('data-ptag',t); pillA(tg,'Buscar tudo sobre '+t); hd.appendChild(tg); }); alertChips(o, hd); top.appendChild(hd);
          top.appendChild(see('Ver nos Sinais', function(){ close(); var nb=$('noticias'); if(nb) openFor(nb); setTimeout(function(){ var t=null; document.querySelectorAll('#noticias li.item.news .news-t').forEach(function(e){ if(!t && e.textContent===o.t) t=e.closest('li'); }); flashTo(t||nb); },150); })); li.appendChild(top);
          li.appendChild(el('p','news-t',o.t)); li.appendChild(el('p','news-s',o.s)); return li; },6); }
      if(f.length){ var s3=sec('E o próprio Flávio?',f.length); res.appendChild(s3); renderList(s3,f,function(x){ var li=el('li','item bs-fx'); var c=x.o.cloneNode(true); var ac=c.querySelector('.fx-act'); if(ac) ac.remove();
          var top=el('div','bs-top'); top.appendChild(x.p ? el('span','tag',x.p) : el('span','',''));
          top.appendChild(see('Ver em E o próprio Flávio?', function(){ close(); var tg=$('parcas-toggle'); if(tg && tg.getAttribute('aria-expanded')!=='true') tg.click(); setTimeout(function(){ flashTo(x.o); },200); })); li.appendChild(top);
          while(c.firstChild) li.appendChild(c.firstChild); return li; },6); }
      if(r.length){ var s4=sec('Contexto',r.length); res.appendChild(s4); renderList(s4,r,function(x){ var o=x.o, li=ctxItem(o,true,true,false); var top=el('div','bs-top'); top.appendChild(el('span','tag','Contexto'+(o.g?' · '+gname(o.g):'')));
          top.appendChild(see('Ver '+gname(o.g)+(o.c==='br'?'':' · '+cname(o.c))+' no painel', function(){ close(); var f=$('top-foco'), q=$('top-pais'); f.value=o.g; f.dispatchEvent(new Event('change',{bubbles:true})); q.value=o.c==='br'?'all':o.c; q.dispatchEvent(new Event('change',{bubbles:true}));
            setTimeout(function(){ var key=o.t.replace(/^Economia:\s*/,'').slice(0,40).toLowerCase(), t=null; document.querySelectorAll('#list-ctx > li.item').forEach(function(e){ if(!t && e.textContent.toLowerCase().indexOf(key)>=0) t=e; }); var cx=$('ctx'); if(t){ var ul=t.parentNode; if(ul.classList.contains('collapsed')){ var mb=ul.parentNode.querySelector('button.more'); if(mb && !mb.hidden) mb.click(); } } if(cx) openFor(cx); flashTo(t||cx||$('resumo')); },700); }));
          var body=li.querySelector('.body')||li; body.insertBefore(top, body.firstChild); return li; },6); }
      LAST=terms; mark(res);
    }
    var tmr;
    inp.addEventListener('input', function(){ clearTimeout(tmr); tmr=setTimeout(run,180); });
    function open(){ inp.value=''; res.innerHTML=''; LAST=[]; FILT=null; box.hidden=false; box.scrollTop=0; document.documentElement.classList.add('bs-open'); btn.setAttribute('aria-expanded','true'); setTimeout(function(){ inp.focus(); },20); run(); }
    function close(){ if(box.hidden) return; box.hidden=true; document.documentElement.classList.remove('bs-open'); btn.setAttribute('aria-expanded','false'); clearTimeout(tmr); inp.value=''; res.innerHTML=''; LAST=[]; FILT=null; chipUI(); }
    /* clique fora da busca (topo, menu, logo) fecha a busca e deixa o clique seguir */
    document.addEventListener('click', function(e){ if(box.hidden) return; var t=e.target; if(box.contains(t) || btn.contains(t)) return; close(); }, true);
    btn.addEventListener('click', function(e){ e.preventDefault(); box.hidden?open():close(); });
    cl.addEventListener('click', close);
    document.addEventListener('keydown', function(e){ if(e.key==='Escape' && !box.hidden) close(); if(e.key==='/' && box.hidden && !/input|textarea|select/i.test((document.activeElement||{}).tagName||'')){ e.preventDefault(); open(); } });
    document.querySelectorAll('[data-busca]').forEach(function(a){ a.addEventListener('click', function(e){ e.preventDefault(); var b=$('burger'); if(b && b.getAttribute('aria-expanded')==='true') b.click(); open(); }); });
    var tq=$('tf-q');
    if(tq){ tq.addEventListener('input', function(){ var v=tq.value; if(!v) return; open(); inp.value=v; tq.value=''; run(); inp.focus(); try{ inp.setSelectionRange(v.length,v.length); }catch(e){} });
      tq.addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); var v=tq.value; open(); inp.value=v; tq.value=''; run(); inp.focus(); } }); }
    window.__busca=function(q){ open(); inp.value=q; run(); return res.querySelectorAll('li').length; };
  })();

  /* ---------- Topo Lente: busca, pautas e escolher quem observar ---------- */
  (function(){
    var hero=document.querySelector('.hero-lente'); if(!hero) return;
    var SHORT={saude:'Saúde',aposentados:'Aposentados',trabalhadores:'Trabalhadores',renda:'Renda',seguranca:'Segurança',educacao:'Educação'};
    var nP=GROUPS.length+THEMES.length;
    function reduce(){ return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    function setSel(id, v){ var s=document.getElementById(id); if(!s) return; s.value=v; s.dispatchEvent(new Event('change',{bubbles:true})); }
    /* pílulas de pauta */
    var box=document.getElementById('hl-pills');
    if(box){
      Object.keys(SHORT).forEach(function(k){ var b=document.createElement('button'); b.type='button'; b.className='hl-pill'; b.textContent=SHORT[k]; b.title=gname(k); b.addEventListener('click', function(){ setSel('top-foco', k); }); box.appendChild(b); });
      var all=document.createElement('button'); all.type='button'; all.className='hl-pill all'; all.innerHTML='Ver as '+nP+' <span aria-hidden="true">→</span>'; all.setAttribute('aria-label','Ver as '+nP+' pautas');
      all.addEventListener('click', function(){ var r=document.getElementById('result'), tf=document.getElementById('top-foco'); if(r) r.scrollIntoView({behavior:reduce()?'auto':'smooth', block:'start'}); setTimeout(function(){ if(tf) tf.focus({preventScroll:true}); }, reduce()?0:450); });
      box.appendChild(all);
    }
    /* busca */
    var f=document.getElementById('hl-form'), q=document.getElementById('hl-q');
    function toBusca(){ var v=q.value; if(typeof window.__busca==='function'){ window.__busca(v); q.value=''; var bi=document.getElementById('busca-q'); if(bi){ bi.focus(); try{ bi.setSelectionRange(v.length,v.length); }catch(e){} } } }
    if(f) f.addEventListener('submit', function(e){ e.preventDefault(); toBusca(); });
    if(q) q.addEventListener('input', function(){ if(q.value) toBusca(); });
    /* folha de personagens */
    var who=document.getElementById('hl-who'), sh=document.getElementById('hl-sheet'), list=document.getElementById('hs-list'), sq=document.getElementById('hs-q'), tabs=document.getElementById('hs-tabs'), empty=document.getElementById('hs-empty');
    if(!who||!sh) return;
    var ws=document.getElementById('hl-who-s'); if(ws) ws.textContent=COUNTRIES.length+' governos, por enquanto';
    var TIERS=[{k:'gov',n:'Governos',items:COUNTRIES}];
    var cur='gov', last=null;
    function norm(t){ return (t||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase(); }
    function drawTabs(){ tabs.innerHTML=''; TIERS.filter(function(t){ return t.items.length; }).forEach(function(t){ var b=document.createElement('button'); b.type='button'; b.className='hs-tab'; b.setAttribute('aria-pressed', t.k===cur?'true':'false'); b.textContent=t.n+' · '+t.items.length; tabs.appendChild(b); }); }
    function draw(){
      var t=TIERS.filter(function(x){ return x.k===cur; })[0], v=norm(sq.value).trim();
      var items=t.items.slice().sort(function(a,b){ return a.n.localeCompare(b.n,'pt'); }).filter(function(c){ return !v || norm(c.n+' '+c.p).indexOf(v)>=0; });
      list.innerHTML='';
      items.forEach(function(c){ var li=document.createElement('li'), b=document.createElement('button'); b.type='button'; b.innerHTML='<span><b></b><small></small></span><span class="chev" aria-hidden="true">›</span>'; b.querySelector('b').textContent=c.n; b.querySelector('small').textContent=c.p+' · '+c.s; b.addEventListener('click', function(){ close(); setSel('top-pais', c.k); }); li.appendChild(b); list.appendChild(li); });
      empty.hidden=items.length>0;
    }
    function open(){ last=document.activeElement; sq.value=''; drawTabs(); draw(); sh.hidden=false; document.documentElement.classList.add('hs-open'); who.setAttribute('aria-expanded','true'); setTimeout(function(){ var fb=list.querySelector('button'); (window.matchMedia('(min-width:761px)').matches? sq : (fb||sq)).focus(); },30); }
    function close(){ if(sh.hidden) return; sh.hidden=true; document.documentElement.classList.remove('hs-open'); who.setAttribute('aria-expanded','false'); if(last && last.focus) last.focus({preventScroll:true}); }
    who.setAttribute('aria-expanded','false');
    who.addEventListener('click', open);
    sq.addEventListener('input', draw);
    sh.addEventListener('click', function(e){ if(e.target.closest('[data-hs-close]')) close(); });
    document.addEventListener('keydown', function(e){ if(sh.hidden) return; if(e.key==='Escape'){ e.preventDefault(); close(); return; }
      if(e.key==='Tab'){ var fo=[].slice.call(sh.querySelectorAll('button,input')).filter(function(x){ return x.offsetParent!==null; }); if(!fo.length) return; var a=fo[0], z=fo[fo.length-1]; if(e.shiftKey && document.activeElement===a){ e.preventDefault(); z.focus(); } else if(!e.shiftKey && document.activeElement===z){ e.preventDefault(); a.focus(); } } });
  })();
})();

