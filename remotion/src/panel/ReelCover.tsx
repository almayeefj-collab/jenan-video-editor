// غلاف ريلز (1080×1920) لكل جزء: صورة الضيفة بلقطة هادئة + طبقة لون شفافة + العنوان.
// كل غلاف له لون وتصميم مختلف عشان ما تطلع الأغلفة كلها نفس الشي في الشبكة.
// المحتوى المهم بين y=300 و y=1620 لأن شبكة البروفايل تعرض الوسط 3:4 بس.
import {AbsoluteFill, Img, random, staticFile} from 'remotion';
import {fontFamily} from '../reel/font';
import {getSession, SessionKey} from './sessions';

export const COVER_W = 1080;
export const COVER_H = 1920;

const GOLD = '#D4AF6A';
const CREAM = '#F5EBD7';
const shadow = '0 4px 28px rgba(0,0,0,0.6)';

export type CoverLayout = 'band' | 'top' | 'circle' | 'arch';
export type CoverProps = {
  session?: SessionKey;
  who: string;          // مفتاح الضيف في sessions.ts
  photo: string;        // صورة مربعة داخل public/
  accent: string;       // لون الطبقة الشفافة (hex)
  layout: CoverLayout;
  part?: string;        // مثل «الجزء ١ من ٣»
};

// خلفية: نفس الصورة مكبّرة ومغبّشة + طبقة لون شفافة + ذرات ذهبية
const Backdrop: React.FC<{photo: string; accent: string; seed: string}> = ({photo, accent, seed}) => (
  <>
    <AbsoluteFill style={{transform: 'scale(1.25)'}}>
      <Img src={staticFile(photo)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(28px) brightness(0.55) saturate(1.1)'}} />
    </AbsoluteFill>
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${accent}cc 0%, ${accent}88 45%, ${accent}e6 100%)`}} />
    <AbsoluteFill>
      {Array.from({length: 30}).map((_, i) => {
        const r = 3 + random(`${seed}r${i}`) * 10;
        return (
          <div key={i} style={{position: 'absolute', left: random(`${seed}x${i}`) * COVER_W, top: random(`${seed}y${i}`) * COVER_H, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(circle, ${GOLD}aa 0%, transparent 70%)`, opacity: 0.2 + 0.4 * random(`${seed}o${i}`)}} />
        );
      })}
    </AbsoluteFill>
  </>
);

const Rule: React.FC<{width: number}> = ({width}) => (
  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, margin: '26px auto'}}>
    <div style={{height: 2, width: width / 2, background: `linear-gradient(to left, ${GOLD}, transparent)`}} />
    <div style={{width: 13, height: 13, transform: 'rotate(45deg)', border: `2px solid ${GOLD}`}} />
    <div style={{height: 2, width: width / 2, background: `linear-gradient(to right, ${GOLD}, transparent)`}} />
  </div>
);

const Titles: React.FC<{session?: SessionKey; who: string; part?: string; align?: 'center'}> = ({session, who, part}) => {
  const ss = getSession(session);
  const p = ss.people[who];
  return (
    <div style={{textAlign: 'center', direction: 'rtl'}}>
      <div style={{display: 'inline-block', padding: '10px 36px', borderRadius: 40, border: `1.5px solid ${GOLD}`, background: 'rgba(0,0,0,0.18)', fontSize: 36, fontWeight: 700, color: GOLD}}>{ss.kicker}</div>
      <div style={{marginTop: 26, fontSize: 132, fontWeight: 800, color: '#fff', lineHeight: 1.1, textShadow: shadow}}>{ss.titleLines[0]}</div>
      <div style={{fontSize: 150, fontWeight: 900, color: GOLD, lineHeight: 1.15, textShadow: shadow}}>{ss.titleLines[1]}</div>
      {part ? <div style={{marginTop: 10, fontSize: 44, fontWeight: 700, color: CREAM}}>{part}</div> : null}
      <Rule width={460} />
      <div style={{fontSize: 56, fontWeight: 800, color: '#fff', textShadow: shadow}}>{p.name}</div>
      <div style={{marginTop: 6, fontSize: 30, fontWeight: 500, color: CREAM, opacity: 0.92, padding: '0 90px', lineHeight: 1.4}}>{p.role}</div>
    </div>
  );
};

const Frame: React.FC = () => <div style={{position: 'absolute', inset: 40, border: `1.5px solid ${GOLD}77`, borderRadius: 8}} />;

export const ReelCover: React.FC<CoverProps> = ({session, who, photo, accent, layout, part}) => {
  const seed = photo + layout;
  return (
    <AbsoluteFill style={{background: '#000', fontFamily}}>
      <Backdrop photo={photo} accent={accent} seed={seed} />

      {layout === 'band' ? (
        // الصورة بعرض الشاشة فوق، تذوب في اللون تحت، والعنوان تحتها
        <>
          <div style={{position: 'absolute', top: 240, left: 0, width: COVER_W, height: 900}}>
            <Img src={staticFile(photo)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 20%'}} />
            <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${accent}99 0%, transparent 18%, transparent 55%, ${accent} 100%)`}} />
          </div>
          <div style={{position: 'absolute', top: 960, left: 0, right: 0}}><Titles session={session} who={who} part={part} /></div>
        </>
      ) : null}

      {layout === 'top' ? (
        // العنوان فوق، والصورة تحت بزاوية مدوّرة وطبقة شفافة خفيفة
        <>
          <div style={{position: 'absolute', top: 290, left: 0, right: 0}}><Titles session={session} who={who} part={part} /></div>
          <div style={{position: 'absolute', top: 1060, left: 110, width: 860, height: 620, borderRadius: 36, overflow: 'hidden', border: `3px solid ${GOLD}`, boxShadow: '0 20px 60px rgba(0,0,0,0.45)'}}>
            <Img src={staticFile(photo)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 18%'}} />
            <div style={{position: 'absolute', inset: 0, background: `linear-gradient(0deg, ${accent}66 0%, transparent 40%)`}} />
          </div>
        </>
      ) : null}

      {layout === 'circle' ? (
        // الصورة داخل دائرة بحلقة ذهبية، والعنوان تحتها
        <>
          <div style={{position: 'absolute', top: 260, left: (COVER_W - 600) / 2, width: 600, height: 600, borderRadius: '50%', padding: 10, background: `linear-gradient(135deg, ${GOLD}, #8a6d3b, ${GOLD})`, boxShadow: '0 20px 70px rgba(0,0,0,0.5)'}}>
            <Img src={staticFile(photo)} style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 22%'}} />
          </div>
          <div style={{position: 'absolute', top: 900, left: 0, right: 0}}><Titles session={session} who={who} part={part} /></div>
        </>
      ) : null}

      {layout === 'arch' ? (
        // الصورة داخل قوس، ولوحة شفافة عليها العنوان تغطي أسفل الصورة
        <>
          <div style={{position: 'absolute', top: 240, left: 150, width: 780, height: 900, borderRadius: '390px 390px 24px 24px', overflow: 'hidden', border: `3px solid ${GOLD}`, boxShadow: '0 20px 60px rgba(0,0,0,0.45)'}}>
            <Img src={staticFile(photo)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 10%'}} />
          </div>
          <div style={{position: 'absolute', top: 900, left: 70, right: 70, padding: '36px 0 40px', borderRadius: 28, background: `${accent}b8`, backdropFilter: 'blur(6px)', border: `1.5px solid ${GOLD}66`}}>
            <Titles session={session} who={who} part={part} />
          </div>
        </>
      ) : null}

      <Frame />
    </AbsoluteFill>
  );
};
