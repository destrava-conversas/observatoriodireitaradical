#!/usr/bin/env node
/* Gera as faixas do topo das imagens de compartilhar (img/olhos/olho-<categoria>-<a|b>.jpg, 1080x300).
   Uma variação do olho por categoria: as 4 categorias de alerta (regras, violencia, inimigo, liberdades),
   3 etapas do método eleitoral (fora = pressão de fora, fuga = fugir e se dizer perseguido, anistia) e o olho padrão.
   Uso: NODE_PATH=$(npm root -g) node tools/build-olhos.js   (só precisa rodar de novo se o desenho mudar) */
const path = require('path');
const { chromium } = require('playwright'); const fs=require('fs');
const N='#0A1A3F', L='#A6F36A', R='#FF5A4E', O='#F2A33A', W='#EEF1F4';
const W0=1080,H0=300,CX=540,CY=150;
const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
let SH=['#0E2150','#132a5f','#1a336f','#0c1c48','#223c7c','#08153a'];
function bg(seed,acc,H0=300,sh=SH,spk='#2b4a94'){const r=rng(seed);let s='';
 // big shards
 for(let i=0;i<26;i++){const x=r()*W0*1.2-60,y=r()*H0*1.4-60,len=120+r()*520,a=r()*Math.PI*2,w=18+r()*90;
  const p1=[x,y],p2=[x+Math.cos(a)*len,y+Math.sin(a)*len],p3=[x+Math.cos(a+Math.PI/2)*w,y+Math.sin(a+Math.PI/2)*w];
  const c=r()<.14?acc:sh[Math.floor(r()*sh.length)], op=c===acc?(.10+r()*.12):(.55+r()*.45);
  s+=`<polygon points="${[p1,p2,p3].map(p=>p.map(v=>v.toFixed(0)).join(',')).join(' ')}" fill="${c}" opacity="${op.toFixed(2)}" style="mix-blend-mode:${r()<.5?'screen':'normal'}"/>`;}
 // thin spikes
 for(let i=0;i<10;i++){const x=r()*W0,y=r()<.5?-10:H0+10,a=(y<0?1:-1)*(Math.PI/2+(r()-.5)*1.4),len=80+r()*220,w=6+r()*10;
  s+=`<polygon points="${x-w},${y} ${x+w},${y} ${(x+Math.cos(a)*len).toFixed(0)},${(y+Math.sin(a)*len).toFixed(0)}" fill="${r()<.3?acc:spk}" opacity="${(.18+r()*.25).toFixed(2)}"/>`;}
 return s;}
