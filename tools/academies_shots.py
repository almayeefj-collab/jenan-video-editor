# يبني قائمة اللقطات لكل أكاديمية من كل مقاطع الدرايف: مقطع قصير = نص بار، متوسط = بار، طويل = لقطتين من جزئين مختلفين
import sys,json
durs={n:float(t) for n,t in (l.split() for l in open(sys.argv[1]))}
BAR=69
OVR={'techno_C7031':[(0.6,BAR)], 'techno_C7032':[(0.0,35)], 'lead_C7235':[(1.4,BAR)]}
out={}
for a in ['techno','dev','lead']:
    names=sorted([n for n in durs if n.startswith(a+'_')], key=lambda n:int(n.split('_C')[1]))
    shots=[];half=0
    for n in names:
        L=durs[n]
        if n in OVR: segs=OVR[n]
        elif L<1.2: continue
        elif L<2.4: segs=[(0.1,35)]
        elif L<6: segs=[(max(0.2,(L-2.3)/2),BAR)]
        else: segs=[(0.25*L,BAR),(min(0.65*L,L-2.4),BAR)]
        for st,d in segs:
            if d==35: d=35 if half%2==0 else 34; half+=1
            shots.append([n+'.mp4',round(st,2),d])
    tot=sum(s[2] for s in shots); r=(-tot)%BAR
    shots[-1][2]+=r
    shots[-1][1]=round(min(shots[-1][1], durs[shots[-1][0][:-4]]-shots[-1][2]/30-0.05),2)
    out[a]=shots
    print(a,len(shots),(tot+r)/BAR,'bars',(tot+r)/30,'s',file=sys.stderr)
json.dump(out,open(sys.argv[2],'w'))
