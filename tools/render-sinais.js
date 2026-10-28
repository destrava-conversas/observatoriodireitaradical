#!/usr/bin/env node
/* Gera as imagens de cada Sinal com Playwright:
   sinais/NNN/og.jpg        1200x630, prévia do link (WhatsApp, redes)
   sinais/NNN/sinal-NNN.png 1080x1350, a mesma imagem do botão "Imagem" do painel
   Uso: node tools/render-sinais.js [045 046 ...]   (sem números: gera só as que faltam; --todas refaz tudo)
   As fontes vêm de tools/fonts via tools/fontroute.js (funciona sem internet). */
const fs = require('fs'), path = require('path'), http = require('http'), vm = require('vm');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');

const ctxv = { window: {} }; vm.createContext(ctxv);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'data/sinais.js'), 'utf8').replace('window.PD = window.PD || {};', 'var PD = window.PD = {};'), ctxv);
const NEWS = ctxv.window.PD.NEWS.filter(n => n.n);
const args = process.argv.slice(2), all = args.includes('--todas'), only = args.filter(a => /^\d{3}$/.test(a));
const todo = NEWS.filter(n => all || (only.length ? only.includes(n.n) : !fs.existsSync(path.join(ROOT, 'sinais', n.n, 'og.jpg')) || !fs.existsSync(path.join(ROOT, 'sinais', n.n, 'sinal-' + n.n + '.png'))));