const grain=(seed)=>`<filter id="n${seed}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="${seed}" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .55"/></feComponentTransfer></filter>
<filter id="m${seed}"><feTurbulence type="fractalNoise" baseFrequency=".012 .03" numOctaves="2" seed="${seed+7}"/><feColorMatrix values="0 0 0 0 .05  0 0 0 0 .1  0 0 0 0 .25  0 0 0 .9 -.25"/></filter>`;
const lids=(cx=CX,cy=CY,rx=440,ry=125,c=L,sw=24)=>`<path d="M${cx-rx},${cy} Q${cx},${cy-ry*2} ${cx+rx},${cy} Q${cx},${cy+ry*2} ${cx-rx},${cy} Z" fill="${N}" fill-opacity=".55" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>`;
const iris=(cx=CX,cy=CY,r1=95,r2=40,c=L)=>`<circle cx="${cx}" cy="${cy}" r="${r1}" fill="${c}"/><circle cx="${cx}" cy="${cy}" r="${r2}" fill="${N}"/>`;
const star=(cx,cy,n,ri,ro,c,rot=0)=>`<polygon points="${Array.from({length:n*2},(_,i)=>{const a=rot+i*Math.PI/n,r=i%2?ri:ro;return (cx+r*Math.cos(a)).toFixed(1)+','+(cy+r*Math.sin(a)).toFixed(1)}).join(' ')}" fill="${c}"/>`;
const clipEye=`<clipPath id="ce"><path d="M100,150 Q540,-100 980,150 Q540,400 100,150 Z"/></clipPath>`;
const V=[
 ['regras','a','Regras do jogo · rachadura',R,`${lids()}${iris()}<path d="M330,-10 L480,120 L440,160 L600,310" fill="none" stroke="${N}" stroke-width="30"/><path d="M330,-10 L480,120 L440,160 L600,310" fill="none" stroke="${R}" stroke-width="8"/>`],
 ['regras','b','Regras do jogo · olho partido',R,`<defs><clipPath id="t"><polygon points="0,0 1080,0 1080,40 0,200"/></clipPath><clipPath id="u"><polygon points="0,200 1080,40 1080,300 0,300"/></clipPath></defs><g clip-path="url(#t)" transform="translate(-26,-14)">${lids()}${iris()}</g><g clip-path="url(#u)" transform="translate(26,14)">${lids()}${iris()}</g><line x1="0" y1="200" x2="1080" y2="40" stroke="${R}" stroke-width="6"/>`],
 ['violencia','a','Violência · íris em explosão',R,`${lids(CX,CY,440,125,R)}${star(CX,CY,12,55,118,R)}<circle cx="${CX}" cy="${CY}" r="34" fill="${N}"/>`],
 ['violencia','b','Violência · estilhaços',R,`${lids(CX,CY,440,125,R)}${iris(CX,CY,80,34,R)}${Array.from({length:14},(_,i)=>{const a=i*Math.PI/7+.2,r0=105,r1=i%2?210:300;const p=(r,da)=>[(CX+r*Math.cos(a+da)).toFixed(0),(CY+r*Math.sin(a+da)*.7).toFixed(0)].join(',');return `<polygon points="${p(r0,-.05)} ${p(r0,.05)} ${p(r1,0)}" fill="${R}"/>`}).join('')}`],
 ['inimigo','a','Adversário como inimigo · mira',O,`${lids()}<circle cx="${CX}" cy="${CY}" r="98" fill="none" stroke="${O}" stroke-width="13"/><circle cx="${CX}" cy="${CY}" r="16" fill="${O}"/><path d="M${CX},25 V100 M${CX},200 V275 M415,${CY} H490 M590,${CY} H665" stroke="${O}" stroke-width="13"/>`],
 ['inimigo','b','Adversário como inimigo · alvo',O,`${lids()}${[100,76,52,28].map((r,i)=>`<circle cx="${CX}" cy="${CY}" r="${r}" fill="${i%2?N:O}"/>`).join('')}<circle cx="${CX}" cy="${CY}" r="9" fill="${N}"/><polygon points="760,20 1000,-20 790,45" fill="${O}"/><line x1="560" y1="140" x2="780" y2="35" stroke="${W}" stroke-width="7"/><polygon points="560,140 585,112 596,135" fill="${W}"/>`],
 ['liberdades','a','Liberdades · grades',L,`${lids()}${iris()}${Array.from({length:9},(_,i)=>`<rect x="${150+i*95}" y="0" width="20" height="${H0}" fill="${W}"/>`).join('')}`],
 ['liberdades','b','Liberdades · tarja de censura',L,`${lids()}${iris()}<rect x="200" y="${CY-48}" width="680" height="96" fill="#05091A" transform="rotate(-3 540 150)"/><rect x="200" y="${CY-48}" width="680" height="10" fill="${L}" opacity=".5" transform="rotate(-3 540 150)"/>`],
 ['fora','a','Pressão de fora · globo',O,`${lids()}<circle cx="${CX}" cy="${CY}" r="95" fill="${L}"/><g stroke="${N}" stroke-width="7" fill="none"><circle cx="${CX}" cy="${CY}" r="62"/><ellipse cx="${CX}" cy="${CY}" rx="26" ry="62"/><path d="M478,${CY} H602 M488,118 H592 M488,182 H592"/></g>${[[30,40,320,128],[1050,40,760,128],[30,260,320,172],[1050,260,760,172]].map(([a,b,c,d])=>`<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="${O}" stroke-width="11"/><circle cx="${c}" cy="${d}" r="11" fill="${O}"/>`).join('')}`],
 ['fora','b','Pressão de fora · olho espremido',O,`${lids(CX,CY,440,72)}${iris(CX,CY,62,28)}${[0,1,2,3,4].map(i=>{const x=300+i*120;return `<polygon points="${x-40},-5 ${x+40},-5 ${x},55" fill="${O}"/><polygon points="${x-40},305 ${x+40},305 ${x},245" fill="${O}"/>`}).join('')}`],
 ['fuga','a','Fuga · pupila que escapa',W,`${lids(470,CY,400,118)}${iris(760,CY,82,34)}<path d="M846,150 C950,135 990,70 1090,25" fill="none" stroke="${W}" stroke-width="8" stroke-dasharray="22 16"/><polygon points="1030,40 1075,18 1066,64" fill="${W}"/>`],
 ['fuga','b','Fuga · olho vazio',W,`${lids()}<circle cx="${CX}" cy="${CY}" r="95" fill="none" stroke="${L}" stroke-width="6" stroke-dasharray="14 12"/>${[0,1,2,3,4].map(i=>`<circle cx="${700+i*85}" cy="${150-i*24}" r="${36-i*5}" fill="${L}" opacity="${(1-i*.17).toFixed(2)}"/>`).join('')}`],
 ['anistia','a','Anistia · olho fechado',L,`<path d="M100,70 Q540,330 980,70" fill="none" stroke="${L}" stroke-width="24" stroke-linecap="round"/>${[0,1,2,3,4,5,6].map(i=>{const x=215+i*108,t=(x-100)/880,y0=70+2*t*(1-t)*260+4;return `<line x1="${x}" y1="${y0}" x2="${x-14}" y2="${y0+48}" stroke="${L}" stroke-width="13" stroke-linecap="round"/>`}).join('')}`],
 ['anistia','b','Anistia · olho apagado',L,`<defs><mask id="er"><rect width="1080" height="300" fill="#fff"/><path d="M260,40 C420,120 520,60 700,170 S900,240 1000,200" stroke="#000" stroke-width="95" fill="none" stroke-linecap="round" opacity=".92"/></mask></defs><g mask="url(#er)">${lids()}${iris()}</g><path d="M260,40 C420,120 520,60 700,170 S900,240 1000,200" stroke="${W}" stroke-width="3" fill="none" opacity=".35" stroke-dasharray="4 10"/>`],
  ['padrao','a','Olho padrão',L,`${lids()}${iris()}`],
];
/* Muro: concreto e blocos gastos, cartazes rasgados sem texto legível, sujeira e pichações antigas apagadas.
   O olho vem por cima como spray: borda irregular, névoa de tinta (overspray), tinta falhada e escorridos. */
