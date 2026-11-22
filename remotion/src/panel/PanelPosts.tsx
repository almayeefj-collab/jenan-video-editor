// بوستين انستغرام يحيطون بريلز الجلسة في الشبكة: يمين = عنوان الجلسة، يسار = رئيسة الجلسة والمحاورون
// 1080×1350 (4:5)؛ المحتوى المهم داخل العرض الأوسط 1012px لأن شبكة البروفايل تقص الأطراف (3:4).
// الصور من لقطات الفيديو في public/footage/panel/ (ما ترفع للمستودع)، والشعار اختياري.
import {AbsoluteFill, Img, random, staticFile} from 'remotion';
import {fontFamily, numberFamily} from '../reel/font';
import {getSession, SessionKey} from './sessions';

export const POST_W = 1080;
export const POST_H = 1350;

const NAVY = '#0D1A3A';
const GOLD = '#D4AF6A';
const CREAM = '#F5EBD7';
const INK = '#070B18';
const shadow = '0 4px 24px rgba(0,0,0,0.7)';
const EVENT = 'مؤتمر الكويت الدولي الأول للتدريب والتطوير';

type PostProps = {logo?: string; session?: SessionKey};

const Background: React.FC<{seed: string; bg: string}> = ({seed, bg}) => (
  <>
    <AbsoluteFill style={{transform: 'scale(1.15)'}}>
      <Img src={staticFile(bg)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(22px) brightness(0.34) saturate(1.1)'}} />
    </AbsoluteFill>
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${NAVY}e6 0%, ${NAVY}99 45%, ${INK}f0 100%)`}} />
    <AbsoluteFill>
      {Array.from({length: 26}).map((_, i) => {
        const r = 3 + random(`${seed}r${i}`) * 11;
        return (
          <div key={i} style={{position: 'absolute', left: random(`${seed}x${i}`) * POST_W, top: random(`${seed}y${i}`) * POST_H, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(circle, ${GOLD}aa 0%, transparent 70%)`, opacity: 0.25 + 0.4 * random(`${seed}o${i}`)}} />
        );
      })}
    </AbsoluteFill>
    {/* إطار ذهبي رفيع */}
    <div style={{position: 'absolute', inset: 44, border: `1.5px solid ${GOLD}66`, borderRadius: 6}} />
  </>
);

const Rule: React.FC<{width: number}> = ({width}) => (
  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, margin: '34px auto'}}>
    <div style={{height: 2, width: width / 2, background: `linear-gradient(to left, ${GOLD}, transparent)`}} />
    <div style={{width: 13, height: 13, transform: 'rotate(45deg)', border: `2px solid ${GOLD}`}} />
    <div style={{height: 2, width: width / 2, background: `linear-gradient(to right, ${GOLD}, transparent)`}} />
  </div>
);

const Logo: React.FC<{logo?: string; size: number}> = ({logo, size}) =>
  logo ? <Img src={staticFile(logo)} style={{height: size, width: size, objectFit: 'contain', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.6))'}} /> : null;

