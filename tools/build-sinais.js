#!/usr/bin/env node
/* Gera as páginas próprias dos Sinais a partir de data/sinais.js:
   sinais/index.html (lista com filtros) e sinais/NNN/index.html (uma por Sinal).
   Uso: node tools/build-sinais.js   (rodar sempre que data/sinais.js mudar)
   As imagens (og.jpg e sinal-NNN.png) são geradas por tools/render-sinais.js. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const BASE = 'https://destrava-conversas.com.br/observatoriodireitaradical/';
const BRAND = 'Painel Observatório da Direita Radical e Extrema';

const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'data/sinais.js'), 'utf8').replace('window.PD = window.PD || {};', 'var PD = window.PD = {};'), ctx);
const NEWS = ctx.window.PD.NEWS.filter(n => n.n);
const byNum = NEWS.slice().sort((a, b) => a.n < b.n ? -1 : 1);

const MESES = ['jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
const MESES_L = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const fdate = iso => { const p = iso.split('-'); return parseInt(p[2], 10) + ' ' + MESES[+p[1] - 1] + ' ' + p[0]; };
const ndate = n => n.quando || fdate(n.d);
const ALERTA = { regras: 'Regras do jogo', inimigo: 'Adversário como inimigo', violencia: 'Violência', liberdades: 'Liberdades' };
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const highlight = n => {
  if (n.destaque) return n.destaque;
  const q = (n.s || '').match(/“([^”]{12,200})”/); if (q) return '“' + q[1] + '”';
  return (n.s || '').split(/(?<=\.)\s/)[0];
};
const today = new Date(); const UPD = today.getDate() + ' de ' + MESES_L[today.getMonth()] + ' de ' + today.getFullYear();
const url = n => BASE + 'sinais/' + n.n + '/';
const isRegras = n => (n.tags || []).indexOf('Eleições e regras') >= 0;
const isAlerta = n => n.alerta && n.alerta.length;
const isVS = n => n.tipo === 'Você sabia?';
const kicker = n => 'Sinal ' + n.n + ' · ' + (isVS(n) ? 'Você sabia? · ' : '') + ndate(n);

const CSS = `
:root{--ground:#EEF1F4;--surface:#FFFFFF;--ink:#1A2430;--muted:#4A5663;--line:#D3DAE1;--navy:#0A1A3F;--acc:#A6F36A;--link:#0B6B8F;--al-bg:#FDE2E2;--al-ink:#8A1C1C;--al-line:#F2B8B8;--hl:#FFFFFF}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--ground:#0B1430;--surface:#13204A;--ink:#EEF1F8;--muted:#B9C3DB;--line:#2A3A66;--link:#8FD3EE;--al-bg:#3A1717;--al-ink:#F6B4B4;--al-line:#6B2A2A;--hl:#0E1A3C}}
:root[data-theme="dark"]{--ground:#0B1430;--surface:#13204A;--ink:#EEF1F8;--muted:#B9C3DB;--line:#2A3A66;--link:#8FD3EE;--al-bg:#3A1717;--al-ink:#F6B4B4;--al-line:#6B2A2A;--hl:#0E1A3C}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--ground);color:var(--ink);font-family:'Public Sans',system-ui,-apple-system,'Segoe UI',Arial,sans-serif;font-size:17px;line-height:1.6}
a{color:var(--link)}
.top{position:sticky;top:0;z-index:100;background:var(--navy);border-bottom:1px solid rgba(255,255,255,.12);padding-top:env(safe-area-inset-top,0px)}
.top-in{position:relative;max-width:1280px;margin:0 auto;height:60px;padding:0 clamp(12px,4vw,48px);display:flex;align-items:center;gap:10px}
.brand{display:inline-flex;align-items:center;margin-right:auto;text-decoration:none;border-radius:8px}
.eye{flex:none;width:44px;height:24px;border-radius:22px/12px;border:3px solid var(--acc);display:flex;align-items:center;justify-content:center;transition:transform .15s}
.brand:hover .eye{transform:scale(1.06)}
.eye i{width:12px;height:12px;border-radius:50%;background:var(--acc);display:block}
.tb{height:40px;box-sizing:border-box;padding:0 16px;border-radius:999px;font:inherit;font-size:15px;font-weight:800;display:inline-flex;align-items:center;gap:8px;text-decoration:none;white-space:nowrap;border:2px solid #fff;cursor:pointer}
.tb.sin{background:#fff;color:#A64A08}
.tb.sin:hover{background:#FBEBDD}
.tb.sin .dot{width:8px;height:8px;border-radius:50%;background:#C2570C;animation:pulse 2.2s ease-out infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(194,87,12,.55);opacity:1}70%{box-shadow:0 0 0 6px rgba(194,87,12,0);opacity:.55}100%{box-shadow:0 0 0 0 rgba(194,87,12,0);opacity:1}}
@media (prefers-reduced-motion:reduce){.tb.sin .dot{animation:none}.eye{transition:none}}
.tb.bus{background:transparent;color:#fff}
.tb.bus:hover{background:rgba(255,255,255,.14)}
.tb.bus svg{width:18px;height:18px}
.burger{appearance:none;border:0;background:transparent;border-radius:8px;width:36px;height:42px;padding:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px}
.burger:hover{background:rgba(255,255,255,.16)}
.burger span{display:block;width:22px;height:2.5px;background:#fff;border-radius:2px;transition:transform .2s ease,opacity .2s ease}
.burger[aria-expanded="true"] span:nth-child(1){transform:translateY(7.5px) rotate(45deg)}
.burger[aria-expanded="true"] span:nth-child(2){opacity:0}
.burger[aria-expanded="true"] span:nth-child(3){transform:translateY(-7.5px) rotate(-45deg)}
.top :focus-visible{outline:3px solid #fff;outline-offset:2px}
.nav{display:none;position:absolute;top:calc(100% + 4px);right:clamp(12px,4vw,48px);width:max-content;min-width:240px;max-width:calc(100vw - 24px);flex-direction:column;padding:8px;background:var(--surface);border:1px solid var(--line);border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.22);text-align:right}
.nav.open{display:flex}
.nav a{padding:12px 14px;border-radius:8px;color:var(--ink);text-decoration:none;font-weight:600;font-size:16px;white-space:nowrap}
.nav a:hover{background:var(--ground)}
.nav a[aria-current="page"]{color:var(--link);box-shadow:inset -4px 0 0 var(--link);border-radius:8px 0 0 8px}
.nav a.ext{margin:0 0 6px;padding:12px 16px;background:#1A73C8;color:#fff;font-weight:700;border-radius:10px}
.nav a.ext:hover{background:#155FA3}
.nav a.sub{font-weight:500;font-size:15px;color:var(--muted)}
.nav .sep{display:block;height:1px;background:var(--line);margin:6px 12px}
@media (max-width:760px){.tb{padding:0 14px;font-size:14px}.tb.bus{padding:0 16px;min-width:56px;justify-content:center}.tb.bus .l{display:none}.nav a{font-size:17px;padding:13px 14px}}
.totop{position:fixed;right:16px;bottom:calc(20px + env(safe-area-inset-bottom,0px));z-index:120;width:52px;height:52px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#0A1A3F;border:2px solid #A6F36A;color:#A6F36A;box-shadow:0 6px 18px rgba(0,0,0,.28);text-decoration:none;font-size:22px;font-weight:700}
.totop[hidden]{display:none}
.totop:hover{background:#13213F}
.totop:focus-visible{outline:3px solid #A6F36A;outline-offset:3px}
main{max-width:880px;margin:0 auto;padding:20px 16px 48px}
.crumb{margin:0 0 14px;font-size:15px}
.crumb a{font-weight:600}
.card{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:22px 20px}
@media (min-width:700px){.card{padding:30px 34px}}
.hd{display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center;margin:0 0 12px;font-size:14px;color:var(--muted)}
.num{font-weight:800;color:var(--ink);background:var(--acc);color:#0A1A3F;border-radius:999px;padding:2px 10px;font-size:13px;letter-spacing:.02em}
.kind{font-weight:700}
.tag{display:inline-block;font-size:12.5px;font-weight:600;border:1px solid var(--line);border-radius:999px;padding:1px 9px;color:var(--muted);text-decoration:none}
a.tag:hover{border-color:var(--ink)}
.alerta{display:inline-block;font-size:12px;font-weight:800;letter-spacing:.02em;border-radius:999px;padding:2px 9px;background:var(--al-bg);color:var(--al-ink);border:1px solid var(--al-line);white-space:nowrap}
h1{font-family:'Bricolage Grotesque','Public Sans',sans-serif;font-weight:800;font-size:clamp(26px,4.4vw,38px);line-height:1.12;letter-spacing:-.02em;margin:0 0 18px;text-wrap:balance}
.dest{margin:0 0 20px;padding:14px 18px;border-left:6px solid #C2570C;background:var(--ground);border-radius:0 10px 10px 0;font-family:'Bricolage Grotesque','Public Sans',sans-serif;font-weight:600;font-size:clamp(19px,2.6vw,23px);line-height:1.35}
.dest.al{border-left-color:#C0392B}
.dest.vs{border-left-color:#0B6B8F}
.txt{margin:0 0 16px}
.why{margin:0 0 18px;color:var(--ink)}
.why b{font-weight:700}
.src{margin:0 0 4px;font-size:15.5px;color:var(--muted)}
.src a{font-weight:600}
.acts{display:flex;flex-wrap:wrap;gap:10px;margin:22px 0 0;padding:18px 0 0;border-top:1px solid var(--line)}
.btn{font:inherit;font-size:15px;font-weight:700;display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 16px;border-radius:999px;border:2px solid var(--navy);background:var(--navy);color:#fff;text-decoration:none;cursor:pointer}
.btn.o{background:transparent;color:var(--ink);border-color:var(--line)}
:root[data-theme="dark"] .btn{border-color:var(--acc);background:var(--acc);color:#0A1A3F}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) .btn{border-color:var(--acc);background:var(--acc);color:#0A1A3F}:root:not([data-theme="light"]) .btn.o{background:transparent;color:var(--ink);border-color:var(--line)}}
:root[data-theme="dark"] .btn.o{background:transparent;color:var(--ink);border-color:var(--line)}
.btn svg{width:18px;height:18px}
.img{margin:26px 0 0}
.img img{display:block;width:100%;max-width:420px;height:auto;border-radius:10px;border:1px solid var(--line)}
.img figcaption{font-size:14px;color:var(--muted);margin-top:8px}
.pn{display:flex;justify-content:space-between;gap:12px;margin:22px 0 0;font-size:15px}
.pn a{font-weight:600;text-decoration:none;max-width:48%}
.pn a span{display:block;font-size:13px;color:var(--muted);font-weight:500}
.pn .nx{text-align:right;margin-left:auto}
.foot{max-width:880px;margin:0 auto;padding:0 16px 40px;font-size:14px;color:var(--muted)}
.foot p{margin:4px 0}
.lead{margin:0 0 6px;font-size:16.5px;color:var(--muted)}
.list-h1{font-size:clamp(30px,5vw,44px);margin:6px 0 8px}
.filt{display:flex;gap:8px;overflow-x:auto;padding:4px 0 10px;margin:14px 0 6px;scrollbar-width:thin}
.chip{font:inherit;flex:none;font-size:14.5px;font-weight:700;min-height:40px;padding:0 15px;border-radius:999px;border:1.5px solid var(--line);background:var(--surface);color:var(--ink);cursor:pointer;white-space:nowrap}
.chip[aria-pressed="true"]{background:var(--navy);color:#fff;border-color:var(--navy)}
:root[data-theme="dark"] .chip[aria-pressed="true"]{background:var(--acc);color:#0A1A3F;border-color:var(--acc)}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) .chip[aria-pressed="true"]{background:var(--acc);color:#0A1A3F;border-color:var(--acc)}}
.chip small{font-weight:600;opacity:.75;margin-left:4px}
.q{width:100%;font:inherit;font-size:16px;padding:12px 16px;border-radius:999px;border:1.5px solid var(--line);background:var(--surface);color:var(--ink)}
.sl{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:10px}
.sl li a{display:block;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px 16px;text-decoration:none;color:var(--ink)}
.sl li a:hover{border-color:var(--ink)}
.sl .hd{margin:0 0 6px;font-size:13.5px}
.sl .t{font-family:'Bricolage Grotesque','Public Sans',sans-serif;font-weight:800;font-size:19px;line-height:1.25;margin:0}
.sl .d{margin:6px 0 0;font-size:15px;color:var(--muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.empty{color:var(--muted)}
:focus-visible{outline:3px solid var(--acc);outline-offset:2px}
`;

const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&amp;family=Montserrat:wght@800&amp;family=Public+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet">';

function head({ title, desc, canonical, image, imgW, imgH, rel, type }) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<link rel="icon" href="${rel}favicon.svg" type="image/svg+xml">
<link rel="icon" href="${rel}favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${rel}apple-touch-icon.png">
<meta name="theme-color" content="#0A1A3F">
<meta property="og:type" content="${type || 'article'}">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="${esc(BRAND)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${image}">
<meta property="og:image:secure_url" content="${image}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="${imgW}">
<meta property="og:image:height" content="${imgH}">
<meta property="og:image:alt" content="${esc(title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${image}">
${FONTS}
<style>${CSS}</style>
</head>`;
}

const ICON_SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg>';
const topbar = (rel, here) => `<header class="top" id="topo"><div class="top-in">
<a class="brand" href="${rel}" aria-label="${esc(BRAND)}, ir para o painel" title="${esc(BRAND)}"><span class="eye" aria-hidden="true"><i></i></span></a>
<a class="tb sin" href="${rel}sinais/"${here === 'lista' ? ' aria-current="page"' : ''} aria-label="Abrir a página dos Sinais"><span class="dot" aria-hidden="true"></span>Sinais</a>
<a class="tb bus" href="${rel}?busca" aria-label="Buscar no painel" title="Buscar no painel">${ICON_SEARCH}<span class="l">Buscar</span></a>
<button type="button" class="burger" id="burger" aria-expanded="false" aria-controls="nav" aria-label="Abrir menu"><span></span><span></span><span></span></button>
<nav class="nav" id="nav" aria-label="Seções do painel">
<a class="ext" href="${rel}economia/">E a Economia?</a>
<a href="${rel}">Início</a>
<a href="${rel}?busca">Buscar no painel</a>
<a href="${rel}#result">Escolher pauta</a>
<span class="sep" aria-hidden="true"></span>
<a href="${rel}quem-sao-eles/">Quem são eles</a>
<a href="${rel}sinais/"${here === 'lista' ? ' aria-current="page"' : ''}>Sinais</a>
<a href="${rel}metodo/">Método e critérios</a>
<a href="${rel}metodo/#informacoes">Privacidade e fontes</a>
<a href="https://tally.so/r/eq1lDO" target="_blank" rel="noopener">Participe</a>
</nav>
</div></header>
<a class="totop" id="totop" href="#topo" aria-label="Voltar ao topo" hidden>↑</a>`;

const NAVJS = `<script>
(function(){var b=document.getElementById('burger'),n=document.getElementById('nav'),t=document.getElementById('totop');
function set(o){n.classList.toggle('open',o);b.setAttribute('aria-expanded',o?'true':'false');b.setAttribute('aria-label',o?'Fechar menu':'Abrir menu');}
b.addEventListener('click',function(e){e.stopPropagation();set(!n.classList.contains('open'));});
document.addEventListener('click',function(e){if(n.classList.contains('open')&&!n.contains(e.target))set(false);});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&n.classList.contains('open')){set(false);b.focus();}});
function sc(){t.hidden=window.scrollY<600;}window.addEventListener('scroll',sc,{passive:true});sc();
t.addEventListener('click',function(e){e.preventDefault();window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});
})();
</script>`;

const foot = rel => `<footer class="foot">
<p>Toda afirmação tem fonte. Conteúdo do <a href="${rel}">${esc(BRAND)}</a>, uma iniciativa do <a href="https://destrava-conversas.com.br/">Destrava Conversas</a>.</p>
<p>Atualizado em ${UPD}.</p>
</footer>
${NAVJS}
<script data-goatcounter="https://destrava-conversas.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>`;

const ICON_WA = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z"/></svg>';
const ICON_LINK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>';
const ICON_IMG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>';

function hdHTML(n, linkTags, rel) {
  let h = `<span class="num">Sinal ${n.n}</span>`;
  if (n.tipo) h += `<span class="kind">${esc(n.tipo)}</span>`;
  if (!isVS(n)) h += `<time datetime="${n.d}">${esc(ndate(n))}</time>`;
  (n.tags || []).forEach(t => { h += linkTags ? `<a class="tag" href="${rel}?q=${encodeURIComponent(t)}">${esc(t)}</a>` : `<span class="tag">${esc(t)}</span>`; });
  (n.alerta || []).forEach(k => { h += `<span class="alerta">⚠ ${esc(ALERTA[k])}</span>`; });
  return h;
}

function sinalPage(n, i) {
  const rel = '../../';
  const hl = highlight(n);
  const title = 'Sinal ' + n.n + ': ' + n.t;
  const desc = hl.length > 180 ? hl.slice(0, 177).replace(/\s+\S*$/, '') + '…' : hl;
  const prev = byNum[i - 1], next = byNum[i + 1];
  const srcLbl = n.tipo === 'Vídeo' ? 'Assistir em' : (n.tipo === 'Podcast' ? 'Ouvir em' : (n.src.length > 1 ? 'Fontes' : 'Fonte'));
  const shareTxt = 'Sinal ' + n.n + ': ' + n.t + '\n\n' + hl + '\n\nOutro lado e fontes: ' + url(n);
  const dcls = isAlerta(n) ? ' al' : (isVS(n) ? ' vs' : '');
  return head({ title, desc, canonical: url(n), image: url(n) + 'og.jpg', imgW: 1200, imgH: 630, rel }) + `
<body>
${topbar(rel, 'sinal')}
<main>
<p class="crumb"><a href="${rel}sinais/">← Todos os Sinais</a></p>
<article class="card">
<div class="hd">${hdHTML(n, true, rel)}</div>
<h1>${esc(n.t)}</h1>
<p class="dest${dcls}">${esc(hl)}</p>
<p class="txt">${esc(n.s)}</p>
${n.why ? `<p class="why"><b>${esc(n.wl || 'Por que ler:')}</b> ${esc(n.why)}</p>` : ''}
<p class="src">${srcLbl}: ${n.src.map(s => `<a href="${esc(s[1])}" target="_blank" rel="noopener noreferrer">${esc(s[0])}</a>`).join('; ')}</p>
<div class="acts">
<a class="btn" href="https://wa.me/?text=${encodeURIComponent(shareTxt)}" target="_blank" rel="noopener noreferrer">${ICON_WA}Mandar no WhatsApp</a>
<button class="btn o" type="button" data-copy="${esc(url(n))}">${ICON_LINK}<span>Copiar link</span></button>
<a class="btn o" href="sinal-${n.n}.png" download="sinal-${n.n}.png">${ICON_IMG}Baixar imagem</a>
</div>
<figure class="img"><img src="sinal-${n.n}.png" width="1080" height="1350" loading="lazy" alt="Imagem para compartilhar do Sinal ${n.n}: ${esc(n.t)}"><figcaption>Imagem pronta para Instagram e Stories.</figcaption></figure>
</article>
<nav class="pn" aria-label="Outros Sinais">
${prev ? `<a href="../${prev.n}/"><span>← Sinal ${prev.n}</span>${esc(short(prev.t))}</a>` : ''}
${next ? `<a class="nx" href="../${next.n}/"><span>Sinal ${next.n} →</span>${esc(short(next.t))}</a>` : ''}
</nav>
<p class="crumb" style="margin-top:22px"><a href="${rel}">Ver o painel completo</a> · <a href="${rel}sinais/">Todos os Sinais</a></p>
</main>
${foot(rel)}
<script>
document.querySelectorAll('[data-copy]').forEach(function(b){b.addEventListener('click',function(){var u=b.getAttribute('data-copy'),s=b.querySelector('span');function ok(){s.textContent='Link copiado';setTimeout(function(){s.textContent='Copiar link';},2200);}
if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(u).then(ok,function(){prompt('Copie o link:',u);});}else{prompt('Copie o link:',u);}});});
</script>
</body>
</html>
`;
}
function short(t) { return t.length > 70 ? t.slice(0, 67).replace(/\s+\S*$/, '') + '…' : t; }

function listPage() {
  const rel = '../';
  const cnt = { all: NEWS.length, alerta: NEWS.filter(isAlerta).length, regras: NEWS.filter(isRegras).length, vs: NEWS.filter(isVS).length };
  const items = NEWS.map(n => {
    const f = ['all', isAlerta(n) && 'alerta', isRegras(n) && 'regras', isVS(n) && 'vs'].filter(Boolean).join(' ');
    const idx = (n.n + ' ' + parseInt(n.n, 10) + ' ' + n.t + ' ' + n.s + ' ' + (n.tags || []).join(' ') + ' ' + (n.destaque || '')).toLowerCase();
    return `<li data-f="${f}" data-i="${esc(idx.normalize('NFD').replace(/[̀-ͯ]/g, ''))}"><a href="${n.n}/"><div class="hd">${hdHTML(n, false, rel)}</div><p class="t">${esc(n.t)}</p><p class="d">${esc(highlight(n))}</p></a></li>`;
  }).join('\n');
  const desc = 'Fatos que devem chamar nossa atenção sobre a direita radical e extrema, com fonte e outro lado. Cada Sinal tem link próprio para compartilhar.';
  return head({ title: 'Sinais · ' + BRAND, desc, canonical: BASE + 'sinais/', image: BASE + 'og-observatorio.jpg', imgW: 1200, imgH: 630, rel, type: 'website' }) + `
<body>
${topbar(rel, 'lista')}
<main>
<p class="crumb"><a href="${rel}">← Painel completo</a></p>
<h1 class="list-h1">Sinais</h1>
<p class="lead">Fatos que devem chamar nossa atenção, com fonte e outro lado. Toque num Sinal para abrir a página dele e compartilhar.</p>
<div class="filt" role="group" aria-label="Filtrar Sinais">
<button class="chip" type="button" data-k="all" aria-pressed="true">Todos<small>${cnt.all}</small></button>
<button class="chip" type="button" data-k="alerta" aria-pressed="false">⚠ Alertas<small>${cnt.alerta}</small></button>
<button class="chip" type="button" data-k="regras" aria-pressed="false">Eleições e regras<small>${cnt.regras}</small></button>
<button class="chip" type="button" data-k="vs" aria-pressed="false">Você sabia?<small>${cnt.vs}</small></button>
</div>
<label for="q" class="lead" style="display:block;margin:4px 0 6px">Buscar nos Sinais</label>
<input id="q" class="q" type="search" placeholder="número, nome ou assunto" autocomplete="off">
<p id="none" class="empty" hidden>Nenhum Sinal encontrado.</p>
<ul class="sl" id="sl">
${items}
</ul>
</main>
${foot(rel)}
<script>
(function(){var k='all',q=document.getElementById('q'),lis=[].slice.call(document.querySelectorAll('#sl li')),none=document.getElementById('none'),chips=[].slice.call(document.querySelectorAll('.chip'));
function norm(s){return s.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').trim();}
function run(){var t=norm(q.value),n=0,num=/^\\d{1,3}$/.test(t)?('000'+t).slice(-3):null;lis.forEach(function(li){var ok=li.getAttribute('data-f').split(' ').indexOf(k)>=0&&(!t||(num?li.getAttribute('data-i').indexOf(num+' ')===0:t.split(/\\s+/).every(function(w){return li.getAttribute('data-i').indexOf(w)>=0;})));li.hidden=!ok;if(ok)n++;});none.hidden=n>0;}
chips.forEach(function(c){c.addEventListener('click',function(){k=c.getAttribute('data-k');chips.forEach(function(x){x.setAttribute('aria-pressed',x===c?'true':'false');});run();try{history.replaceState(null,'',k==='all'?location.pathname:'#'+k);}catch(e){}});});
q.addEventListener('input',run);
var h=location.hash.slice(1);if(h){var c=chips.filter(function(x){return x.getAttribute('data-k')===h;})[0];if(c)c.click();}
})();
</script>
</body>
</html>
`;
}

fs.mkdirSync(path.join(ROOT, 'sinais'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'sinais/index.html'), listPage());
byNum.forEach((n, i) => {
  const dir = path.join(ROOT, 'sinais', n.n); fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), sinalPage(n, i));
});
console.log('Páginas geradas:', byNum.length, '+ lista');
