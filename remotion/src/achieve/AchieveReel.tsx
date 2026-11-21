import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {fontFamily} from '../reel/font';

// ريل «ملف الإنجاز بالذكاء الاصطناعي» — بأسلوب جنان وصورتها الحقيقية.
// الفكرة مستوحاة من فيديو مرجعي، بس النص والتصميم مختلفين:
// سؤال افتتاحي → المشكلة → «أنا غيرت الطريقة» → ٣ خطوات → بدون كود → إعلان دورة («إذا حابين اكتبوا بالتعليقات»).

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export type ThemeName = 'pink' | 'navy' | 'clean';
export type AchieveProps = {theme: ThemeName};

type Theme = {
  bg1: string;
  bg2: string;
  blobA: string;
  blobB: string;
  accent: string;
  onAccent: string;
  text: string;
  second: string;
  card: string;
  line: string;
  soft: string;
};

const THEMES: Record<ThemeName, Theme> = {
  pink: {
    bg1: '#fff4f5', bg2: '#fbdde3', blobA: 'rgba(240,120,150,0.35)', blobB: 'rgba(150,120,220,0.28)',
    accent: '#e2577a', onAccent: '#ffffff', text: '#2e2140', second: '#7a5aa8', card: '#ffffff', line: '#f1c4cf', soft: '#ffe7ec',
  },
  navy: {
    bg1: '#081430', bg2: '#123072', blobA: 'rgba(70,130,255,0.45)', blobB: 'rgba(242,193,78,0.22)',
    accent: '#f2c14e', onAccent: '#14213d', text: '#ffffff', second: '#a9c6ff', card: '#102a5e', line: '#2d55ad', soft: 'rgba(255,255,255,0.08)',
  },
  clean: {
    bg1: '#fbf8f3', bg2: '#efe7db', blobA: 'rgba(214,170,120,0.35)', blobB: 'rgba(196,81,63,0.15)',
    accent: '#c4513f', onAccent: '#ffffff', text: '#1c1c1e', second: '#8a7358', card: '#ffffff', line: '#e2d8c8', soft: '#f4ede3',
  },
};

type Visual = 'hook' | 'sources' | 'person' | 'chat' | 'sort' | 'phone' | 'nocode' | 'cta' | 'end';
type Scene = {
  from: number;
  to: number;
  kicker: string;
  headline: string;
  caption: string; // الكلمات بين [] تتلوّن
  visual: Visual;
  step?: number;
};

const SCENES: Scene[] = [
  {from: 0, to: 3.6, kicker: 'سؤال صريح', headline: 'كم ليلة سهرتوا على ملف الإنجاز؟',
    caption: 'كم ليلة سهرتوا وإنتو ترتبون [ملف] [الإنجاز]؟', visual: 'hook'},
  {from: 3.6, to: 8.8, kicker: 'والمشكلة', headline: 'الشواهد متفرقة',
    caption: 'صور بالجوال، شهادات بالإيميل، وأوراق بالدرج… وتجمعونها [ليلة] [التسليم]', visual: 'sources'},
  {from: 8.8, to: 12.4, kicker: 'أنا شخصياً', headline: 'غيرت الطريقة كلها',
    caption: 'أنا غيرت الطريقة كلها، وصار الذكاء الاصطناعي [مساعدي]', visual: 'person'},
  {from: 12.4, to: 17.4, kicker: 'الخطوة ١', headline: 'أرفع الشواهد',
    caption: 'أرفع كل الشواهد مرة وحدة، وأقوله [رتبها] على المعايير', visual: 'chat', step: 1},
  {from: 17.4, to: 22.4, kicker: 'الخطوة ٢', headline: 'يصنّف ويكتب الوصف',
    caption: 'يوزعها على [المعايير]، ويكتب وصف لكل شاهد [بأسلوبي] أنا', visual: 'sort', step: 2},
  {from: 22.4, to: 27.4, kicker: 'الخطوة ٣', headline: 'رابط واحد بس',
    caption: 'ويطلع لي ملف إنجاز [إلكتروني] بألواني، رابط واحد أرسله لأي أحد', visual: 'phone', step: 3},
  {from: 27.4, to: 31.4, kicker: 'والأحلى', headline: 'بدون ولا سطر كود',
    caption: 'وكل هذا بدون ما أكتب ولا سطر [كود]', visual: 'nocode'},
  {from: 31.4, to: 41, kicker: 'عندي لكم خبر', headline: 'دورة جديدة',
    caption: 'حابة أعطيكم [دورة]: شلون تصممون ملف إنجازكم عبر الذكاء الاصطناعي. إذا حابين، اكتبوا [بالتعليقات]', visual: 'cta'},
  {from: 41, to: 44.5, kicker: '', headline: '', caption: '', visual: 'end'},
];

