// طقم فاتح لكل جزء: غلاف ريلز (1080×1920) + بوست يمين (اقتباس الهوك) + بوست يسار (صورة الضيفة واسمها)
// ألوان فاتحة (عاجي/وردي/زيتي فاتح/لافندر) بلمسات ذهبية؛ كل جزء له لون عشان ما تتشابه.
import {AbsoluteFill, Img, random, staticFile} from 'remotion';
import {fontFamily} from '../reel/font';
import {getSession, SessionKey} from './sessions';

export type Palette = {bg: string; bg2: string; ink: string; accent: string};
export type LightProps = {
  session?: SessionKey;
  who: string;
  photo: string;
  palette: Palette;
  part?: string;       // «الجزء ١ من ٣»
  quote?: string;      // للبوست اليمين
  highlight?: string;  // كلمة ذهبية داخل الاقتباس
  logo?: string;       // شعار تحت (اختياري)
};

const GOLD = '#B8924A';

const Paper: React.FC<{p: Palette; seed: string; w: number; h: number}> = ({p, seed, w, h}) => (
  <>
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 30% 20%, ${p.bg} 0%, ${p.bg2} 100%)`}} />
    {/* دوائر ناعمة بلون الجزء */}
    <div style={{position: 'absolute', width: w * 0.9, height: w * 0.9, borderRadius: '50%', right: -w * 0.35, top: -w * 0.3, background: `${p.accent}14`}} />
    <div style={{position: 'absolute', width: w * 0.7, height: w * 0.7, borderRadius: '50%', left: -w * 0.3, bottom: -w * 0.2, background: `${p.accent}10`}} />
    <AbsoluteFill>
      {Array.from({length: 18}).map((_, i) => {
        const r = 2 + random(`${seed}r${i}`) * 6;
        return <div key={i} style={{position: 'absolute', left: random(`${seed}x${i}`) * w, top: random(`${seed}y${i}`) * h, width: r * 2, height: r * 2, borderRadius: '50%', background: GOLD, opacity: 0.18 + 0.25 * random(`${seed}o${i}`)}} />;
      })}
    </AbsoluteFill>
    <div style={{position: 'absolute', inset: 36, border: `2px solid ${GOLD}66`, borderRadius: 10}} />
  </>
);

const Rule: React.FC<{width: number}> = ({width}) => (
  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, margin: '22px auto'}}>
    <div style={{height: 2, width: width / 2, background: `linear-gradient(to left, ${GOLD}, transparent)`}} />
    <div style={{width: 12, height: 12, transform: 'rotate(45deg)', border: `2px solid ${GOLD}`}} />
    <div style={{height: 2, width: width / 2, background: `linear-gradient(to right, ${GOLD}, transparent)`}} />
  </div>
);

const Pill: React.FC<{p: Palette; text: string}> = ({p, text}) => (
  <div style={{display: 'inline-block', padding: '10px 34px', borderRadius: 40, border: `1.5px solid ${GOLD}`, background: '#ffffff99', fontSize: 34, fontWeight: 700, color: p.accent}}>{text}</div>
);

const Title: React.FC<{p: Palette; session?: SessionKey; part?: string; big?: number}> = ({p, session, part, big = 140}) => {
  const ss = getSession(session);
  return (
    <div style={{textAlign: 'center'}}>
      <div style={{fontSize: big * 0.86, fontWeight: 800, color: p.ink, lineHeight: 1.1}}>{ss.titleLines[0]}</div>
      <div style={{fontSize: big, fontWeight: 900, color: p.accent, lineHeight: 1.15}}>{ss.titleLines[1]}</div>
      {part ? <div style={{marginTop: 8, fontSize: 42, fontWeight: 700, color: GOLD}}>{part}</div> : null}
    </div>
  );
};

const Name: React.FC<{p: Palette; session?: SessionKey; who: string}> = ({p, session, who}) => {
  const person = getSession(session).people[who];
  return (
    <div style={{textAlign: 'center'}}>
      <div style={{fontSize: 52, fontWeight: 800, color: p.ink}}>{person.name}</div>
      <div style={{marginTop: 6, fontSize: 28, fontWeight: 500, color: `${p.ink}bb`, padding: '0 80px', lineHeight: 1.4}}>{person.role}</div>
    </div>
  );
};

const Photo: React.FC<{src: string; w: number; h: number; radius: string; pos?: string}> = ({src, w, h, radius, pos = '50% 18%'}) => (
  <div style={{width: w, height: h, borderRadius: radius, padding: 8, background: `linear-gradient(135deg, ${GOLD}, #E9D6A8, ${GOLD})`, boxShadow: '0 24px 60px rgba(60,40,20,0.25)'}}>
    <Img src={staticFile(src)} style={{width: '100%', height: '100%', borderRadius: radius, objectFit: 'cover', objectPosition: pos}} />
  </div>
);

