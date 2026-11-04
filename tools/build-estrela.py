import sys, math, numpy as np
"""Faixa da Esperança (img/olhos/olho-esperanca-a.jpg, 1080x300): estrela amarela sobre mancha de papel rasgado, no estilo da colagem dos olhos.
Uso: python3 tools/build-estrela.py 3 11 img/olhos/olho-esperanca-a.jpg .36 (painel da referência, semente, saída, largura da mancha); a variante b é o espelho."""
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageEnhance, ImageChops
sys.path.insert(0,'/home/claude/eoflavio/tools')
ref=Image.open('/home/claude/eoflavio/tools/olhos-ref/referencia-colagem.jpg').convert('RGB')
X=[(0,857),(859,1716),(1719,2576)]; Y=[(0,476),(478,959),(961,1438)]
P=[ref.crop((x0,y0,x1,y1)) for (y0,y1) in Y for (x0,x1) in X]
S=2; W,H=1080*S,300*S
rng=np.random.default_rng(int(sys.argv[2]) if len(sys.argv)>2 else 7)
def cover(img,w,h,cy=.5):
    iw,ih=img.size; sc=max(w/iw,h/ih); im=img.resize((int(iw*sc)+1,int(ih*sc)+1),Image.LANCZOS)
    x=(im.size[0]-w)//2; y=int((im.size[1]-h)*cy); return im.crop((x,y,x+w,y+h))
base_p=int(sys.argv[1]) if len(sys.argv)>1 else 7
bg=cover(P[base_p-1],W,H,.5)
# raios saindo do centro (esperança), multiplicados sobre o papel
rays=Image.new('L',(W,H),0); d=ImageDraw.Draw(rays); cx,cy=W/2,H*0.52; N=28
for i in range(N):
    if i%2: continue
    a0=2*math.pi*i/N; a1=2*math.pi*(i+1)/N; R=W
    d.polygon([(cx,cy),(cx+R*math.cos(a0),cy+R*math.sin(a0)),(cx+R*math.cos(a1),cy+R*math.sin(a1))],fill=255)
rays=rays.filter(ImageFilter.GaussianBlur(2*S))
noise=Image.fromarray((rng.random((H,W))*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1))
rays=ImageChops.multiply(rays,noise.point(lambda v:255 if v>60 else 120))
dark=ImageEnhance.Brightness(bg).enhance(.35)
bg=Image.composite(dark,bg,rays.point(lambda v:int(v*.55)))
# mancha preta de papel rasgado no centro
def torn_blob(w,h,cx,cy,rx,ry,jit=.07,n=180):
    m=Image.new('L',(w,h),0); dd=ImageDraw.Draw(m); pts=[]
    r=np.cumsum(rng.normal(0,jit/6,n)); r=r-np.linspace(0,r[-1],n)
    for i in range(n):
        t=2*math.pi*i/n; k=1+r[i]+rng.normal(0,jit/3)
        pts.append((cx+rx*k*math.cos(t), cy+ry*k*math.sin(t)))
    dd.polygon(pts,fill=255); return m
def torn2(cx,cy,rx,ry):
    n=900; t=np.linspace(0,2*math.pi,n,endpoint=False)
    low=np.zeros(n)
    for k,a in [(2,.05),(3,.05),(5,.035),(9,.02),(17,.012)]:
        low+=a*np.sin(k*t+rng.random()*6.3)
    hi=np.convolve(rng.normal(0,.012,n),np.ones(5)/5,'same')
    k=1+low+hi
    m=Image.new('L',(W,H),0); ImageDraw.Draw(m).polygon(list(zip(cx+rx*k*np.cos(t),cy+ry*k*np.sin(t))),fill=255); return m
