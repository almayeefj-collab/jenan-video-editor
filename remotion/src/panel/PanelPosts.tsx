// بوستين انستغرام يحيطون بريلز الجلسة في الشبكة: يمين = عنوان الجلسة، يسار = رئيسة الجلسة والمحاورون
// 1080×1350 (4:5)؛ المحتوى المهم داخل العرض الأوسط 1012px لأن شبكة البروفايل تقص الأطراف (3:4).
// الصور من لقطات الفيديو في public/footage/panel/ (ما ترفع للمستودع)، والشعار اختياري.
import {AbsoluteFill, Img, random, staticFile} from 'remotion';
import {fontFamily, numberFamily} from '../reel/font';
import {PEOPLE, SESSION, Who} from './PanelSession';

export const POST_W = 1080;
export const POST_H = 1350;

const NAVY = '#0D1A3A';
const GOLD = '#D4AF6A';
const CREAM = '#F5EBD7';
const INK = '#070B18';
const shadow = '0 4px 24px rgba(0,0,0,0.7)';
const EVENT = 'مؤتمر الكويت الدولي الأول للتدريب والتطوير';

type PostProps = {logo?: string};

const Background: React.FC<{seed: string}> = ({seed}) => (
  <>
    <AbsoluteFill style={{transform: 'scale(1.15)'}}>
      <Img src={staticFile('footage/panel/bg05.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(22px) brightness(0.34) saturate(1.1)'}} />
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
  logo ? <Img src={staticFile(logo)} style={{height: size, width: 'auto', maxWidth: 520, objectFit: 'contain', filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.5))'}} /> : null;

const Footer: React.FC = () => (
  <div style={{position: 'absolute', bottom: 74, left: 0, right: 0, textAlign: 'center'}}>
    <div style={{fontSize: 28, fontWeight: 600, color: CREAM, textShadow: shadow}}>{EVENT}</div>
    <div style={{fontFamily: numberFamily, fontSize: 26, color: GOLD, letterSpacing: 8, marginTop: 6}}>2026</div>
  </div>
);

// البوست اليمين: اسم الجلسة
export const PostTitle: React.FC<PostProps> = ({logo}) => (
  <AbsoluteFill style={{background: INK, direction: 'rtl', fontFamily}}>
    <Background seed="title" />
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 110px'}}>
      <Logo logo={logo} size={190} />
      <div style={{marginTop: logo ? 56 : 0, padding: '10px 40px', borderRadius: 40, border: `1.5px solid ${GOLD}`, fontSize: 38, fontWeight: 700, color: GOLD}}>{SESSION.kicker}</div>
      <div style={{marginTop: 40, fontSize: 112, fontWeight: 800, color: '#fff', lineHeight: 1.18, textShadow: shadow}}>الصحة النفسية</div>
      <div style={{fontSize: 92, fontWeight: 800, color: GOLD, lineHeight: 1.25, textShadow: shadow}}>بين الانهيار والتكيف</div>
      <Rule width={520} />
    </AbsoluteFill>
    <Footer />
  </AbsoluteFill>
);

const Portrait: React.FC<{who: Who; size: number; pos: string}> = ({who, size, pos}) => (
  <div style={{width: size, height: size, borderRadius: '50%', padding: 6, background: `linear-gradient(135deg, ${GOLD}, #8a6d3b, ${GOLD})`, boxShadow: '0 12px 40px rgba(0,0,0,0.55)'}}>
    <Img src={staticFile(`footage/panel/face-${who}.jpg`)} style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', objectPosition: pos}} />
  </div>
);

const Person: React.FC<{who: Who; size: number; pos: string; role: string; nameSize: number}> = ({who, size, pos, role, nameSize}) => (
  <div style={{width: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}>
    <Portrait who={who} size={size} pos={pos} />
    <div style={{marginTop: 22, fontSize: nameSize, fontWeight: 800, color: '#fff', textShadow: shadow, whiteSpace: 'nowrap'}}>{PEOPLE[who].name}</div>
    <div style={{marginTop: 4, fontSize: nameSize * 0.56, fontWeight: 500, color: GOLD, lineHeight: 1.35, maxWidth: 420, whiteSpace: 'pre-line'}}>{role}</div>
  </div>
);

const Label: React.FC<{text: string}> = ({text}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 18, fontSize: 32, fontWeight: 700, color: GOLD}}>
    <div style={{width: 60, height: 1.5, background: GOLD}} />
    {text}
    <div style={{width: 60, height: 1.5, background: GOLD}} />
  </div>
);

// البوست اليسار: رئيسة الجلسة فوق، والمحاورون تحت
export const PostPeople: React.FC<PostProps> = ({logo}) => (
  <AbsoluteFill style={{background: INK, direction: 'rtl', fontFamily}}>
    <Background seed="people" />
    <AbsoluteFill style={{alignItems: 'center', paddingTop: logo ? 86 : 100}}>
      {logo ? <Logo logo={logo} size={110} /> : <div style={{fontSize: 36, fontWeight: 700, color: CREAM}}>{SESSION.kicker}</div>}
      <div style={{marginTop: 28}}><Label text="رئيسة الجلسة" /></div>
      <div style={{marginTop: 22}}>
        <Person who="host" size={250} pos="35% 30%" role="مهتمة في صحة الدماغ" nameSize={46} />
      </div>
      <div style={{marginTop: 36}}><Label text="المحاورون" /></div>
      <div style={{marginTop: 22, display: 'flex', gap: 10, justifyContent: 'center'}}>
        <Person who="hakami" size={196} pos="50% 25%" role={'رئيس جمعية علم النفس\nالشرق الأوسط'} nameSize={38} />
        <Person who="jaza" size={196} pos="50% 25%" role={'رئيس جمعية علم النفس\nالكويتية'} nameSize={38} />
      </div>
    </AbsoluteFill>
    <Footer />
  </AbsoluteFill>
);
