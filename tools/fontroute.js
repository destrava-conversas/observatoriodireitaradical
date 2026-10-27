/* Serve as fontes do painel a partir de tools/fonts (licença OFL), sem depender da internet.
   Usado por tools/render-sinais.js para que as imagens saiam com as fontes certas. */
const fs = require('fs'), path = require('path');
const D = path.join(__dirname, 'fonts');
const faces = [['Bricolage Grotesque', 'bricolage-grotesque', [600, 800]], ['Public Sans', 'public-sans', [400, 500, 600, 700, 800]], ['Montserrat', 'montserrat', [800]]];
module.exports = async function (ctx) {
  await ctx.route('https://gc.zgo.at/**', r => r.abort());
  await ctx.route('https://fonts.googleapis.com/**', r => {
    let css = '';
    faces.forEach(([fam, slug, ws]) => ws.forEach(w => { css += `@font-face{font-family:'${fam}';font-weight:${w};font-style:normal;font-display:block;src:url(https://fonts.local/${slug}/${w}.woff2) format('woff2');}\n`; }));
    r.fulfill({ status: 200, contentType: 'text/css', body: css });
  });
  await ctx.route('https://fonts.gstatic.com/**', r => r.abort());
  await ctx.route('https://fonts.local/**', r => {
    const m = r.request().url().match(/local\/([^/]+)\/(\d+)/);
    const f = path.join(D, m[1] + '-latin-' + m[2] + '-normal.woff2');
    if (!fs.existsSync(f)) return r.abort();
    r.fulfill({ status: 200, contentType: 'font/woff2', body: fs.readFileSync(f) });
  });
};
