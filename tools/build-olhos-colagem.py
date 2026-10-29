#!/usr/bin/env python3
"""Gera as faixas de olho (img/olhos/olho-<categoria>-<a|b>.jpg, 1080x300) a partir da
referência de colagem em tools/olhos-ref/referencia-colagem.jpg (grade 3x3 de painéis).
Cada painel entra quase inteiro no centro; as laterais são preenchidas com a textura da
borda do próprio painel e uma borda de papel rasgado esconde a emenda.
Substitui tools/build-olhos.js (muro azul), que fica guardado.
Uso: python3 tools/build-olhos-colagem.py ; depois node tools/render-sinais.js --todas
Painéis: 1 raio · 2 olho vermelho · 3 mira · 4 risco · 5 grades · 6 globo · 7 olho fechado · 8 mira com seta · 9 olho limpo"""
from PIL import Image, ImageFilter, ImageOps, ImageEnhance
import numpy as np, os
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
ref=Image.open(os.path.join(ROOT,'tools/olhos-ref/referencia-colagem.jpg')).convert('RGB')
X=[(0,857),(859,1716),(1719,2576)]; Y=[(0,476),(478,959),(961,1438)]
P=[ref.crop((x0,y0,x1,y1)) for (y0,y1) in Y for (x0,x1) in X]
W,H=1080,300
CY=[.5,.5,.45,.5,.47,.5,.5,.52,.52]
def faixa(p,cy,band=.64):
    w,h=p.size; bh=int(h*band); top=int(min(max(h*cy-bh/2,0),h-bh)); b=p.crop((0,top,w,top+bh))
    b=b.resize((round(w*H/bh),H),Image.LANCZOS); cw=b.size[0]; side=(W-cw)//2+4
    out=Image.new('RGB',(W,H)); strip=min(side,60)
    rng=np.random.default_rng(3)
    for x0,src in ((0,b.crop((0,0,strip,H))),(W-side,b.crop((cw-strip,0,cw,H)))):
        x=x0
        while x<x0+side:
            t=src.copy(); t=ImageOps.mirror(t) if rng.random()<.5 else t; t=ImageOps.flip(t) if rng.random()<.5 else t
            t=ImageEnhance.Brightness(t).enhance(.8); out.paste(t,(x,0)); x+=strip
    a=np.full((H,cw),255,np.uint8)
    for s in (0,1):
        e=np.clip(np.cumsum(rng.normal(0,1.4,H))+9,2,20).astype(int)
        for y in range(H):
            if s==0: a[y,:e[y]]=0
            else: a[y,cw-e[y]:]=0
    m=Image.fromarray(a)
    sm=Image.new('L',(W,H),0); sm.paste(m,((W-cw)//2,2)); sm=sm.filter(ImageFilter.GaussianBlur(7)).point(lambda v:int(v*.45))
    out=Image.composite(Image.new('RGB',(W,H)),out,sm); out.paste(b,((W-cw)//2,0),m)
    return out.filter(ImageFilter.UnsharpMask(1.2,60,2))

from PIL import ImageOps as _O
# categoria: (painel da variante a, painel da variante b; b igual ao a sai espelhado)
MAPA={'regras':(1,1),'violencia':(2,2),'inimigo':(3,8),'liberdades':(4,4),'fuga':(5,5),'fora':(6,6),'anistia':(7,7),'padrao':(9,None)}
out=os.path.join(ROOT,'img','olhos'); n=0
for cat,(a,b) in MAPA.items():
    fa=faixa(P[a-1],CY[a-1]); fa.save(os.path.join(out,f'olho-{cat}-a.jpg'),quality=88); n+=1
    if b is None: continue
    fb=_O.mirror(fa) if b==a else faixa(P[b-1],CY[b-1]); fb.save(os.path.join(out,f'olho-{cat}-b.jpg'),quality=88); n+=1
print('Faixas geradas:',n)