// تحت: الشعار إذا موجود (فيه اسم المؤتمر والسنة)، وإلا اسم المؤتمر نص
const Footer: React.FC<{logo?: string}> = ({logo}) =>
  logo ? (
    <div style={{position: 'absolute', bottom: 64, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <Logo logo={logo} size={150} />
    </div>
  ) : (
  <div style={{position: 'absolute', bottom: 74, left: 0, right: 0, textAlign: 'center'}}>
    <div style={{fontSize: 28, fontWeight: 600, color: CREAM, textShadow: shadow}}>{EVENT}</div>
    <div style={{fontFamily: numberFamily, fontSize: 26, color: GOLD, letterSpacing: 8, marginTop: 6}}>2026</div>
  </div>
);

// البوست اليمين: اسم الجلسة
export const PostTitle: React.FC<PostProps> = ({logo, session}) => {
  const ss = getSession(session);
  const [l1, l2] = ss.titleLines;
  const big = l1.length > 14 || l2.length > 20; // سطور أطول = خط أصغر عشان ما يطلع برا
  return (
  <AbsoluteFill style={{background: INK, direction: 'rtl', fontFamily}}>
    <Background seed="title" bg={ss.postBg} />
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 110px'}}>
      <Logo logo={logo} size={300} />
      <div style={{marginTop: logo ? 56 : 0, padding: '10px 40px', borderRadius: 40, border: `1.5px solid ${GOLD}`, fontSize: 38, fontWeight: 700, color: GOLD}}>{ss.kicker}</div>
      <div style={{marginTop: 40, fontSize: big ? 92 : 112, fontWeight: 800, color: '#fff', lineHeight: 1.18, textShadow: shadow, whiteSpace: 'nowrap'}}>{l1}</div>
      <div style={{fontSize: big ? 84 : 92, fontWeight: 800, color: GOLD, lineHeight: 1.25, textShadow: shadow, whiteSpace: 'nowrap'}}>{l2}</div>
      <Rule width={520} />
    </AbsoluteFill>
    {logo ? null : <Footer />}
  </AbsoluteFill>
  );
};

const Portrait: React.FC<{src: string; size: number; pos: string}> = ({src, size, pos}) => (
  <div style={{width: size, height: size, borderRadius: '50%', padding: 6, background: `linear-gradient(135deg, ${GOLD}, #8a6d3b, ${GOLD})`, boxShadow: '0 12px 40px rgba(0,0,0,0.55)'}}>
    <Img src={staticFile(src)} style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', objectPosition: pos}} />
  </div>
);

const Person: React.FC<{who: string; session?: SessionKey; size: number; nameSize: number; width: number}> = ({who, session, size, nameSize, width}) => {
  const ss = getSession(session);
  const p = ss.people[who];
  return (
    <div style={{width, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}>
      <Portrait src={`${ss.dir}/face-${who}.jpg`} size={size} pos={p.pos} />
      <div style={{marginTop: 22, fontSize: nameSize, fontWeight: 800, color: '#fff', textShadow: shadow, whiteSpace: 'nowrap'}}>{p.name}</div>
      <div style={{marginTop: 4, fontSize: nameSize * 0.56, fontWeight: 500, color: GOLD, lineHeight: 1.35, maxWidth: width, whiteSpace: 'pre-line'}}>{p.postRole}</div>
    </div>
  );
};

const Label: React.FC<{text: string}> = ({text}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 18, fontSize: 32, fontWeight: 700, color: GOLD}}>
    <div style={{width: 60, height: 1.5, background: GOLD}} />
    {text}
    <div style={{width: 60, height: 1.5, background: GOLD}} />
  </div>
);

// البوست اليسار: رئيسة الجلسة فوق، والمحاورون تحت
export const PostPeople: React.FC<PostProps> = ({logo, session}) => {
  const ss = getSession(session);
  const three = ss.guests.length > 2;
  return (
  <AbsoluteFill style={{background: INK, direction: 'rtl', fontFamily}}>
    <Background seed="people" bg={ss.postBg} />
    <AbsoluteFill style={{alignItems: 'center', paddingTop: logo ? 78 : 100}}>
      <div style={{fontSize: 36, fontWeight: 700, color: CREAM}}>{ss.kicker}</div>
      <div style={{marginTop: 28}}><Label text="رئيسة الجلسة" /></div>
      <div style={{marginTop: 22}}>
        <Person who={ss.host} session={session} size={three ? 230 : 250} nameSize={46} width={400} />
      </div>
      <div style={{marginTop: 36}}><Label text="المحاورون" /></div>
      <div style={{marginTop: 22, display: 'flex', gap: 10, justifyContent: 'center'}}>
        {ss.guests.map((g) => (
          <Person key={g} who={g} session={session} size={three ? 168 : 196} nameSize={three ? 32 : 38} width={three ? 310 : 400} />
        ))}
      </div>
    </AbsoluteFill>
    <Footer logo={logo} />
  </AbsoluteFill>
  );
};
