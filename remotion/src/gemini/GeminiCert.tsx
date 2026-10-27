// فيديو تعليمي عمودي: خطوات استخراج شهادة «معلم معتمد من Google Gemini» (Gemini Certified Educator)
// الخطوات مأخوذة من دليل الصور (8 شرائح) وكل واجهة معاد رسمها كموشن جرافيك — إعداد أ. جنان المعيبف
import {AbsoluteFill, Audio, Easing, interpolate, random, Sequence, spring, staticFile, useCurrentFrame} from 'remotion';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import {fade} from '@remotion/transitions/fade';
import {fontFamily} from '../reel/font';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
const T = 15; // مدة الانتقال بين المشاهد

export const AUTHOR = 'أ. جنان المعيبف';
export const AUTHOR_ROLE = 'عضو في فريق الابتكار التابع لوزارة التربية';
const URL = 'https://educertifications.google';
const MOE_EMAIL = 'T000000000000@moe.edu.kw';

const BLUE = '#1a73e8';
const INK = '#1b2333';
const MUTED = '#5f6368';
const LINE = '#dadce0';
const G = {blue: '#4285F4', red: '#EA4335', yellow: '#FBBC05', green: '#34A853', purple: '#9B72CB'};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const pr = (f: number, a: number, d = 14) => interpolate(f, [a, a + d], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
const pop = (f: number, a: number) => spring({frame: f - a, fps: FPS, config: {damping: 13, mass: 0.6}});
const reveal = (f: number, a: number, dist = 40) => {
  const k = pr(f, a, 16);
  return {opacity: k, transform: `translateY(${(1 - k) * dist}px)`, filter: `blur(${(1 - k) * 8}px)`};
};
// نص ينكتب حرف حرف
const typed = (s: string, f: number, at: number, per = 2) => s.slice(0, Math.max(0, Math.floor((f - at) / per)));
const typeEnd = (s: string, at: number, per = 2) => at + s.length * per;

// ===== الصوت =====
const Sfx: React.FC<{at: number; src: string; v?: number}> = ({at, src, v = 0.5}) => (
  <Sequence from={Math.max(0, at)} durationInFrames={FPS * 3} layout="none">
    <Audio src={staticFile(`sfx/${src}.wav`)} volume={v} />
  </Sequence>
);
const Typing: React.FC<{at: number; s: string; per?: number}> = ({at, s, per = 2}) => (
  <>
    {Array.from({length: Math.ceil(s.length / 2)}, (_, i) => (
      <Sfx key={i} at={at + i * per * 2} src={`key${i % 4}`} v={0.22} />
    ))}
  </>
);

// ===== عناصر بصرية مشتركة =====
const Sparkle: React.FC<{size: number; id: string; rot?: number; style?: React.CSSProperties}> = ({size, id, rot = 0, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{transform: `rotate(${rot}deg)`, overflow: 'visible', ...style}}>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={G.blue} />
        <stop offset=".38" stopColor={G.purple} />
        <stop offset=".58" stopColor={G.red} />
        <stop offset=".78" stopColor={G.yellow} />
        <stop offset="1" stopColor={G.green} />
      </linearGradient>
    </defs>
    <path d="M50 0 C53 28 72 47 100 50 C72 53 53 72 50 100 C47 72 28 53 0 50 C28 47 47 28 50 0Z" fill={`url(#${id})`} />
  </svg>
);

const Star: React.FC<{x: number; y: number; s: number; c: string; ph: number}> = ({x, y, s, c, ph}) => {
  const f = useCurrentFrame();
  const k = 0.75 + 0.25 * Math.sin(f / 18 + ph);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{position: 'absolute', left: x, top: y + Math.sin(f / 30 + ph) * 8, transform: `scale(${k})`, opacity: 0.8}}>
      <path d="M50 0 C53 28 72 47 100 50 C72 53 53 72 50 100 C47 72 28 53 0 50 C28 47 47 28 50 0Z" fill={c} />
    </svg>
  );
};

const Arc: React.FC<{size: number; x: number; y: number; rot: number}> = ({size, x, y, rot}) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: '50%',
        background: `conic-gradient(from ${rot + f * 0.15}deg, ${G.blue}, ${G.purple}, ${G.red}, ${G.yellow}, ${G.green}, ${G.blue})`,
        WebkitMaskImage: 'radial-gradient(circle, transparent 60%, #000 60.5%, #000 70%, transparent 70.5%)',
        maskImage: 'radial-gradient(circle, transparent 60%, #000 60.5%, #000 70%, transparent 70.5%)',
        opacity: 0.7, filter: 'blur(1px)',
      }}
    />
  );
};

const Bg: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg, #f9fbff 0%, #eef3fc 100%)'}}>
    <Arc size={760} x={640} y={-430} rot={0} />
    <Arc size={900} x={-620} y={1360} rot={140} />
    <Star x={70} y={330} s={54} c="#8ab4f8" ph={0} />
    <Star x={960} y={760} s={40} c="#c58af9" ph={2} />
    <Star x={110} y={1260} s={36} c="#8ab4f8" ph={4} />
    <Star x={930} y={1500} s={48} c="#8ab4f8" ph={1} />
  </AbsoluteFill>
);

const Panel: React.FC<{style?: React.CSSProperties; children: React.ReactNode}> = ({style, children}) => (
  <div style={{background: '#fff', borderRadius: 34, boxShadow: '0 24px 60px rgba(30,60,120,.14), 0 2px 6px rgba(30,60,120,.06)', border: '1px solid #e4e9f3', ...style}}>
    {children}
  </div>
);