const MESES = ['jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
const ndate = n => n.quando || (p => parseInt(p[2], 10) + ' ' + MESES[+p[1] - 1] + ' ' + p[0])(n.d.split('-'));
const ALERTA = { regras: 'Regras do jogo', inimigo: 'Adversário como inimigo', violencia: 'Violência', liberdades: 'Liberdades' };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const highlight = n => n.destaque || ((n.s || '').match(/“([^”]{12,200})”/) ? '“' + n.s.match(/“([^”]{12,200})”/)[1] + '”' : n.s.split(/(?<=\.)\s/)[0]);

function ogHTML(n) {
  const vs = n.tipo === 'Você sabia?', al = (n.alerta || []).length;
  const bar = al ? '#E2553F' : (vs ? '#4DB3D6' : '#E8873F');
  const kick = 'SINAL ' + n.n + ' · ' + (vs ? 'VOCÊ SABIA? · ' : '') + ndate(n).toUpperCase();
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Montserrat:wght@800&family=Public+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}html,body{margin:0}
body{width:1200px;height:630px;background:#0A1A3F;color:#fff;font-family:'Public Sans',sans-serif;position:relative;overflow:hidden}
.top{position:absolute;left:64px;right:64px;top:44px;display:flex;align-items:center;justify-content:space-between}
.br{display:flex;align-items:center;gap:16px;font-family:'Montserrat',sans-serif;font-weight:800;font-size:24px;line-height:1.12;letter-spacing:-.01em}
.br b{color:#A6F36A}
.eye{width:76px;height:42px;border-radius:38px/21px;border:5px solid #A6F36A;display:flex;align-items:center;justify-content:center}
.eye i{width:20px;height:20px;border-radius:50%;background:#A6F36A}
.mid{position:absolute;left:64px;right:64px;top:150px;bottom:96px;display:flex;flex-direction:column;justify-content:center;gap:22px}
.k{font-weight:600;font-size:26px;letter-spacing:.06em;color:#C9D3EA;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.al{font-weight:800;font-size:22px;letter-spacing:.02em;background:#FDE2E2;color:#8A1C1C;border-radius:999px;padding:4px 14px}
.d{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;line-height:1.12;letter-spacing:-.015em;border-left:10px solid ${bar};padding-left:28px;text-wrap:balance}
.ft{position:absolute;left:64px;right:64px;bottom:40px;display:flex;justify-content:space-between;align-items:center;font-size:23px;color:#C9D3EA}
.cta{background:#A6F36A;color:#0A1A3F;font-weight:800;border-radius:999px;padding:10px 22px;font-size:23px}
</style></head><body>
<div class="top"><div class="br"><span class="eye"><i></i></span><span>Painel Observatório da<br><b>Direita Radical e Extrema</b></span></div></div>
<div class="mid"><div class="k"><span>${esc(kick)}</span>${(n.alerta || []).map(k => '<span class="al">⚠ ' + esc(ALERTA[k]) + '</span>').join('')}</div>
<div class="d" id="d">${esc(highlight(n))}</div></div>
<div class="ft"><span>destrava-conversas.com.br</span><span class="cta">Outro lado e fontes no painel</span></div>
<script>(function(){var d=document.getElementById('d'),m=document.querySelector('.mid'),s=60;d.style.fontSize=s+'px';while(s>30&&(m.scrollHeight>m.clientHeight+1)){s-=2;d.style.fontSize=s+'px';}})();</script>
</body></html>`;
}

function serve() {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
  return new Promise(res => {
    const s = http.createServer((q, r) => {
      let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
      r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
    }).listen(0, '127.0.0.1', () => res(s));
  });
}

(async () => {
  const srv = await serve(), port = srv.address().port;
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await require(process.env.FONTROUTE ? path.resolve(process.env.FONTROUTE) : path.join(__dirname, 'fontroute.js'))(ctx);
  const panel = await ctx.newPage();
  await panel.goto('http://127.0.0.1:' + port + '/', { waitUntil: 'networkidle' });
  await panel.evaluate(() => document.fonts.ready);
  await panel.evaluate(() => window.__prepShare());
  const og = await ctx.newPage();
  for (const n of todo) {
    const dir = path.join(ROOT, 'sinais', n.n); fs.mkdirSync(dir, { recursive: true });
    await og.setContent(ogHTML(n), { waitUntil: 'networkidle' });
    await og.evaluate(() => document.fonts.ready);
    await og.evaluate(() => { var d = document.getElementById('d'), m = document.querySelector('.mid'), s = 60; d.style.fontSize = s + 'px'; while (s > 30 && m.scrollHeight > m.clientHeight + 1) { s -= 2; d.style.fontSize = s + 'px'; } });
    await og.screenshot({ path: path.join(dir, 'og.jpg'), type: 'jpeg', quality: 86 });
    const data = await panel.evaluate(num => { const n = window.PD.NEWS.find(x => x.n === num); if (!n) return "ERR:" + window.PD.NEWS.length + ":" + JSON.stringify(window.PD.NEWS[0]).slice(0,120); return window.__sinalCanvas(n).toDataURL('image/png'); }, n.n);
    if (data.startsWith('ERR')) { console.log(data); continue; }
    fs.writeFileSync(path.join(dir, 'sinal-' + n.n + '.png'), Buffer.from(data.split(',')[1], 'base64'));
    process.stdout.write(n.n + ' ');
  }
  console.log('\nImagens de Sinais geradas:', todo.length);
  /* argumentos de bolso e respostas de "Se te disserem…" (sempre refeitas: são poucas) */
  const png = d => Buffer.from(d.split(',')[1], 'base64');
  let nb = 0;
  for (const n of NEWS.filter(x => x.bolso)) {
    const d = await panel.evaluate(o => window.__bolsoCanvas(o).toDataURL('image/png'), { kick: 'Argumento de bolso · Sinal ' + n.n, text: n.bolso, fonte: n.bf || '', sinal: n.n });
    fs.writeFileSync(path.join(ROOT, 'sinais', n.n, 'argumento-' + n.n + '.png'), png(d)); nb++;
  }
  const un = t => t.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim();
  const frag = fs.readFileSync(path.join(ROOT, 'tools/paginas/_respostas.html'), 'utf8');
  const outR = path.join(ROOT, 'se-te-disserem', 'img'); fs.mkdirSync(outR, { recursive: true });
  /* faixa do olho de cada resposta (img/olhos): a etapa ou o alerta do assunto */
  const RSP_OLHO = { exilados: 'fuga-b', '8-de-janeiro': 'violencia-a', prorrogacao: 'regras-a', tarifas: 'fora-b' };
  let nr = 0;
  for (const m of frag.matchAll(/<li class="rsp-i" id="([^"]+)"[^>]*>([\s\S]*?)\n      <\/li>/g)) {
    const id = m[1], body = m[2];
    const q = un((body.match(/<p class="rsp-q">([\s\S]*?)<\/p>/) || [])[1] || '').replace(/^Se te disserem/, '').replace(/^“|”$/g, '');
    const a = un((body.match(/<p class="rsp-a">([\s\S]*?)<\/p>/) || [])[1] || '').replace(/^Responda/, '');
    const f = un((body.match(/<p class="rsp-s">([\s\S]*?)<\/p>/) || [])[1] || '').replace(/^Fonte:\s*/, '');
    const xm = m[0].match(/data-img="([^"]*)"/); const extra = xm ? un(xm[1]).split(' | ') : null;
    const d = await panel.evaluate(o => window.__bolsoCanvas(o).toDataURL('image/png'), { kick: 'Se te disserem', quote: q, label: 'Responda', text: a, fonte: f, extra: extra, theme: 'rsp', olho: RSP_OLHO[id] || 'padrao-a' });
    fs.writeFileSync(path.join(outR, id + '.png'), png(d)); nr++;
  }
  console.log('Argumentos de bolso:', nb, '· respostas:', nr);
  await b.close(); srv.close();
})();