blob=torn2(W/2,H*.52,W*float(sys.argv[4]) if len(sys.argv)>4 else W*.31,H*.58)
shadow=blob.filter(ImageFilter.GaussianBlur(10*S)).point(lambda v:int(v*.5))
bg=Image.composite(Image.new('RGB',(W,H),(0,0,0)),bg,shadow)
blk=Image.new('RGB',(W,H),(12,12,14))
gr=Image.fromarray((rng.random((H,W))*40).astype(np.uint8)).convert('RGB')
blk=ImageChops.add(blk,gr)
bg=Image.composite(blk,bg,blob)
ry=Image.new('L',(W,H),0); dr=ImageDraw.Draw(ry); cx0,cy0=W/2,H*.53; N=36
for i in range(0,N,2):
    a0=2*math.pi*i/N; a1=2*math.pi*(i+.45)/N
    dr.polygon([(cx0,cy0),(cx0+W*math.cos(a0),cy0+W*math.sin(a0)),(cx0+W*math.cos(a1),cy0+W*math.sin(a1))],fill=255)
ry=ImageChops.multiply(ry,blob).filter(ImageFilter.GaussianBlur(1.5*S))
gn=Image.fromarray((rng.random((H,W))*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2*S)).point(lambda v:255 if v>90 else 0)
ry=ImageChops.multiply(ry,gn).point(lambda v:int(v*.16))
bg=Image.composite(Image.new('RGB',(W,H),(250,204,21)),bg,ry)
# estrela: contorno grosso + estrela cheia menor, em amarelo, com textura de impressão
def star_pts(cx,cy,R,r,rot=-90):
    pts=[]
    for i in range(10):
        a=math.radians(rot+36*i); rr=R if i%2==0 else r
        pts.append((cx+rr*math.cos(a),cy+rr*math.sin(a)))
    return pts
Y_=(250,204,21)
cx,cy=W/2,H*.55; R=H*.40
st=Image.new('L',(W,H),0); ds=ImageDraw.Draw(st)
ds.polygon(star_pts(cx,cy,R,R*.42),fill=255); ds.polygon(star_pts(cx,cy,R*.80,R*.80*.42),fill=0)
ds.polygon(star_pts(cx,cy,R*.52,R*.52*.42),fill=255)
# borda irregular
st=st.filter(ImageFilter.GaussianBlur(1.2*S)); n2=Image.fromarray((rng.random((H,W))*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.8*S))
st=st.filter(ImageFilter.GaussianBlur(2.2*S))
nz=Image.fromarray((rng.random((H,W))*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.6*S))
st=Image.fromarray(np.where(np.asarray(st).astype(int)+ (np.asarray(nz).astype(int)-128)*0.9 >128,255,0).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.5*S))
hol=Image.fromarray(((rng.random((H,W))>.992)*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.3*S)).point(lambda v:255 if v>25 else 0)
st=ImageChops.subtract(st,hol)
fill=Image.new('RGB',(W,H),Y_)
spk=Image.fromarray(((rng.random((H,W))>.985)*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.7*S)).point(lambda v:255 if v>40 else 0)
fill=Image.composite(Image.new('RGB',(W,H),(30,24,0)),fill,spk)
bg=Image.composite(fill,bg,st)
# brilhos de quatro pontas
def spark(dd,x,y,s):
    dd.polygon([(x,y-s),(x+s*.22,y-s*.22),(x+s,y),(x+s*.22,y+s*.22),(x,y+s),(x-s*.22,y+s*.22),(x-s,y),(x-s*.22,y-s*.22)],fill=255)
sp=Image.new('L',(W,H),0); dsp=ImageDraw.Draw(sp)
for x,y,s in [(.30,.22,.07),(.70,.80,.06),(.74,.20,.045),(.27,.78,.045),(.20,.50,.035),(.80,.48,.035)]:
    spark(dsp,W*x,H*y,H*s)
bg=Image.composite(Image.new('RGB',(W,H),Y_),bg,sp)
out=bg.resize((1080,300),Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.2,60,2))
out.save(sys.argv[3] if len(sys.argv)>3 else 'estrela.jpg',quality=88)