const Header: React.FC<{n: number; title: string}> = ({n, title}) => {
  const f = useCurrentFrame();
  const k = pop(f, 4);
  return (
    <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 28, direction: 'rtl'}}>
      <div
        style={{
          width: 118, height: 118, borderRadius: '50%', background: BLUE, color: '#fff', fontSize: 70, fontWeight: 900,
          display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${k})`, boxShadow: '0 12px 30px rgba(26,115,232,.35)',
        }}
      >
        <span style={{marginTop: -6}}>{n}</span>
      </div>
      <div style={{fontSize: 82, fontWeight: 900, color: INK, ...reveal(f, 8, 30)}}>{title}</div>
    </div>
  );
};

// السهم + دائرة الضغطة: يتحرك من بعيد ويضغط على العنصر اللي داخله
const CursorSvg: React.FC = () => (
  <svg width={64} height={64} viewBox="0 0 24 24" style={{filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.3))'}}>
    <path d="M4 2 L4 19 L8.5 15 L11.5 22 L14.5 20.7 L11.6 14 L18 14 Z" fill="#fff" stroke="#111" strokeWidth={1.3} strokeLinejoin="round" />
  </svg>
);
const Click: React.FC<{
  at: number; from?: [number, number]; children: React.ReactNode; style?: React.CSSProperties; ring?: boolean; pos?: [string, string];
  lead?: number; until?: number;
}> = ({at, from = [260, 320], children, style, ring, pos = ['62%', '55%'], lead = 34, until = at + 34}) => {
  const f = useCurrentFrame();
  const move = interpolate(f, [at - lead, at - 4], [0, 1], {...clamp, easing: ease});
  const vis = interpolate(f, [at - lead - 4, at - lead + 2, until - 8, until], [0, 1, 1, 0], clamp);
  const press = interpolate(f, [at - 3, at + 1, at + 8], [1, 0.93, 1], clamp);
  const rip = interpolate(f, [at, at + 20], [0, 1], clamp);
  const ringK = pr(f, at + 2, 10);
  return (
    <div style={{position: 'relative', ...style}}>
      <div style={{transform: `scale(${press})`}}>{children}</div>
      {ring && (
        <div style={{position: 'absolute', inset: -12, border: `4px solid ${G.red}`, borderRadius: 26, opacity: ringK, transform: `scale(${1.08 - ringK * 0.08})`}} />
      )}
      {f >= at && rip < 1 && (
        <div
          style={{
            position: 'absolute', left: pos[0], top: pos[1], width: 120, height: 120, marginLeft: -60, marginTop: -60, borderRadius: '50%',
            border: `5px solid ${BLUE}`, opacity: 1 - rip, transform: `scale(${0.2 + rip})`,
          }}
        />
      )}
      <div
        style={{
          position: 'absolute', left: pos[0], top: pos[1], opacity: vis, zIndex: 50,
          transform: `translate(${(1 - move) * from[0]}px, ${(1 - move) * from[1]}px) scale(${f >= at - 2 && f < at + 6 ? 0.86 : 1})`,
        }}
      >
        <CursorSvg />
      </div>
      <Sfx at={at} src="pop" v={0.55} />
    </div>
  );
};

const Button: React.FC<{label: string; w?: number | string; h?: number; fs?: number; outline?: boolean}> = ({label, w, h = 78, fs = 30, outline}) => (
  <div
    style={{
      width: w, height: h, borderRadius: h / 2, padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: outline ? '#fff' : BLUE, color: outline ? BLUE : '#fff', border: outline ? `2px solid ${BLUE}` : 'none',
      fontSize: fs, fontWeight: 700, boxShadow: outline ? 'none' : '0 8px 20px rgba(26,115,232,.3)', whiteSpace: 'nowrap',
    }}
  >
    {label}
  </div>
);

// شريط الشرح السفلي: يتبدل مع كل خطوة فرعية
type Beat = {at: number; n?: number; ar: string; en?: string; enFirst?: boolean; sub?: string; tip?: boolean; color?: string};
const Captions: React.FC<{beats: Beat[]; top?: number}> = ({beats, top = 1430}) => {
  const f = useCurrentFrame();
  return (
    <>
      {beats.map((b, i) => {
        const next = beats[i + 1]?.at ?? Infinity;
        if (f < b.at || f > next + 12) return null;
        const kin = pr(f, b.at, 14);
        const kout = Number.isFinite(next) ? interpolate(f, [next, next + 10], [0, 1], clamp) : 0;
        const en = b.en ? (
          <div dir="ltr" style={{fontSize: 46, fontWeight: 800, color: BLUE, lineHeight: 1.25}}>
            {b.en}
          </div>
        ) : null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', top, left: 70, right: 70, direction: 'rtl',
              opacity: kin * (1 - kout), transform: `translateY(${(1 - kin) * 50 - kout * 30}px) scale(${0.96 + kin * 0.04})`,
            }}
          >
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 28, padding: '30px 40px', borderRadius: 34,
                background: b.tip ? '#fff6dc' : 'rgba(255,255,255,.96)', border: `2px solid ${b.tip ? '#f7d774' : '#dbe6fb'}`,
                boxShadow: '0 16px 40px rgba(30,60,120,.12)',
              }}
            >
              {b.tip ? (
                <div style={{fontSize: 64}}>💡</div>
              ) : b.n ? (
                <div
                  style={{
                    flex: '0 0 auto', width: 84, height: 84, borderRadius: '50%', background: b.color ?? BLUE, color: '#fff',
                    fontSize: 48, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <span style={{marginTop: -4}}>{b.n}</span>
                </div>
              ) : null}
              <div style={{flex: 1, textAlign: 'right'}}>
                {b.enFirst && en}
                <div style={{fontSize: 42, fontWeight: 800, color: INK, lineHeight: 1.45}}>{b.ar}</div>
                {!b.enFirst && en}
                {b.sub && <div style={{fontSize: 32, fontWeight: 600, color: MUTED, marginTop: 6}}>{b.sub}</div>}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

// ===== نوافذ الموقع =====
const Lock: React.FC = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth={2.4}>
    <rect x="5" y="11" width="14" height="10" rx="2" fill={MUTED} />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);
const Browser: React.FC<{url: string; w: number; children: React.ReactNode; style?: React.CSSProperties}> = ({url, w, children, style}) => (
  <Panel style={{width: w, ...style}}>
    <div style={{height: 76, background: '#f1f4f9', borderRadius: '34px 34px 0 0', display: 'flex', alignItems: 'center', gap: 12, padding: '0 26px', borderBottom: '1px solid #e4e9f3'}}>
      {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
        <div key={c} style={{width: 18, height: 18, borderRadius: 9, background: c}} />
      ))}
      <div dir="ltr" style={{flex: 1, marginLeft: 18, height: 48, borderRadius: 24, background: '#fff', display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', fontSize: 24, color: '#3c4043'}}>
        <Lock />
        {url}
      </div>
    </div>
    {children}
  </Panel>
);

const EduLogo: React.FC<{fs?: number}> = ({fs = 32}) => (
  <div dir="ltr" style={{fontSize: fs, fontWeight: 600, color: MUTED, whiteSpace: 'nowrap'}}>
    <span style={{color: G.blue}}>G</span>
    <span style={{color: G.red}}>o</span>
    <span style={{color: G.yellow}}>o</span>
    <span style={{color: G.blue}}>g</span>
    <span style={{color: G.green}}>l</span>
    <span style={{color: G.red}}>e</span> for Education
  </div>
);

const GeminiImage: React.FC<{h: number; id: string; pill?: string; fs?: number; radius?: number}> = ({h, id, pill = 'Available', fs = 84, radius = 22}) => (
  <div
    style={{
      position: 'relative', height: h, borderRadius: radius, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
      background: 'radial-gradient(80% 90% at 30% 20%, #3b4f8f 0%, #1d2545 55%, #0e1226 100%)',
    }}
  >
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(50% 60% at 80% 90%, rgba(155,114,203,.45), transparent 70%)'}} />
    <Sparkle size={fs * 0.95} id={id} />
    <div dir="ltr" style={{fontSize: fs, fontWeight: 700, color: '#fff', position: 'relative'}}>Gemini</div>
    <div style={{position: 'absolute', top: 18, left: 18, background: '#d4f0dc', color: '#137333', fontSize: 24, fontWeight: 700, padding: '6px 20px', borderRadius: 20}}>{pill}</div>
  </div>
);

const GeminiBody: React.FC<{fs?: number; desc?: boolean}> = ({fs = 1, desc = true}) => (
  <div dir="ltr" style={{textAlign: 'left'}}>
    <div style={{fontSize: 20 * fs, letterSpacing: 2, color: MUTED, fontWeight: 700}}>GOOGLE CERTIFIED</div>
    <div style={{fontSize: 42 * fs, fontWeight: 600, color: '#202124', marginTop: 4}}>Gemini Educator</div>
    {desc && (
      <div style={{fontSize: 25 * fs, color: MUTED, lineHeight: 1.45, marginTop: 10}}>
        Demonstrate your understanding of Gemini and responsible integration of Google AI for enhanced productivity, student success, and
        innovative learning experiences.
      </div>
    )}
  </div>
);

// ===== حقول الاستمارة =====
const Chevron: React.FC = () => (
  <svg width={22} height={22} viewBox="0 0 24 24">
    <path d="M6 9l6 6 6-6Z" fill={MUTED} />
  </svg>
);
const Field: React.FC<{label: string; value: React.ReactNode; active?: boolean; select?: boolean; h?: number; fs?: number; note?: string}> = ({
  label, value, active, select, h = 66, fs = 28, note,
}) => {
  const f = useCurrentFrame();
  const caret = active && Math.floor(f / 8) % 2 === 0;
  return (
    <div dir="ltr" style={{position: 'relative', marginTop: 16}}>
      <div style={{position: 'absolute', top: -14, left: 18, background: '#fff', padding: '0 8px', fontSize: 20, color: active ? BLUE : MUTED, zIndex: 2}}>{label}</div>
      <div
        style={{
          height: h, border: `2px solid ${active ? BLUE : LINE}`, borderRadius: 12, display: 'flex', alignItems: 'center', padding: '0 22px',
          fontSize: fs, color: '#202124', boxShadow: active ? '0 0 0 5px rgba(26,115,232,.14)' : 'none', background: active ? '#fbfdff' : '#fff',
        }}
      >
        <div style={{flex: 1, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
          <span dir="auto">{value}</span>
          <span style={{width: 2, height: fs * 1.1, background: caret ? BLUE : 'transparent', marginLeft: 2}} />
        </div>
        {select && <Chevron />}
      </div>
      {note && <div style={{fontSize: 18, color: MUTED, marginTop: 4, marginLeft: 6}}>{note}</div>}
    </div>
  );
};

const Radio: React.FC<{on: boolean; label: string; fs?: number}> = ({on, label, fs = 26}) => (
  <div dir="ltr" style={{display: 'flex', alignItems: 'center', gap: 18, padding: '12px 16px', borderRadius: 14, background: on ? '#e8f0fe' : 'transparent'}}>
    <div style={{width: 34, height: 34, borderRadius: 17, border: `3px solid ${on ? BLUE : MUTED}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {on && <div style={{width: 18, height: 18, borderRadius: 9, background: BLUE}} />}
    </div>
    <div style={{fontSize: fs, color: '#202124'}}>{label}</div>
  </div>
);