function wall(seed){const r=rng(seed*3+11);let s='';
 const G=['#3b3d40','#36383b','#414346','#323437','#44464a','#2f3134'];
 // blocos de concreto com rejunte
 const bw=150,bh=62;for(let row=0;row*bh<H0+bh;row++){const off=row%2?-bw/2:0;for(let x=off;x<W0+bw;x+=bw){
  s+=`<rect x="${x+2}" y="${row*bh+2}" width="${bw-4}" height="${bh-4}" fill="${G[Math.floor(r()*G.length)]}"/>`;}}
 // cartazes rasgados: retângulos com bordas rasgadas, papel envelhecido, só barras ilegíveis no lugar de texto
 for(let i=0;i<6;i++){const x0=r()*W0-60,y0=r()*H0-60,w=120+r()*190,h=110+r()*170,rot=(r()-.5)*10,pts=[];
  const edge=(xa,ya,xb,yb,j,n)=>{for(let k=0;k<n;k++){const t=k/n;pts.push([(xa+(xb-xa)*t+(r()-.5)*j).toFixed(0),(ya+(yb-ya)*t+(r()-.5)*j).toFixed(0)].join(','));}};
  edge(x0,y0,x0+w,y0,r()<.6?26:6,12);edge(x0+w,y0,x0+w,y0+h,r()<.5?22:5,9);edge(x0+w,y0+h,x0,y0+h,r()<.6?30:6,12);edge(x0,y0+h,x0,y0,5,9);
  const tone=['#b9b3a6','#a8a294','#c6c0b3','#8f8a80'][Math.floor(r()*4)];
  s+=`<g transform="rotate(${rot.toFixed(1)} ${(x0+w/2).toFixed(0)} ${(y0+h/2).toFixed(0)})" opacity="${(.32+r()*.22).toFixed(2)}"><polygon points="${pts.join(' ')}" fill="${tone}"/>`;
  s+=`<rect x="${(x0+w*.1).toFixed(0)}" y="${(y0+h*.12).toFixed(0)}" width="${(w*.8).toFixed(0)}" height="${(h*.22).toFixed(0)}" fill="#1b1c1e" opacity=".7"/>`;
  for(let l=0;l<4;l++){const lw=w*(.3+r()*.5);s+=`<rect x="${(x0+w*.1).toFixed(0)}" y="${(y0+h*.45+l*h*.12).toFixed(0)}" width="${lw.toFixed(0)}" height="${(5+r()*6).toFixed(0)}" fill="#1b1c1e" opacity=".45"/>`;}
  s+=`</g>`;}
 // pichações antigas, apagadas e ilegíveis
 for(let i=0;i<5;i++){let x=r()*W0,y=40+r()*(H0-80),d=`M${x.toFixed(0)},${y.toFixed(0)}`;for(let k=0;k<7;k++){x+=18+r()*34;y+=(r()-.5)*60;d+=` Q${(x-10).toFixed(0)},${(y-30*(r()-.5)).toFixed(0)} ${x.toFixed(0)},${y.toFixed(0)}`;}
  s+=`<path d="${d}" fill="none" stroke="${['#15161a','#5b5e63','#24262a'][i%3]}" stroke-width="${(4+r()*6).toFixed(0)}" stroke-linecap="round" opacity="${(.25+r()*.25).toFixed(2)}"/>`;}
 // escorridos de sujeira
 for(let i=0;i<14;i++){const x=r()*W0,y=r()*H0*.6,l=40+r()*160;s+=`<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${(2+r()*4).toFixed(1)}" height="${l.toFixed(0)}" fill="#121315" opacity="${(.15+r()*.2).toFixed(2)}"/>`;}
 return s;}