// غلاف الريلز: صورة بإطار قوس فوق، والعنوان تحت — المحتوى المهم بين 300 و 1620
export const LightCover: React.FC<LightProps> = ({session, who, photo, palette: p, part}) => {
  const ss = getSession(session);
  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl'}}>
      <Paper p={p} seed={photo + 'c'} w={1080} h={1920} />
      <div style={{position: 'absolute', top: 260, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Photo src={photo} w={720} h={800} radius="360px 360px 28px 28px" />
      </div>
      <div style={{position: 'absolute', top: 1090, left: 0, right: 0, textAlign: 'center'}}>
        <Pill p={p} text={ss.kicker} />
        <div style={{marginTop: 18}}><Title p={p} session={session} part={part} big={130} /></div>
        <Rule width={420} />
        <Name p={p} session={session} who={who} />
      </div>
    </AbsoluteFill>
  );
};

// البوست اليمين: اقتباس الهوك كبير
export const LightPostQuote: React.FC<LightProps> = ({session, palette: p, part, quote = '', highlight, who}) => {
  const ss = getSession(session);
  const i = highlight ? quote.lastIndexOf(highlight) : -1;
  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl'}}>
      <Paper p={p} seed={quote + 'q'} w={1080} h={1350} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 120px'}}>
        <Pill p={p} text={ss.kicker} />
        <div style={{marginTop: 30}}><Title p={p} session={session} part={part} big={110} /></div>
        <Rule width={380} />
        <div style={{fontFamily: 'Georgia, serif', fontSize: 150, lineHeight: 0.5, color: GOLD, height: 60, marginTop: 10}}>&#8221;</div>
        <div style={{fontSize: 52, fontWeight: 800, color: p.ink, lineHeight: 1.5}}>
          {i >= 0 ? (
            <>
              {quote.slice(0, i)}
              <span style={{color: p.accent, fontSize: 60, fontWeight: 900}}>{highlight}</span>
              {quote.slice(i + (highlight ?? '').length)}
            </>
          ) : quote}
        </div>
        <div style={{marginTop: 22, fontSize: 32, fontWeight: 700, color: GOLD}}>— {ss.people[who].name}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// البوست اليسار: صورة الضيفة بدائرة، واسمها ومنصبها، والشعار تحت
export const LightPostProfile: React.FC<LightProps> = ({session, who, photo, palette: p, part, logo}) => {
  const ss = getSession(session);
  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl'}}>
      <Paper p={p} seed={photo + 'p'} w={1080} h={1350} />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 110, textAlign: 'center'}}>
        <Pill p={p} text={ss.kicker} />
        <div style={{marginTop: 40}}><Photo src={photo} w={500} h={500} radius="50%" pos="50% 22%" /></div>
        <div style={{marginTop: 40}}><Name p={p} session={session} who={who} /></div>
        <Rule width={360} />
        <div style={{fontSize: 40, fontWeight: 800, color: p.accent}}>{ss.title}{part ? ` — ${part}` : ''}</div>
        <div style={{marginTop: 6, fontSize: 30, fontWeight: 500, color: `${p.ink}aa`}}>تقديم: {ss.people[ss.host].name}</div>
      </AbsoluteFill>
      {logo ? (
        <div style={{position: 'absolute', bottom: 70, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <Img src={staticFile(logo)} style={{width: 120, height: 120, objectFit: 'contain', filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.25))'}} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