const Check: React.FC<{on: boolean; children: React.ReactNode; hi?: boolean}> = ({on, children, hi}) => (
  <div dir="ltr" style={{display: 'flex', alignItems: 'flex-start', gap: 16, padding: '8px 12px', borderRadius: 12, background: hi ? '#eef4ff' : 'transparent'}}>
    <div
      style={{
        flex: '0 0 auto', width: 32, height: 32, borderRadius: 6, marginTop: 2, border: `3px solid ${on ? BLUE : MUTED}`, background: on ? BLUE : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {on && (
        <svg width={22} height={22} viewBox="0 0 24 24">
          <path d="M4 12l5 5L20 6" fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" />
        </svg>
      )}
    </div>
    <div style={{fontSize: 20, color: '#3c4043', lineHeight: 1.35}}>{children}</div>
  </div>
);
const A: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{color: BLUE, textDecoration: 'underline'}}>{children}</span>;

// إيميل الوزارة مع إبراز الأصفار (مكان الرقم المدني)
const MoeEmail: React.FC<{text: string; hi: number}> = ({text, hi}) => {
  const zeros = text.slice(1, 13);
  return (
    <span>
      {text.slice(0, 1)}
      <span style={{background: `linear-gradient(transparent 70%, rgba(251,188,5,${0.8 * hi}) 70%)`}}>{zeros}</span>
      {text.slice(13)}
    </span>
  );
};

// ===== المشاهد =====
const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const k = pop(f, 6);
  return (
    <AbsoluteFill style={{direction: 'rtl'}}>
      <div style={{position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', justifyContent: 'center', ...reveal(f, 0, -20)}}>
        <EduLogo fs={40} />
      </div>
      <div style={{position: 'absolute', top: 260, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Panel style={{width: 600, padding: '50px 40px 46px', display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${0.7 + k * 0.3})`, opacity: Math.min(1, k * 1.5)}}>
          <Sparkle size={230} id="intro-sp" rot={interpolate(f, [6, 40], [-120, 0], {...clamp, easing: Easing.out(Easing.back(1.6))})} />
          <div dir="ltr" style={{fontSize: 64, fontWeight: 700, color: '#3c4043', marginTop: 34, ...reveal(f, 22)}}>Gemini Certified</div>
          <div style={{marginTop: 18, width: '92%', ...reveal(f, 28)}}>
            <Button label="Educator" w="100%" h={84} fs={42} />
          </div>
        </Panel>
      </div>
      <div style={{position: 'absolute', top: 1010, left: 0, right: 0, textAlign: 'center', lineHeight: 1.3}}>
        <div style={{fontSize: 104, fontWeight: 900, color: INK, ...reveal(f, 40)}}>احصل على شهادة</div>
        <div style={{fontSize: 96, fontWeight: 900, color: BLUE, ...reveal(f, 50)}}>معلم معتمد من</div>
        <div
          dir="ltr"
          style={{
            fontSize: 120, fontWeight: 900, lineHeight: 1.25, ...reveal(f, 60),
            background: `linear-gradient(90deg, ${G.blue}, ${G.purple} 60%, ${G.red})`, WebkitBackgroundClip: 'text', color: 'transparent',
          }}
        >
          Google Gemini
        </div>
      </div>
      <div style={{position: 'absolute', top: 1540, left: 90, right: 90, ...reveal(f, 78)}}>
        <Panel style={{padding: '26px 40px', textAlign: 'center', fontSize: 38, fontWeight: 700, color: INK, lineHeight: 1.5, borderRadius: 60}}>
          دليل مختصر خطوة بخطوة
          <br />
          للتسجيل والحصول على الشهادة
        </Panel>
      </div>
      <div style={{position: 'absolute', top: 1720, left: 0, right: 0, textAlign: 'center', fontSize: 36, fontWeight: 700, color: MUTED, ...reveal(f, 96)}}>
        إعداد: <span style={{color: BLUE, fontWeight: 900}}>{AUTHOR}</span>
        <div style={{fontSize: 28, fontWeight: 600, marginTop: 4}}>{AUTHOR_ROLE}</div>
      </div>
      <Sfx at={4} src="shimmer" v={0.45} />
    </AbsoluteFill>
  );
};

const Step1: React.FC = () => {
  const f = useCurrentFrame();
  const urlAt = 50;
  const k = pr(f, 120, 18);
  return (
    <AbsoluteFill>
      <Header n={1} title="الدخول إلى الموقع" />
      <div style={{position: 'absolute', top: 340, left: 70, right: 70, ...reveal(f, 12)}}>
        <Panel style={{height: 108, borderRadius: 54, display: 'flex', alignItems: 'center', gap: 22, padding: '0 36px', border: `3px solid #c6dafc`}}>
          <svg width={58} height={58} viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
          </svg>
          <div dir="ltr" style={{fontSize: 46, fontWeight: 800, color: BLUE}}>
            {typed(URL, f, urlAt, 2)}
            <span style={{opacity: f < typeEnd(URL, urlAt) + 10 && Math.floor(f / 8) % 2 === 0 ? 1 : 0}}>|</span>
          </div>
        </Panel>
      </div>
      <Typing at={urlAt} s={URL} />
      <div style={{position: 'absolute', top: 500, left: 70, opacity: k, transform: `translateY(${(1 - k) * 80}px) scale(${0.94 + k * 0.06})`}}>
        <Browser url={URL} w={940}>
          <div dir="ltr" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 36px', borderBottom: '1px solid #eef1f6'}}>
            <EduLogo fs={30} />
            <div style={{display: 'flex', gap: 30, fontSize: 22, color: MUTED}}>
              <span>Home</span>
              <span style={{color: BLUE, fontWeight: 700, borderBottom: `3px solid ${BLUE}`, paddingBottom: 6}}>Certifications</span>
              <span>Resources</span>
              <span>FAQs</span>
            </div>
          </div>
          <div style={{padding: 36}}>
            <GeminiImage h={300} id="s1-img" />
            <div style={{marginTop: 28}}>
              <GeminiBody />
            </div>
            <div dir="ltr" style={{marginTop: 28, display: 'flex'}}>
              <Click at={297} from={[300, 380]}>
                <Button label="Register for an Exam" />
              </Click>
            </div>
          </div>
        </Browser>
      </div>
      <Captions
        top={1500}
        beats={[
          {at: 40, n: 1, ar: 'ندخل على موقع شهادات Google للتعليم'},
          {at: 172, n: 2, ar: 'نختار Google Certified Educator ثم نضغط على', en: 'Register for an Exam'},
          {at: 322, tip: true, ar: 'ابدأ من الصفحة الرئيسية للشهادات'},
        ]}
      />
    </AbsoluteFill>
  );
};

const Step2: React.FC = () => {
  const f = useCurrentFrame();
  const k = pr(f, 8, 20);
  return (
    <AbsoluteFill>
      <Header n={2} title="اختيار الاختبار" />
      <div style={{position: 'absolute', top: 360, left: 140, opacity: k, transform: `translateY(${(1 - k) * 80}px) rotate(${(1 - k) * 4 + 1.5}deg)`}}>
        <Panel style={{width: 800, padding: 30}}>
          <GeminiImage h={360} id="s2-img" fs={100} />
          <div style={{padding: '30px 12px 6px'}}>
            <GeminiBody fs={1.12} />
            <div dir="ltr" style={{marginTop: 34, display: 'flex'}}>
              <Click at={133} ring from={[280, 300]}>
                <Button label="Register" w={340} h={86} fs={34} />
              </Click>
            </div>
          </div>
        </Panel>
      </div>
      <Captions
        top={1440}
        beats={[
          {at: 24, n: 1, ar: 'نختار اختبار', en: 'Gemini Educator'},
          {at: 96, n: 2, ar: 'ثم نضغط على زر', en: 'Register'},
          {at: 150, tip: true, ar: 'تأكد من اختيار الاختبار الصحيح قبل المتابعة'},
        ]}
      />
    </AbsoluteFill>
  );
};

const Step3: React.FC = () => {
  const f = useCurrentFrame();
  const k = pr(f, 6, 20);
  const F = [
    {label: 'First Name *', v: 'الاسم الأول', at: 33, per: 2},
    {label: 'Last Name *', v: 'اسم العائلة', at: 58, per: 2},
    {label: 'School / Organization *', v: 'moe.edu.kw', at: 90, per: 2},
    {label: 'Email Address *', v: MOE_EMAIL, at: 245, per: 1.5},
  ];
  const active = (i: number) => f >= F[i].at - 6 && f < (F[i + 1]?.at ?? 470) - 6;
  const school = f >= 492;
  return (
    <AbsoluteFill>
      <Header n={3} title="تعبئة البيانات الأساسية" />
      <div style={{position: 'absolute', top: 350, left: 90, opacity: k, transform: `translateY(${(1 - k) * 80}px)`}}>
        <Panel style={{width: 900, padding: '40px 46px 36px'}}>
          <div dir="ltr" style={{fontSize: 36, fontWeight: 700, color: '#202124', marginBottom: 18}}>Gemini Educator Registration</div>
          {F.map((x, i) => (
            <div key={i} style={{marginTop: 20}}>
              <Field
                label={x.label}
                active={active(i)}
                value={i === 3 ? <MoeEmail text={typed(x.v, f, x.at, x.per)} hi={pr(f, 369, 12)} /> : typed(x.v, f, x.at, x.per)}
              />
            </div>
          ))}
          <div style={{height: 1, background: '#eef1f6', margin: '34px 0 22px'}} />
          <div dir="ltr" style={{fontSize: 23, color: MUTED, lineHeight: 1.4, marginBottom: 12}}>
            The email address listed above will be associated with my certification, and is my:
          </div>
          <Radio on={false} label="Personal Email Address" />
          <div dir="ltr" style={{display: 'flex'}}>
            <Click at={492} from={[300, 260]} pos={['32px', '30px']}>
              <Radio on={school} label="School / Organizational Email Address" />
            </Click>
          </div>
        </Panel>
      </div>
      {F.map((x, i) => (
        <Typing key={i} at={x.at} s={x.v} per={x.per} />
      ))}
      <Captions
        beats={[
          {at: 26, n: 1, color: G.blue, en: 'First Name:', enFirst: true, ar: 'نضع الاسم الأول'},
          {at: 52, n: 2, color: G.green, en: 'Last Name:', enFirst: true, ar: 'نضع الاسم الثاني أو العائلة'},
          {at: 84, n: 3, color: G.red, en: 'School / Organization:', enFirst: true, ar: 'نكتب moe.edu.kw'},
          {at: 238, n: 4, color: G.purple, ar: 'نتأكد أن التسجيل بالبريد الإلكتروني الخاص بالوزارة', en: MOE_EMAIL, sub: 'مع وضع الرقم المدني بدلاً من الأصفار'},
          {at: 400, n: 5, color: G.purple, ar: 'ثم نختار:', en: 'School / Organizational Email Address'},
        ]}
      />
    </AbsoluteFill>
  );
};

const Step4: React.FC = () => {
  const f = useCurrentFrame();
  const k = pr(f, 6, 20);
  const at = {pe: 18, bk: 161, job: 327, phase: 360, country: 458, lang: 486, c1: 547, c2: 572, next: 604};
  const BACKUP = 'yourname@gmail.com';
  const on = (t: number) => f >= t;
  const act = (a: number, b: number) => f >= a - 4 && f < b - 4;
  return (
    <AbsoluteFill>
      <Header n={4} title="إكمال البيانات" />
      <div style={{position: 'absolute', top: 330, left: 90, opacity: k, transform: `translateY(${(1 - k) * 80}px)`}}>
        <Panel style={{width: 900, padding: '20px 40px 30px'}}>
          <Field label="Personal Email Address *" value={<MoeEmail text={typed(MOE_EMAIL, f, at.pe, 1.5)} hi={0} />} active={act(at.pe, at.bk)} h={62} fs={26} />
          <Field label="Back-up Email Address" value={typed(BACKUP, f, at.bk, 2)} active={act(at.bk, at.job)} h={62} fs={26} note="For Account Recovery" />
          <Field label="Job Title *" value={on(at.job) ? 'Teacher' : ''} select active={act(at.job, at.phase)} h={62} fs={26} />
          <Field label="Phase of Education *" value={on(at.phase) ? 'المرحلة التي تدرّسها' : ''} select active={act(at.phase, at.country)} h={62} fs={26} />
          <Field label="Country *" value={on(at.country) ? 'Kuwait' : ''} select active={act(at.country, at.lang)} h={62} fs={26} />
          <Field label="Language *" value={on(at.lang) ? 'العربية' : ''} select active={act(at.lang, at.c1)} h={62} fs={26} note="This is the language that you would like to take the exam in." />
          <div style={{marginTop: 18, display: 'flex', flexDirection: 'column', gap: 4}}>
            <Check on={false}>I would like to sign up for the latest news, offers and updates from Google for Education.</Check>
            <Check on={false}>I consent to a Google sales representative contacting me.</Check>
            <Click at={at.c1} from={[300, 240]} pos={['30px', '22px']} until={at.c1 + 12}>
              <Check on={on(at.c1)} hi={on(at.c1 - 20)}>
                I certify that I am 18 years old or older, and I understand that if I am not 18+, I will not be allowed to take an exam through the Google for
                Education Certification Launchpad.*
              </Check>
            </Click>
            <Click at={at.c2} from={[0, -90]} pos={['30px', '22px']} lead={14} until={at.c2 + 10}>
              <Check on={on(at.c2)} hi={on(at.c1 - 20)}>
                I have read and accept the Google <A>Terms of Service</A>, <A>Exam Non-Disclosure Agreement (NDA)</A> and the Google for Education{' '}
                <A>Exam Privacy and Policies</A>.*
              </Check>
            </Click>
          </div>
          <div dir="ltr" style={{display: 'flex', marginTop: 18}}>
            <Click at={at.next} from={[260, 160]} ring lead={20}>
              <Button label="Next" w={220} h={70} />
            </Click>
          </div>
        </Panel>
      </div>
      <Typing at={at.pe} s={MOE_EMAIL} per={1.5} />
      <Typing at={at.bk} s={BACKUP} />
      {[at.job, at.phase, at.country, at.lang].map((t) => (
        <Sfx key={t} at={t} src="tick" v={0.5} />
      ))}
      <Captions
        top={1490}
        beats={[
          {at: 14, n: 1, en: 'Personal Email Address:', enFirst: true, ar: 'نضع البريد الإلكتروني الخاص بالوزارة'},
          {at: 117, n: 2, en: 'Back-up Email Address:', enFirst: true, ar: 'نضع البريد الإلكتروني الشخصي', sub: 'يُستخدم لاسترجاع الحساب'},
          {at: 275, n: 3, en: 'Job Title: Teacher', enFirst: true, ar: 'ونختار المرحلة التي ندرّسها'},
          {at: 412, n: 4, en: 'Country: Kuwait · Language:', enFirst: true, ar: 'الدولة الكويت، ولغة الاختبار العربية'},
          {at: 500, n: 5, ar: 'نضع علامة صح أمام الخيارين الأخيرين'},
          {at: 574, n: 6, ar: 'ثم نضغط على زر', en: 'Next'},
        ]}
      />
    </AbsoluteFill>
  );
};

const Step5: React.FC = () => {
  const f = useCurrentFrame();
  const k = pr(f, 6, 20);
  const quiz = interpolate(f, [288, 306], [0, 1], clamp);
  const pick = f >= 335;
  return (
    <AbsoluteFill>
      <Header n={5} title="بدء الاختبار" />
      <div style={{position: 'absolute', top: 360, left: 70, opacity: k, transform: `translateY(${(1 - k) * 80}px)`}}>
        <Browser url="edu.google.com" w={940}>
          <div style={{position: 'relative', height: 820}}>
            {/* رسالة التسجيل */}
            <div style={{position: 'absolute', inset: 0, padding: '56px 50px', direction: 'rtl', opacity: 1 - quiz, transform: `translateX(${quiz * -60}px)`}}>
              <div style={{fontSize: 48, fontWeight: 800, color: '#202124', lineHeight: 1.4}}>تم تسجيلك في «اختبار Gemini للمعلّم»</div>
              <div style={{fontSize: 31, color: '#3c4043', lineHeight: 1.75, marginTop: 30}}>
                نشكر على التسجيل في الاختبار.{' '}
                <span style={{background: `linear-gradient(transparent 55%, rgba(251,188,5,${pr(f, 140, 12) * 0.7}) 55%)`, fontWeight: 700}}>
                  سيكون لديك 14 يومًا لبدء الاختبار.
                </span>{' '}
                يمكنك بدء الاختبار الآن من خلال النقر على زر «إجراء الاختبار» أدناه أو من خلال منصة الشهادات في Google for Education.
              </div>
              <div style={{display: 'flex', gap: 24, marginTop: 56, alignItems: 'center'}}>
                <Click at={264} from={[-260, 300]}>
                  <Button label="إجراء الاختبار" h={88} fs={34} />
                </Click>
                <Button label="الانتقال إلى منصة Launchpad" h={88} fs={26} outline />
              </div>
            </div>
            {/* شاشة الأسئلة */}
            <div style={{position: 'absolute', inset: 0, padding: '50px 50px', direction: 'rtl', opacity: quiz, transform: `translateX(${(1 - quiz) * 60}px)`}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{fontSize: 34, fontWeight: 800, color: BLUE}}>السؤال 1</div>
                <div style={{width: 300, height: 14, borderRadius: 7, background: '#e8eef8', overflow: 'hidden'}}>
                  <div style={{width: `${8 + pr(f, 345, 30) * 6}%`, height: '100%', background: BLUE}} />
                </div>
              </div>
              {[100, 78].map((w, i) => (
                <div key={i} style={{height: 26, width: `${w}%`, borderRadius: 13, background: '#e3e8f0', marginTop: i ? 18 : 40}} />
              ))}
              <div style={{marginTop: 50, display: 'flex', flexDirection: 'column', gap: 22}}>
                {[0, 1, 2, 3].map((i) => {
                  const sel = pick && i === 1;
                  return (
                    <div
                      key={i}
                      style={{
                        height: 88, borderRadius: 20, border: `3px solid ${sel ? BLUE : LINE}`, background: sel ? '#e8f0fe' : '#fff',
                        display: 'flex', alignItems: 'center', gap: 22, padding: '0 28px',
                      }}
                    >
                      <div style={{width: 36, height: 36, borderRadius: 18, border: `3px solid ${sel ? BLUE : MUTED}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        {sel && <div style={{width: 18, height: 18, borderRadius: 9, background: BLUE}} />}
                      </div>
                      <div style={{height: 20, width: `${[52, 64, 44, 58][i]}%`, borderRadius: 10, background: sel ? '#aecbfa' : '#e3e8f0'}} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Browser>
      </div>
      <Sfx at={335} src="tick" v={0.6} />
      <Captions
        beats={[
          {at: 14, n: 1, ar: 'تظهر رسالة: تم تسجيلك في', en: '«اختبار Gemini للمعلّم»'},
          {at: 134, tip: true, ar: 'عندك 14 يومًا لبدء الاختبار من تاريخ التسجيل'},
          {at: 226, n: 2, ar: 'ثم نضغط على زر «إجراء الاختبار»'},
          {at: 288, n: 3, ar: 'بعد ذلك نجيب عن الأسئلة'},
        ]}
      />
    </AbsoluteFill>
  );
};

const Step6: React.FC = () => {
  const f = useCurrentFrame();
  const k = pr(f, 6, 20);
  const card = pr(f, 172, 20);
  const res = f >= 153;
  const items: [string, number][] = [
    ['Home', 0], ['Google AI Educator Series', 0], ['Exams', 0], ['Register for an Exam', 1], ['Continue Exams', 1], ['Results', 0], ['Account Settings', 0],
  ];
  return (
    <AbsoluteFill>
      <Header n={6} title="الوصول إلى النتائج" />
      <div style={{position: 'absolute', top: 340, left: 90, opacity: k, transform: `translateY(${(1 - k) * 80}px)`}}>
        <Panel style={{width: 900, padding: '26px 0 22px'}}>
          <div style={{padding: '0 40px 18px', borderBottom: '1px solid #eef1f6', display: 'flex'}}>
            <EduLogo fs={34} />
          </div>
          <div dir="ltr" style={{padding: '12px 28px 0'}}>
            {items.map(([label, ind]) => {
              const on = label === 'Results' ? res : label === 'Home' && !res;
              const row = (
                <div
                  style={{
                    height: 62, display: 'flex', alignItems: 'center', paddingLeft: 26 + ind * 44, fontSize: 28, color: on ? BLUE : '#202124', fontWeight: on ? 700 : 400,
                    borderRadius: 31, background: on ? '#e8f0fe' : 'transparent', borderLeft: on ? `5px solid ${BLUE}` : '5px solid transparent',
                  }}
                >
                  {label}
                </div>
              );
              return label === 'Results' ? (
                <Click key={label} at={153} from={[260, 300]}>
                  {row}
                </Click>
              ) : (
                <div key={label}>{row}</div>
              );
            })}
          </div>
        </Panel>
      </div>
      <div style={{position: 'absolute', top: 920, left: 90, opacity: card, transform: `translateY(${(1 - card) * 80}px) scale(${0.95 + card * 0.05})`}}>
        <Panel style={{width: 900, padding: '24px 30px 28px'}}>
          <div dir="ltr" style={{fontSize: 34, fontWeight: 600, color: '#202124', marginBottom: 18}}>Your Exam Certifications</div>
          <div dir="ltr" style={{display: 'flex', gap: 28, alignItems: 'center'}}>
            <div style={{width: 360}}>
              <GeminiImage h={250} id="s6-img" pill="العربية" fs={58} />
            </div>
            <div style={{flex: 1}}>
              <GeminiBody desc={false} />
              <div style={{display: 'flex', marginTop: 26}}>
                <Click at={264} from={[240, 260]}>
                  <Button label="See Certification" h={72} fs={28} />
                </Click>
              </div>
            </div>
          </div>
        </Panel>
      </div>
      <Captions
        top={1440}
        beats={[
          {at: 12, n: 1, ar: 'نعود إلى الموقع الرئيسي مرة أخرى'},
          {at: 90, n: 2, ar: 'من القائمة الجانبية نختار', en: 'Results'},
          {at: 172, n: 3, ar: 'سيظهر لنا مربع الاختبار'},
          {at: 232, n: 4, ar: 'ثم نضغط على زر', en: 'See Certification'},
        ]}
      />
    </AbsoluteFill>
  );
};

const Step7: React.FC = () => {
  const f = useCurrentFrame();
  const k = pr(f, 8, 22);
  const dlAt = 112;
  const dl = interpolate(f, [dlAt + 2, dlAt + 52], [0, 1], {...clamp, easing: ease});
  const chip = pr(f, dlAt, 14);
  return (
    <AbsoluteFill>
      <Header n={7} title="عرض الشهادة وتحميلها" />
      {/* لابتوب فيه الشهادة */}
      <div style={{position: 'absolute', top: 360, left: 60, opacity: k, transform: `translateY(${(1 - k) * 90}px) scale(${0.92 + k * 0.08})`}}>
        <div style={{width: 960, height: 640, background: '#1f2430', borderRadius: '34px 34px 0 0', padding: 22}}>
          <div style={{width: '100%', height: '100%', background: '#fff', borderRadius: 14, position: 'relative', overflow: 'hidden', direction: 'rtl', textAlign: 'center'}}>
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 12, background: `linear-gradient(90deg, ${G.blue}, ${G.purple}, ${G.red}, ${G.yellow}, ${G.green})`}} />
            <div style={{marginTop: 38}}>
              <Sparkle size={70} id="cert-sp" rot={interpolate(f, [20, 60], [-90, 0], clamp)} />
            </div>
            <div style={{fontSize: 44, fontWeight: 800, color: '#202124', marginTop: 10}}>معلّم معتمد من Gemini</div>
            <div style={{fontSize: 24, color: MUTED, marginTop: 8}}>تم منح شهادة التأهيل هذه إلى</div>
            <div style={{fontSize: 64, fontWeight: 900, color: INK, marginTop: 10, ...reveal(f, 30, 20)}}>اسم المعلّم</div>
            <div style={{fontSize: 22, color: MUTED, lineHeight: 1.6, margin: '14px 80px 0'}}>
              بعد إثبات امتلاك المعرفة والمهارات والكفاءات الأساسية المطلوبة لاستخدام ذكاء Google الاصطناعي في مجال التعليم
            </div>
            <div style={{display: 'flex', justifyContent: 'center', gap: 60, marginTop: 30, fontSize: 20, color: MUTED}}>
              <div>تاريخ الإصدار</div>
              <div style={{width: 2, background: LINE}} />
              <div>صالحة لغاية</div>
            </div>
            <div style={{display: 'flex', justifyContent: 'center', marginTop: 26}}>
              <EduLogo fs={28} />
            </div>
          </div>
        </div>
        <div style={{width: 1040, height: 34, marginLeft: -40, background: 'linear-gradient(180deg, #d7dbe3, #aab0bc)', borderRadius: '0 0 30px 30px'}} />
      </div>
      {/* زر التحميل */}
      <div style={{position: 'absolute', top: 1110, left: 0, right: 0, display: 'flex', justifyContent: 'center', ...reveal(f, 70)}}>
        <Click at={dlAt} from={[260, 260]}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, background: BLUE, color: '#fff', borderRadius: 50, height: 96, padding: '0 50px', fontSize: 38, fontWeight: 800, boxShadow: '0 10px 26px rgba(26,115,232,.35)'}}>
            <svg width={46} height={46} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12M7 10l5 5 5-5M4 20h16" />
            </svg>
            تحميل الشهادة
          </div>
        </Click>
      </div>
      <div style={{position: 'absolute', top: 1240, left: 220, right: 220, opacity: chip, transform: `translateY(${(1 - chip) * 30}px)`}}>
        <Panel style={{padding: '18px 26px', borderRadius: 22, display: 'flex', alignItems: 'center', gap: 18}}>
          <div style={{width: 52, height: 62, borderRadius: 8, background: '#fce8e6', color: G.red, fontSize: 18, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>PDF</div>
          <div style={{flex: 1}}>
            <div dir="ltr" style={{fontSize: 24, color: '#202124', textAlign: 'left'}}>Gemini_Certified_Educator.pdf</div>
            <div style={{height: 10, borderRadius: 5, background: '#e8eef8', marginTop: 10, overflow: 'hidden', direction: 'ltr'}}>
              <div style={{width: `${dl * 100}%`, height: '100%', background: dl >= 1 ? G.green : BLUE}} />
            </div>
          </div>
          <div style={{fontSize: 40, color: G.green, opacity: dl >= 1 ? 1 : 0}}>✓</div>
        </Panel>
      </div>
      <Sfx at={dlAt + 52} src="shimmer" v={0.35} />
      <Captions
        top={1450}
        beats={[
          {at: 14, n: 1, ar: 'بعد الضغط على See Certification تظهر الشهادة باسمك'},
          {at: 92, n: 2, ar: 'ثم نقوم بتحميل الشهادة'},
        ]}
      />
    </AbsoluteFill>
  );
};

const CONFETTI = new Array(70).fill(0).map((_, i) => ({
  x: random(`cx${i}`) * 1080, d: random(`cd${i}`) * 40, sp: 6 + random(`cs${i}`) * 8, r: random(`cr${i}`) * 360, w: 14 + random(`cw${i}`) * 14,
  c: [G.blue, G.red, G.yellow, G.green, G.purple][i % 5], sw: random(`sw${i}`) * 6.3,
}));

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const k = pop(f, 10);
  return (
    <AbsoluteFill style={{direction: 'rtl'}}>
      {CONFETTI.map((c, i) => {
        const y = -60 + (f - c.d) * c.sp;
        if (f < c.d) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: c.x + Math.sin(f / 10 + c.sw) * 30, top: y, width: c.w, height: c.w * 0.45, borderRadius: 4, background: c.c,
              transform: `rotate(${c.r + f * 8}deg)`, opacity: 0.9,
            }}
          />
        );
      })}
      <div style={{position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `scale(${k})`}}>
          <Sparkle size={260} id="outro-sp" rot={f * 0.6} />
        </div>
      </div>
      <div style={{position: 'absolute', top: 680, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontSize: 150, fontWeight: 900, color: BLUE, ...reveal(f, 20)}}>مبروك 👏</div>
        <div style={{fontSize: 92, fontWeight: 900, color: INK, marginTop: 10, ...reveal(f, 32)}}>حصلت على الشهادة</div>
      </div>
      <div style={{position: 'absolute', top: 1180, left: 110, right: 110, ...reveal(f, 50)}}>
        <Panel style={{padding: '28px 30px', textAlign: 'center', fontSize: 40, fontWeight: 700, color: BLUE, borderRadius: 60}}>احفظ الفيديو وشاركه ليستفيد غيرك</Panel>
      </div>
      <div style={{position: 'absolute', top: 1440, left: 0, right: 0, textAlign: 'center', ...reveal(f, 70)}}>
        <div style={{fontSize: 36, color: MUTED, fontWeight: 700}}>إعداد</div>
        <div style={{fontSize: 76, color: INK, fontWeight: 900, marginTop: 4}}>{AUTHOR}</div>
        <div style={{fontSize: 36, color: BLUE, fontWeight: 700, marginTop: 10}}>{AUTHOR_ROLE}</div>
      </div>
      <Sfx at={10} src="shimmer" v={0.5} />
    </AbsoluteFill>
  );
};

// ===== التجميع =====
// تعليق أ. جنان المعيبف مقطّع لملف لكل مشهد (public/gemini/vo) — حركات المشاهد مضبوطة على كلامها
// والمدة = بداية الصوت + طوله + ذيل قصير + مدة الانتقال، عشان الكلام يخلص قبل ما يبدأ المشهد اللي بعده
const VO_AT = 12;
const SCENES: {C: React.FC; d: number; vo?: string}[] = [
  {C: Intro, d: 230, vo: 'vo01'},
  {C: Step1, d: 385, vo: 'vo02'},
  {C: Step2, d: 327, vo: 'vo03'},
  {C: Step3, d: 559, vo: 'vo04'},
  {C: Step4, d: 664, vo: 'vo05'},
  {C: Step5, d: 403, vo: 'vo06'},
  {C: Step6, d: 343, vo: 'vo07'},
  {C: Step7, d: 240, vo: 'vo08'},
  {C: Outro, d: 210},
];
const starts = SCENES.map((_, i) => SCENES.slice(0, i).reduce((a, s) => a + s.d, 0) - i * T);
export const totalFrames = () => starts[starts.length - 1] + SCENES[SCENES.length - 1].d;

// شريط سفلي ثابت: اسم المُعدّة + نقاط تقدم الخطوات
const Footer: React.FC = () => {
  const f = useCurrentFrame();
  const step = starts.filter((s) => f >= s + T / 2).length - 1; // 0 = انترو، 1..7 الخطوات، 8 = ختام
  const vis = interpolate(f, [starts[1], starts[1] + 15, starts[8], starts[8] + 10], [0, 1, 1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: 1800, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', direction: 'rtl', opacity: vis}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 30, fontWeight: 800, color: INK}}>
        <Sparkle size={30} id="foot-sp" />
        {AUTHOR}
      </div>
      <div style={{display: 'flex', gap: 10}}>
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <div key={n} style={{width: n === step ? 46 : 16, height: 16, borderRadius: 8, background: n <= step ? BLUE : '#c9d6ee'}} />
        ))}
      </div>
    </div>
  );
};

export const GeminiCert: React.FC = () => {
  const total = totalFrames();
  return (
    <AbsoluteFill style={{fontFamily, background: '#f6f8fc'}}>
      <Bg />
      <TransitionSeries>
        {SCENES.flatMap(({C, d, vo}, i) => {
          const seq = (
            <TransitionSeries.Sequence key={`s${i}`} durationInFrames={d}>
              <C />
              {vo && (
                <Sequence from={VO_AT} layout="none">
                  <Audio src={staticFile(`gemini/vo/${vo}.mp3`)} />
                </Sequence>
              )}
            </TransitionSeries.Sequence>
          );
          if (i === 0) return [seq];
          const pres = i === 1 || i === SCENES.length - 1 ? fade() : slide({direction: 'from-left'});
          return [<TransitionSeries.Transition key={`t${i}`} presentation={pres} timing={linearTiming({durationInFrames: T})} />, seq];
        })}
      </TransitionSeries>
      <Footer />
      {starts.slice(1).map((s) => (
        <Sfx key={s} at={s - 4} src="whoosh" v={0.3} />
      ))}
      <Audio
        src={staticFile('c46/soft.mp3')}
        volume={(f) => interpolate(f, [0, 20, starts[8], starts[8] + 30, total - 60, total], [0, 0.1, 0.1, 0.3, 0.3, 0], clamp)}
      />
    </AbsoluteFill>
  );
};