const wallFx=(seed)=>`<filter id="gr${seed}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="${seed}"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .7"/></feComponentTransfer></filter>
<filter id="st${seed}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".008 .02" numOctaves="3" seed="${seed+3}"/><feColorMatrix values="0 0 0 0 .04  0 0 0 0 .04  0 0 0 0 .05  0 0 0 1.4 -.55"/></filter>
<radialGradient id="vg${seed}" cx="50%" cy="50%" r="75%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".6"/></radialGradient>
<filter id="sp${seed}" x="-5%" y="-10%" width="110%" height="125%">
 <feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="2" seed="${seed+5}" result="n"/>
 <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" result="d"/>
 <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="${seed+9}" result="m"/>
 <feColorMatrix in="m" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 3 -.25" result="ma"/>
 <feComposite in="d" in2="ma" operator="in" result="paint"/>
 <feMerge result="pd"><feMergeNode in="paint"/><feMergeNode in="paint"/></feMerge>
 <feGaussianBlur in="d" stdDeviation="5" result="b"/>
 <feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves="1" seed="${seed+13}" result="fn"/>
 <feColorMatrix in="fn" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 2.4 -1.5" result="fa"/>
 <feComposite in="b" in2="fa" operator="in" result="mist"/>
 <feMerge><feMergeNode in="mist"/><feMergeNode in="pd"/></feMerge>
</filter>`;
function drips(seed,c,skip){if(skip)return '';const r=rng(seed*7+5);let s='';const n=4+Math.floor(r()*3);
 for(let i=0;i<n;i++){const t=.18+r()*.64,x=100+880*t,y=150+500*t*(1-t)-6,l=18+r()*70,w=4+r()*4;
  s+=`<rect x="${(x-w/2).toFixed(1)}" y="${y.toFixed(0)}" width="${w.toFixed(1)}" height="${l.toFixed(0)}" rx="${(w/2).toFixed(1)}" fill="${c}"/><circle cx="${x.toFixed(1)}" cy="${(y+l).toFixed(0)}" r="${(w*.8).toFixed(1)}" fill="${c}"/>`;}
 return s;}
const banner=(v,i)=>{const [c,k,,acc,eye]=v,seed=101+i*37;const dc=c==='violencia'?R:L;
 const wash=(eye.match(/<path d="(M[^"]+Z)" fill="#0A1A3F" fill-opacity="\.55"/)||[])[1];
 const eyeW=eye.replace(/fill="#0A1A3F" fill-opacity="\.55"/g,'fill="none"');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${W0}" height="${H0}" viewBox="0 0 ${W0} ${H0}"><defs>${wallFx(seed)}</defs><rect width="${W0}" height="${H0}" fill="#2c2e31"/>${wall(seed)}<rect width="${W0}" height="${H0}" filter="url(#st${seed})"/><rect width="${W0}" height="${H0}" filter="url(#gr${seed})" opacity=".5" style="mix-blend-mode:overlay"/><rect width="${W0}" height="${H0}" filter="url(#gr${seed})" opacity=".22"/><rect width="${W0}" height="${H0}" fill="url(#vg${seed})"/>${wash?`<path d="${wash}" fill="#0b0c10" opacity=".38"/>`:''}<g filter="url(#sp${seed})">${eyeW}${drips(seed,dc,c==='anistia')}</g></svg>`;};

const OUT = path.join(__dirname, '..', 'img', 'olhos');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W0, height: H0 } });
  for (let i = 0; i < V.length; i++) {
    await p.setContent('<body style="margin:0">' + banner(V[i], i) + '</body>');
    await p.screenshot({ path: path.join(OUT, 'olho-' + V[i][0] + '-' + V[i][1] + '.jpg'), type: 'jpeg', quality: 88 });
  }
  await b.close(); console.log('Faixas geradas:', V.length);
})();