const NAME = 'أ. جنان المعيبف';
const PHOTO = 'achieve/jenan_cut.png';
const sec = (s: number) => Math.round(s * FPS);
export const totalFrames = () => sec(SCENES[SCENES.length - 1].to);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/* ───────────── الخلفية ───────────── */

const Background: React.FC<{t: Theme}> = ({t}) => {
  const f = useCurrentFrame();
  const blob = (c: string, x: number, y: number, r: number, sp: number) => (
    <div style={{position: 'absolute', left: x + Math.sin(f / sp) * 80, top: y + Math.cos(f / (sp * 1.3)) * 60, width: r, height: r, borderRadius: '50%', background: c, filter: 'blur(90px)'}} />
  );
  return (
    <AbsoluteFill style={{background: `linear-gradient(160deg, ${t.bg1} 0%, ${t.bg2} 100%)`}}>
      {blob(t.blobA, -150, 200, 700, 40)}
      {blob(t.blobB, 550, 900, 750, 55)}
      {blob(t.blobA, 300, 1500, 600, 47)}
      {/* نقاط شبكة خفيفة */}
      <AbsoluteFill style={{backgroundImage: `radial-gradient(${t.line} 2.5px, transparent 2.5px)`, backgroundSize: '48px 48px', opacity: 0.55,
        WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 30%, #000 70%, transparent 100%)'}} />
    </AbsoluteFill>
  );
};

/* ───────────── الشريط العلوي ───────────── */

const TopBar: React.FC<{t: Theme}> = ({t}) => {
  const f = useCurrentFrame();
  const cur = SCENES.find((s) => f >= sec(s.from) && f < sec(s.to));
  const step = cur?.step ?? 0;
  const done = f >= sec(SCENES[5].to);
  return (
    <div style={{position: 'absolute', top: 80, left: 60, right: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', direction: 'rtl'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
        <div style={{width: 64, height: 64, borderRadius: 32, background: `url(${staticFile(PHOTO)}) 50% 8% / 230% ${t.soft}`, border: `3px solid ${t.accent}`}} />
        <div style={{fontSize: 30, fontWeight: 800, color: t.text}}>{NAME}</div>
      </div>
      <div style={{display: 'flex', gap: 10, direction: 'rtl'}}>
        {[1, 2, 3].map((n) => {
          const on = done || step >= n;
          return (
            <div key={n} style={{width: on ? 56 : 18, height: 18, borderRadius: 9, background: on ? t.accent : t.line, transition: 'none'}} />
          );
        })}
      </div>
    </div>
  );
};

/* ───────────── النصوص ───────────── */

const parseWords = (s: string) =>
  s.split(' ').filter(Boolean).map((w) => {
    const m = w.match(/^\[(.*)\](.*)$/);
    return m ? {w: m[1] + m[2], hi: true} : {w, hi: false};
  });

const Headline: React.FC<{t: Theme; scene: Scene; local: number}> = ({t, scene, local}) => {
  const {fps} = useVideoConfig();
  const k = spring({frame: local, fps, config: {damping: 16}});
  const h = spring({frame: local - 5, fps, config: {damping: 14, stiffness: 110}});
  if (!scene.headline) return null;
  const isStep = !!scene.step;
  const size = scene.headline.length > 18 ? 76 : scene.headline.length > 12 ? 92 : 118;
  return (
    <div style={{position: 'absolute', top: 210, left: 60, right: 60, textAlign: 'center', direction: 'rtl'}}>
      <div style={{display: 'inline-block', fontSize: 38, fontWeight: 800, padding: '6px 26px', borderRadius: 40,
        background: isStep ? t.accent : t.soft, color: isStep ? t.onAccent : t.accent, border: isStep ? 'none' : `2px solid ${t.line}`,
        opacity: k, transform: `translateY(${(1 - k) * -20}px)`}}>{scene.kicker}</div>
      <div style={{marginTop: 18, fontSize: size, fontWeight: 900, color: t.text, lineHeight: 1.2, opacity: h, transform: `translateY(${(1 - h) * 40}px)`}}>
        {scene.headline}
      </div>
    </div>
  );
};

// ترجمة بأسلوب الريلز: الكلمة الحالية تكبر وتتلون
const Captions: React.FC<{t: Theme; scene: Scene; local: number; dur: number}> = ({t, scene, local, dur}) => {
  if (!scene.caption) return null;
  const words = parseWords(scene.caption);
  const shown = interpolate(local, [4, Math.max(8, dur * 0.75)], [0, words.length], clamp);
  const cur = Math.floor(shown);
  return (
    <div style={{position: 'absolute', top: 1560, left: 60, right: 60, direction: 'rtl', textAlign: 'center', fontSize: 50, fontWeight: 800, lineHeight: 1.55}}>
      <span style={{background: t.card, boxShadow: `0 10px 40px rgba(0,0,0,0.12)`, padding: '10px 26px', borderRadius: 22, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>
        {words.map((w, i) => {
          const o = Math.max(0, Math.min(1, shown - i));
          const active = i === cur || (i === words.length - 1 && cur >= words.length);
          return (
            <span key={i} style={{opacity: 0.18 + 0.82 * o, color: w.hi && o > 0 ? t.accent : t.text, display: 'inline-block',
              transform: `scale(${active && o > 0 ? 1.08 : 1})`, margin: '0 6px'}}>{w.w}</span>
          );
        })}
      </span>
    </div>
  );
};

/* ───────────── عناصر مرسومة ───────────── */

const Card: React.FC<{t: Theme; w: number; h?: number; children?: React.ReactNode; style?: React.CSSProperties}> = ({t, w, h, children, style}) => (
  <div style={{width: w, height: h, background: t.card, borderRadius: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: `2px solid ${t.line}`, ...style}}>{children}</div>
);

const Thumb: React.FC<{hue: number; size: number}> = ({hue, size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <rect width={100} height={100} rx={14} fill={`hsl(${200 + hue},70%,82%)`} />
    <circle cx={72} cy={28} r={10} fill="#ffd36b" />
    <path d="M0 100 L0 78 L32 44 L56 70 L70 56 L100 84 L100 100 Z" fill={`hsl(${150 + hue},40%,55%)`} />
  </svg>
);

const Pop: React.FC<{delay: number; local: number; x: number; y: number; rot?: number; children: React.ReactNode}> = ({delay, local, x, y, rot = 0, children}) => {
  const {fps} = useVideoConfig();
  const s = spring({frame: local - delay, fps, config: {damping: 11, stiffness: 140}});
  const bob = Math.sin((local + delay * 3) / 14) * 7;
  return <div style={{position: 'absolute', left: x, top: y + bob, transform: `translate(-50%,-50%) scale(${s}) rotate(${rot * s}deg)`, opacity: Math.min(1, s * 1.5)}}>{children}</div>;
};

const Person: React.FC<{t: Theme; local: number; dur: number; scale?: number; x?: number; height?: number}> = ({t, local, dur, scale = 1, x = 0, height = 760}) => {
  const {fps} = useVideoConfig();
  const inn = spring({frame: local, fps, config: {damping: 16}});
  const zoom = interpolate(local, [0, dur], [scale, scale + 0.04]);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1530 - height, height, display: 'flex', justifyContent: 'center', opacity: inn}}>
      <Img src={staticFile(PHOTO)} style={{height, transform: `translate(${x}px, ${(1 - inn) * 60}px) scale(${zoom})`, transformOrigin: 'bottom center',
        filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.25))', WebkitMaskImage: 'linear-gradient(180deg, #000 84%, transparent 100%)'}} />
    </div>
  );
};

const Clock: React.FC<{t: Theme; local: number}> = ({t, local}) => (
  <svg width={190} height={190} viewBox="0 0 100 100">
    <circle cx={50} cy={50} r={44} fill={t.card} stroke={t.accent} strokeWidth={6} />
    {new Array(12).fill(0).map((_, i) => (
      <line key={i} x1={50} y1={12} x2={50} y2={18} stroke={t.text} strokeWidth={3} transform={`rotate(${i * 30} 50 50)`} />
    ))}
    <line x1={50} y1={50} x2={50} y2={26} stroke={t.text} strokeWidth={5} strokeLinecap="round" transform={`rotate(${local * 2} 50 50)`} />
    <line x1={50} y1={50} x2={50} y2={18} stroke={t.accent} strokeWidth={3} strokeLinecap="round" transform={`rotate(${local * 24} 50 50)`} />
    <text x={50} y={78} textAnchor="middle" fontSize={11} fontWeight={800} fill={t.second} fontFamily="Cairo">3:00 AM</text>
  </svg>
);

/* ───────────── المشاهد ───────────── */

const SourceCard: React.FC<{t: Theme; label: string; kind: 'phone' | 'mail' | 'drawer'}> = ({t, label, kind}) => (
  <Card t={t} w={290} h={330} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18}}>
    <svg width={150} height={150} viewBox="0 0 100 100">
      {kind === 'phone' && (
        <>
          <rect x={26} y={4} width={48} height={92} rx={10} fill={t.text} />
          <rect x={30} y={12} width={40} height={74} rx={4} fill={t.soft} />
          <rect x={33} y={16} width={16} height={16} rx={3} fill="#9cd3f0" /><rect x={51} y={16} width={16} height={16} rx={3} fill="#f6b7c5" />
          <rect x={33} y={34} width={16} height={16} rx={3} fill="#b9e3b0" /><rect x={51} y={34} width={16} height={16} rx={3} fill="#ffd98a" />
          <rect x={33} y={52} width={16} height={16} rx={3} fill="#c9b7f0" />
        </>
      )}
      {kind === 'mail' && (
        <>
          <rect x={22} y={10} width={56} height={46} rx={4} fill="#fffdf4" stroke="#e3c27a" strokeWidth={3} />
          <circle cx={64} cy={44} r={7} fill="#e9b949" />
          <rect x={30} y={20} width={30} height={4} rx={2} fill={t.second} />
          <rect x={8} y={40} width={84} height={54} rx={8} fill={t.accent} />
          <path d="M8 44 L50 72 L92 44" fill="none" stroke={t.onAccent} strokeWidth={4} />
        </>
      )}
      {kind === 'drawer' && (
        <>
          <rect x={18} y={8} width={44} height={30} rx={2} fill="#fff" stroke={t.line} strokeWidth={2} transform="rotate(-10 40 23)" />
          <rect x={34} y={6} width={44} height={30} rx={2} fill="#fff" stroke={t.line} strokeWidth={2} transform="rotate(8 56 21)" />
          <rect x={8} y={34} width={84} height={60} rx={8} fill={t.second} />
          <rect x={36} y={58} width={28} height={8} rx={4} fill={t.card} />
        </>
      )}
    </svg>
    <div style={{fontSize: 40, fontWeight: 900, color: t.text}}>{label}</div>
  </Card>
);

const ChatWindow: React.FC<{t: Theme; local: number}> = ({t, local}) => {
  const {fps} = useVideoConfig();
  const s1 = spring({frame: local - 8, fps, config: {damping: 14}});
  const prompt = 'رتبها على معايير ملف الإنجاز';
  const typed = Math.floor(interpolate(local, [40, 80], [0, prompt.length], clamp));
  const s2 = spring({frame: local - 95, fps, config: {damping: 12}});
  const dots = local > 82 && local < 95;
  return (
    <div style={{position: 'absolute', top: 560, left: 90, right: 90, transform: `translateY(${(1 - s1) * 80}px)`, opacity: s1}}>
      <Card t={t} w={900} h={640} style={{padding: 34, boxSizing: 'border-box', direction: 'rtl', display: 'flex', flexDirection: 'column', gap: 26}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, borderBottom: `2px solid ${t.line}`, paddingBottom: 18}}>
          <div style={{width: 56, height: 56, borderRadius: 16, background: t.accent, color: t.onAccent, fontWeight: 900, fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>AI</div>
          <div style={{fontSize: 34, fontWeight: 800, color: t.text}}>مساعدي الذكي</div>
        </div>
        {/* رسالتي */}
        <div style={{alignSelf: 'flex-start', background: t.soft, borderRadius: '26px 26px 26px 6px', padding: 22, maxWidth: 680}}>
          <div style={{display: 'flex', gap: 12, marginBottom: 14}}>
            {[0, 1, 2, 3, 4].map((i) => {
              const s = spring({frame: local - 14 - i * 5, fps, config: {damping: 10}});
              return <div key={i} style={{transform: `scale(${s})`}}><Thumb hue={i * 45} size={96} /></div>;
            })}
          </div>
          <div style={{fontSize: 22, fontWeight: 700, color: t.second, marginBottom: 6}}>+١٢ شاهد</div>
          <div style={{fontSize: 38, fontWeight: 800, color: t.text, minHeight: 52}}>{prompt.slice(0, typed)}<span style={{opacity: local % 16 < 8 && typed < prompt.length ? 1 : 0, color: t.accent}}>|</span></div>
        </div>
        {/* رده */}
        {dots ? <div style={{alignSelf: 'flex-end', fontSize: 50, color: t.second, letterSpacing: 6}}>{'•'.repeat(1 + (Math.floor(local / 4) % 3))}</div> : null}
        <div style={{alignSelf: 'flex-end', background: t.accent, color: t.onAccent, borderRadius: '26px 26px 6px 26px', padding: '20px 28px', fontSize: 38, fontWeight: 800,
          transform: `scale(${s2})`, transformOrigin: 'left bottom'}}>
          تم ✓ رتبتها على ٣ معايير
        </div>
      </Card>
    </div>
  );
};

const SortBoard: React.FC<{t: Theme; local: number}> = ({t, local}) => {
  const {fps} = useVideoConfig();
  const cols = [t.accent, t.second, '#e3a93c'];
  const desc = 'شاركت في ورشة «التعلم النشط» وطبقت استراتيجياتها مع طالباتي…';
  const typed = Math.floor(interpolate(local, [55, 120], [0, desc.length], clamp));
  const s = spring({frame: local - 45, fps, config: {damping: 13}});
  return (
    <>
      <div style={{position: 'absolute', top: 560, left: 70, right: 70, display: 'flex', gap: 24, direction: 'rtl'}}>
        {cols.map((c, i) => {
          const sp = spring({frame: local - 4 - i * 5, fps, config: {damping: 13}});
          const n = Math.min(3, Math.max(0, Math.floor((local - 12 - i * 4) / 9)));
          return (
            <Card key={i} t={t} w={300} h={330} style={{transform: `translateY(${(1 - sp) * 60}px)`, opacity: sp, padding: 20, boxSizing: 'border-box'}}>
              <div style={{background: c, color: '#fff', borderRadius: 14, textAlign: 'center', fontSize: 32, fontWeight: 900, padding: '6px 0'}}>المعيار {['١', '٢', '٣'][i]}</div>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16, justifyContent: 'center'}}>
                {new Array(n).fill(0).map((_, k) => <Thumb key={k} hue={i * 60 + k * 25} size={110} />)}
              </div>
            </Card>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 940, left: 90, right: 90, transform: `scale(${s})`, direction: 'rtl'}}>
        <Card t={t} w={900} style={{padding: '26px 34px', boxSizing: 'border-box', border: `3px solid ${t.accent}`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <Thumb hue={20} size={110} />
            <div style={{flex: 1}}>
              <div style={{fontSize: 26, fontWeight: 800, color: t.accent}}>وصف الشاهد · بأسلوبج</div>
              <div style={{fontSize: 34, fontWeight: 700, color: t.text, lineHeight: 1.45, minHeight: 100}}>{desc.slice(0, typed)}</div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

const PhoneSite: React.FC<{t: Theme; local: number}> = ({t, local}) => {
  const {fps} = useVideoConfig();
  const s = spring({frame: local - 4, fps, config: {damping: 14}});
  const scroll = interpolate(local, [30, 120], [0, -330], clamp);
  const link = spring({frame: local - 70, fps, config: {damping: 10}});
  const sw = [t.accent, t.second, '#e3a93c'];
  return (
    <>
      <div style={{position: 'absolute', left: 540, top: 590, transform: `translateX(-50%) translateY(${(1 - s) * 120}px) rotate(${-4 * s}deg)`, opacity: s}}>
        <div style={{width: 430, height: 860, background: '#111', borderRadius: 64, padding: 16, boxShadow: '0 30px 80px rgba(0,0,0,0.35)'}}>
          <div style={{width: '100%', height: '100%', borderRadius: 50, overflow: 'hidden', background: '#fff', direction: 'rtl', position: 'relative'}}>
            <div style={{transform: `translateY(${scroll}px)`}}>
              <div style={{height: 300, background: `linear-gradient(160deg, ${sw[0]}, ${sw[1]})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10}}>
                <div style={{width: 130, height: 130, borderRadius: 65, border: '5px solid #fff', background: `url(${staticFile(PHOTO)}) 50% 8% / 230% #fff`}} />
                <div style={{color: '#fff', fontSize: 30, fontWeight: 900}}>ملف إنجاز {NAME}</div>
              </div>
              {['المعيار الأول', 'المعيار الثاني', 'المعيار الثالث', 'الشهادات'].map((h, i) => (
                <div key={h} style={{margin: '22px 22px 0', padding: 18, borderRadius: 20, background: '#f7f3f6'}}>
                  <div style={{fontSize: 26, fontWeight: 900, color: sw[i % 3]}}>{h}</div>
                  <div style={{display: 'flex', gap: 10, marginTop: 10}}>
                    {[0, 1, 2].map((k) => <Thumb key={k} hue={i * 50 + k * 30} size={105} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', top: 1330, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${link})`}}>
        <div style={{background: t.accent, color: t.onAccent, borderRadius: 40, padding: '12px 34px', fontSize: 38, fontWeight: 900, direction: 'rtl', boxShadow: '0 14px 40px rgba(0,0,0,0.2)'}}>
          رابط ملف الإنجاز ↗
        </div>
      </div>
    </>
  );
};

const NoCodeBadge: React.FC<{t: Theme; local: number}> = ({t, local}) => {
  const {fps} = useVideoConfig();
  const s = spring({frame: local - 25, fps, config: {damping: 10}});
  const n = Math.round(interpolate(local, [30, 60], [999, 0], clamp));
  return (
    <div style={{position: 'absolute', top: 620, right: 60, transform: `scale(${s}) rotate(6deg)`, direction: 'rtl'}}>
      <Card t={t} w={330} style={{padding: '22px 26px', boxSizing: 'border-box', textAlign: 'center', border: `3px solid ${t.accent}`}}>
        <div style={{fontSize: 30, fontWeight: 800, color: t.second}}>أسطر الكود</div>
        <div style={{fontSize: 110, fontWeight: 900, color: t.accent, lineHeight: 1.1}}>{n}</div>
      </Card>
    </div>
  );
};

const CtaExtras: React.FC<{t: Theme; local: number}> = ({t, local}) => {
  const {fps} = useVideoConfig();
  const s = spring({frame: local - 25, fps, config: {damping: 11}});
  const s2 = spring({frame: local - 150, fps, config: {damping: 10}});
  const nudge = Math.sin(local / 5) * 6;
  // بطاقة الدورة + دعوة للتعليق
  return (
    <div style={{position: 'absolute', top: 520, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, direction: 'rtl'}}>
      <div style={{transform: `scale(${s}) rotate(-2deg)`}}>
        <Card t={t} w={820} style={{padding: '24px 34px', boxSizing: 'border-box', border: `3px solid ${t.accent}`, display: 'flex', alignItems: 'center', gap: 24}}>
          <div style={{flex: 1, fontSize: 42, fontWeight: 800, color: t.text, lineHeight: 1.35, textAlign: 'center'}}>
            شلون تصممون <span style={{color: t.accent}}>ملف إنجازكم</span> عبر الذكاء الاصطناعي
          </div>
        </Card>
      </div>
      <div style={{transform: `scale(${s2})`, fontSize: 40, fontWeight: 800, color: t.second, display: 'flex', alignItems: 'center', gap: 14}}>
        إذا حابين، اكتبوا بالتعليقات <span style={{display: 'inline-block', transform: `translateY(${nudge}px)`, color: t.accent}}>↓</span>
      </div>
    </div>
  );
};

const EndCard: React.FC<{t: Theme; local: number}> = ({t, local}) => {
  const {fps} = useVideoConfig();
  const s = spring({frame: local, fps, config: {damping: 13}});
  const fade = interpolate(local, [80, 105], [1, 0], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', direction: 'rtl', opacity: fade}}>
      <div style={{transform: `scale(${s})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24}}>
        <div style={{width: 320, height: 320, borderRadius: 160, border: `8px solid ${t.accent}`, background: `url(${staticFile(PHOTO)}) 50% 10% / 200% ${t.soft}`}} />
        <div style={{fontSize: 82, fontWeight: 900, color: t.text}}>{NAME}</div>
        <div style={{fontSize: 44, fontWeight: 700, color: t.second}}>ملف الإنجاز بالذكاء الاصطناعي</div>
        <div style={{marginTop: 16, background: t.accent, color: t.onAccent, fontSize: 48, fontWeight: 900, padding: '12px 44px', borderRadius: 40}}>إذا حابين الدورة، اكتبوا بالتعليقات</div>
      </div>
    </AbsoluteFill>
  );
};

const SceneVisual: React.FC<{t: Theme; scene: Scene; local: number; dur: number}> = ({t, scene, local, dur}) => {
  switch (scene.visual) {
    case 'hook':
      return (
        <>
          <Person t={t} local={local} dur={dur} />
          <Pop delay={14} local={local} x={850} y={800} rot={8}><Clock t={t} local={local} /></Pop>
        </>
      );
    case 'sources':
      return (
        <>
          <Pop delay={8} local={local} x={810} y={800} rot={6}><SourceCard t={t} label="الجوال" kind="phone" /></Pop>
          <Pop delay={30} local={local} x={270} y={900} rot={-6}><SourceCard t={t} label="الإيميل" kind="mail" /></Pop>
          <Pop delay={52} local={local} x={560} y={1220} rot={3}><SourceCard t={t} label="الدرج" kind="drawer" /></Pop>
        </>
      );
    case 'person':
      return <Person t={t} local={local} dur={dur} scale={1.05} />;
    case 'chat':
      return <ChatWindow t={t} local={local} />;
    case 'sort':
      return <SortBoard t={t} local={local} />;
    case 'phone':
      return <PhoneSite t={t} local={local} />;
    case 'nocode':
      return (
        <>
          <Person t={t} local={local} dur={dur} x={-120} />
          <NoCodeBadge t={t} local={local} />
        </>
      );
    case 'cta':
      return (
        <>
          <Person t={t} local={local} dur={dur} height={700} />
          <CtaExtras t={t} local={local} />
        </>
      );
    default:
      return null;
  }
};

/* ───────────── الانتقال: دائرة تكبر ───────────── */

const CircleWipe: React.FC<{t: Theme; at: number}> = ({t, at}) => {
  const f = useCurrentFrame();
  const local = f - at;
  if (local < -10 || local > 10) return null;
  const r = local < 0 ? interpolate(local, [-10, 0], [0, 1200]) : 1200;
  const o = local < 0 ? 1 : interpolate(local, [0, 10], [1, 0]);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 540 - r, top: 960 - r, width: r * 2, height: r * 2, borderRadius: '50%', background: t.accent, opacity: o}} />
    </AbsoluteFill>
  );
};
const WIPES = [3, 7]; // قبل الخطوات، وقبل الدعوة

/* ───────────── الصوت ───────────── */

const Sfx: React.FC = () => {
  const out: React.ReactNode[] = [];
  SCENES.forEach((s, i) => {
    const st = sec(s.from);
    if (i > 0) out.push(<Sequence key={'w' + i} from={Math.max(0, st - 6)} durationInFrames={30}><Audio src={staticFile(WIPES.includes(i) ? 'sfx/swoosh-up.wav' : 'sfx/whoosh.wav')} volume={0.3} /></Sequence>);
    if (s.visual === 'sources') [8, 30, 52].forEach((d) => out.push(<Sequence key={`p${i}${d}`} from={st + d} durationInFrames={20}><Audio src={staticFile('sfx/pop.wav')} volume={0.45} /></Sequence>));
    if (s.visual === 'chat') {
      for (let k = 40; k < 80; k += 3) out.push(<Sequence key={`c${k}`} from={st + k} durationInFrames={6}><Audio src={staticFile(`sfx/key${k % 4}.wav`)} volume={0.25} /></Sequence>);
      out.push(<Sequence key="ai-reply" from={st + 95} durationInFrames={20}><Audio src={staticFile('sfx/pop.wav')} volume={0.5} /></Sequence>);
    }
    if (s.visual === 'nocode') out.push(<Sequence key="nc" from={st + 60} durationInFrames={30}><Audio src={staticFile('sfx/impact.wav')} volume={0.35} /></Sequence>);
  });
  out.push(<Sequence key="cta-pop" from={sec(31.4) + 25} durationInFrames={20}><Audio src={staticFile('sfx/pop.wav')} volume={0.55} /></Sequence>);
  out.push(<Sequence key="cta-pop2" from={sec(31.4) + 150} durationInFrames={20}><Audio src={staticFile('sfx/pop.wav')} volume={0.45} /></Sequence>);
  out.push(<Sequence key="sh" from={sec(41)} durationInFrames={60}><Audio src={staticFile('sfx/shimmer.wav')} volume={0.45} /></Sequence>);
  return <>{out}</>;
};

/* ───────────── التجميع ───────────── */

export const AchieveReel: React.FC<AchieveProps> = ({theme}) => {
  const t = THEMES[theme] ?? THEMES.pink;
  const total = totalFrames();
  const musicVol = (fr: number) => 0.32 * interpolate(fr, [0, 10, total - 45, total], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{fontFamily, overflow: 'hidden'}}>
      <Background t={t} />
      {SCENES.map((s, i) => {
        const from = sec(s.from);
        const dur = sec(s.to) - from;
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <SceneLayer t={t} scene={s} dur={dur} />
          </Sequence>
        );
      })}
      <TopBar t={t} />
      {WIPES.map((i) => <CircleWipe key={i} t={t} at={sec(SCENES[i].from)} />)}
      <Audio src={staticFile('music/background.wav')} volume={musicVol} />
      <Sfx />
    </AbsoluteFill>
  );
};

const SceneLayer: React.FC<{t: Theme; scene: Scene; dur: number}> = ({t, scene, dur}) => {
  const local = useCurrentFrame();
  if (scene.visual === 'end') return <EndCard t={t} local={local} />;
  const exit = interpolate(local, [dur - 6, dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: exit}}>
      <SceneVisual t={t} scene={scene} local={local} dur={dur} />
      <Headline t={t} scene={scene} local={local} />
      <Captions t={t} scene={scene} local={local} dur={dur} />
    </AbsoluteFill>
  );
};
