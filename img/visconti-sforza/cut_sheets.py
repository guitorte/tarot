# Cuts the Visconti-Sforza sheets (img/0097857x.jpg) into single cards.
# Run from the repo root: python3 img/visconti-sforza/cut_sheets.py
import cv2, numpy as np, os, sys
SRC='img'; OUT='img/visconti-sforza'
DBG=sys.argv[1] if len(sys.argv)>1 else None
SHEETS={
 '00978569.jpg':(1,4,['Cups11','Cups12','Cups13','Cups14']),
 '00978572.jpg':(1,4,['Swords11','Swords12','Swords13','Swords14']),
 '00978575.jpg':(1,4,['Wands11','Wands12','Wands13','Wands14']),
 '00978576.jpg':(2,3,['MA-01-Mago','MA-02-Papisa','MA-03-Imperatriz','MA-04-Imperador','MA-05-Papa','MA-06-Amantes']),
 '00978577.jpg':(2,3,['MA-07-Carruagem','MA-08-Justica','MA-09-Eremita','MA-10-Roda','MA-11-Forca','MA-12-Enforcado']),
 '00978578.jpg':(2,3,['MA-13-Morte','MA-14-Temperanca','MA-15-Diabo','MA-16-Torre','MA-17-Estrela','MA-18-Lua']),
 '00978579.jpg':(1,4,['MA-19-Sol','MA-20-Julgamento','MA-21-Mundo','MA-22-Louco']),
}
def seam(cost, center, win=70, step=1):
    """Min-cost top-to-bottom path in columns [center-win, center+win]."""
    h,w=cost.shape; lo=max(0,center-win); hi=min(w,center+win)
    c=cost[:,lo:hi].astype(np.float64); acc=c.copy(); back=np.zeros(c.shape,int)
    for y in range(1,h):
        prev=acc[y-1]; best=prev.copy(); arg=np.arange(prev.size)
        for d in range(1,step+1):
            l=np.r_[np.inf*np.ones(d),prev[:-d]]; r=np.r_[prev[d:],np.inf*np.ones(d)]
            m=l<best; best[m]=l[m]; arg[m]=np.arange(prev.size)[m]-d
            m=r<best; best[m]=r[m]; arg[m]=np.arange(prev.size)[m]+d
        acc[y]+=best; back[y]=arg
    x=np.zeros(h,int); x[-1]=int(acc[-1].argmin())
    for y in range(h-1,0,-1): x[y-1]=back[y,x[y]]
    return x+lo
def split(cost, n, axis):
    """Return n-1 seams splitting along axis (1: vertical seams, 0: horizontal)."""
    c=cost if axis==1 else cost.T
    w=c.shape[1]; return [seam(c, round(w*k/n)) for k in range(1,n)]
os.makedirs(OUT,exist_ok=True)
for fn,(rows,cols,names) in SHEETS.items():
    im=cv2.imread(os.path.join(SRC,fn)); H,W=im.shape[:2]
    ink=(255-im.min(axis=2)).astype(np.float32)
    cost=cv2.GaussianBlur(ink,(0,0),1.5)**2
    yy,xx=np.mgrid[0:H,0:W]
    hs=split(cost,rows,0)          # each: y as function of x
    rowb=[np.zeros(W,int)]+hs+[np.full(W,H)]
    dbg=im.copy(); k=0
    for r in range(rows):
        inrow=(yy>=rowb[r][None,:])&(yy<rowb[r+1][None,:])
        rc=cost.copy(); rc[~inrow]=0
        y0=int(rowb[r].min()); y1=int(rowb[r+1].max())
        vs=[s for s in split(rc[y0:y1],cols,1)]
        colb=[np.zeros(y1-y0,int)]+vs+[np.full(y1-y0,W)]
        for c in range(cols):
            reg=np.zeros((H,W),bool)
            ys=np.arange(y0,y1)
            reg[y0:y1]=(xx[y0:y1]>=colb[c][:,None])&(xx[y0:y1]<colb[c+1][:,None])
            reg&=inrow
            mask=((im.min(axis=2)<248)&reg).astype(np.uint8)
            mask=cv2.morphologyEx(mask,cv2.MORPH_OPEN,np.ones((5,5),np.uint8))
            cs,_=cv2.findContours(mask,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE)
            cnt=max(cs,key=cv2.contourArea)
            (cx,cy),(rw,rh),ang=cv2.minAreaRect(cnt)
            rw,rh=sorted((rw,rh)); ang=((ang+45)%90)-45
            # rotate whole sheet around card center, then crop upright rect
            M=cv2.getRotationMatrix2D((cx,cy),ang,1.0)
            rot=cv2.warpAffine(im,M,(W,H),flags=cv2.INTER_LANCZOS4,borderValue=(255,255,255))
            x0=int(round(cx-rw/2)); y0c=int(round(cy-rh/2))
            card=rot[max(0,y0c):y0c+int(round(rh)), max(0,x0):x0+int(round(rw))]
            name=names[k]; k+=1
            cv2.imwrite(os.path.join(OUT,name+'.jpg'),card,[cv2.IMWRITE_JPEG_QUALITY,100,cv2.IMWRITE_JPEG_SAMPLING_FACTOR,cv2.IMWRITE_JPEG_SAMPLING_FACTOR_444])
            print(fn,name,card.shape[1],'x',card.shape[0],'angle %.2f'%ang)
            box=cv2.boxPoints(((cx,cy),(rw,rh),ang)).astype(int)
            cv2.polylines(dbg,[box],True,(0,0,255),2)
            cv2.putText(dbg,name,(int(cx)-60,int(cy)),cv2.FONT_HERSHEY_SIMPLEX,0.6,(0,0,255),2)
    if DBG: cv2.imwrite(os.path.join(DBG,'dbg_'+fn),dbg)
