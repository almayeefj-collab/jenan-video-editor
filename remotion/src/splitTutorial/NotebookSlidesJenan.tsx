// ريل "سوّ عرض تقديمي من أي ملف بـ NotebookLM" — بصوت جنان، بألوان Google، وحسابه في انستقرام
// الصوت تسجيل واحد: public/footage/nlm/user/rec.m4a (ما يرفع للمستودع)
// التوقيتات مأخوذة من تفريغ التسجيل (faster-whisper، توقيت كل كلمة) — بثواني التسجيل الأصلي
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {fontFamily} from '../reel/font';
import {DemoT, SlidesDemo} from './SlidesDemo';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

const G = {blue: '#4285F4', red: '#EA4335', yellow: '#FBBC05', green: '#34A853'};
const GC = [G.blue, G.red, G.yellow, G.green];
const INK = '#202124';
const GREY = '#5f6368';
const HANDLE = '@t.jenanalmayeef4';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.33, 0, 0.2, 1);
const latin = 'Helvetica, Arial, sans-serif';

// بداية الكلام في التسجيل ≈ 3.3 ث — نقص أول 3 ثواني صمت
const OFF = 3.0;
const v = (t: number) => t - OFF; // وقت التسجيل ← وقت الفيديو

// الترجمة (نص مصحّح، بتوقيت التسجيل)
const CUES: [number, number, string][] = [
  [3.3, 5.75, 'تبي عرض تقديمي كامل من أي ملف'],
  [5.86, 9.0, 'بدون ما تصمم ولا شريحة وحدة؟'],
  [9.08, 11.1, 'فيه أداة مجانية من Google'],
  [11.16, 13.0, 'اسمها NotebookLM'],
  [13.06, 16.15, 'ترفع لها كتاب أو بحث أو ملخص'],
  [16.2, 19.15, 'وهي تقرأه وتطلع لك عرض مرتب'],
  [19.22, 20.65, 'بالعناوين والنقاط'],
  [20.7, 22.75, 'وحتى الرسوم البيانية'],
  [22.8, 24.3, 'وبالعربي بعد'],
  [24.84, 26.2, 'أول شي'],
  [26.26, 29.5, 'افتح دفتر جديد وارفع ملفك كمصدر'],
  [30.18, 32.5, 'بعدين من قائمة Studio'],
  [32.54, 34.4, 'اختر Slide Deck'],
  [35.18, 38.5, 'اختر نوع العرض، وخل اللغة عربي'],
  [39.06, 40.65, 'واكتب وش تبي بالضبط'],
  [40.7, 45.15, 'مثلاً: عرض مختصر لطلاب الثانوي بعشر شرائح'],
  [45.22, 47.0, 'واضغط Generate'],
  [48.02, 51.5, 'انتظر كم دقيقة وراح يجهز لك العرض'],
  [52.04, 56.1, 'وهذا عرضك جاهز! تقدر تتصفحه شريحة شريحة'],
  [56.18, 58.9, 'وتنزّله PDF وتعرضه على طول'],
  [59.4, 61.9, 'جربها وقول لي وش سويت'],
  [61.94, 63.7, 'وتابعني على انستقرام'],
];

const INTRO_START = v(9.08) - 0.2;
const DEMO_START = v(24.84) - 0.3;
const OUTRO_START = v(59.4) - 0.3;
const END = v(63.54) + 2.2;
export const totalFrames = () => Math.round(END * FPS);

// حركة الشاشة مربوطة بالكلام (نسبةً لبداية جزء الخطوات)
const d = (t: number) => v(t) - DEMO_START;
const DEMO_T: Partial<DemoT> = {
  addClick: d(26.9),
  fileIn: d(28.3),
  toStudio: d(30.9),
  tileClick: d(33.4),
  dialogIn: d(35.18),
  typeStart: d(41.2),
  typeEnd: d(44.9),
  genClick: d(46.3),
  generating: d(48.02),
  ready: d(52.04),
  downloadClick: d(56.8),
};

const GoogleBar: React.FC<{h?: number}> = ({h = 12}) => (
  <div style={{display: 'flex', height: h}}>
    {GC.map((c) => (
      <div key={c} style={{flex: 1, background: c}} />
    ))}
  </div>
);

const Subtitle: React.FC<{sec: number}> = ({sec}) => {
  const c = CUES.find(([a, b]) => sec >= v(a) - 0.05 && sec < v(b) + 0.1);
  if (!c) return null;
  const p = interpolate(sec - (v(c[0]) - 0.05), [0, 0.15], [0, 1], clamp);
  const idx = CUES.indexOf(c);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1250, display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * 14}px)`}}>
      <div
        style={{
          direction: 'rtl',
          textAlign: 'center',
          fontFamily,
          fontWeight: 800,
          fontSize: 62,
          lineHeight: 1.45,
          color: INK,
          background: '#fff',
          padding: '14px 34px 18px',
          borderRadius: 26,
          boxShadow: '0 8px 30px rgba(60,64,67,0.15)',
          borderBottom: `8px solid ${GC[idx % 4]}`,
        }}
      >
        {c[2]}
      </div>
    </div>
  );
};

const LogoMark: React.FC<{size: number}> = ({size}) => (
  <svg width={size * 1.4} height={size} viewBox="0 0 110 80">
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M ${10 + i * 14} 76 A ${45 - i * 14} ${45 - i * 14} 0 0 1 ${100 - i * 14} 76`} stroke={[G.blue, G.red, G.green][i]} strokeWidth="10" fill="none" />
    ))}
  </svg>
);
const Logo: React.FC<{size: number}> = ({size}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: size * 0.3, direction: 'ltr'}}>
    <LogoMark size={size * 0.8} />
    <span style={{fontFamily: latin, fontSize: size, color: INK, fontWeight: 500, letterSpacing: -size * 0.02}}>NotebookLM</span>
  </div>
);

const Handle: React.FC<{size: number; color?: string}> = ({size, color = INK}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: size * 0.4, direction: 'ltr'}}>
    <svg width={size * 1.2} height={size * 1.2} viewBox="0 0 24 24">
      <defs>
        <linearGradient id="ig" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor={G.yellow} />
          <stop offset="0.5" stopColor={G.red} />
          <stop offset="1" stopColor={G.blue} />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="none" stroke="url(#ig)" strokeWidth="2.2" />
      <circle cx="12" cy="12" r="4.4" fill="none" stroke="url(#ig)" strokeWidth="2.2" />
      <circle cx="17.4" cy="6.6" r="1.3" fill={G.red} />
    </svg>
    <span style={{fontFamily: latin, fontSize: size, fontWeight: 700, color}}>{HANDLE}</span>
  </div>
);

// ١) الافتتاحية
const Hook: React.FC<{sec: number}> = ({sec}) => {
  const words = 'سوّ عرض تقديمي كامل من أي ملف'.split(' ');
  const colors: Record<string, string> = {عرض: G.blue, تقديمي: G.red, ملف: G.green};
  const logoP = interpolate(sec, [0, 0.5], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 70, paddingBottom: 300}}>
      <div style={{opacity: logoP, transform: `scale(${0.9 + 0.1 * logoP})`}}>
        <Logo size={110} />
      </div>
      <div style={{direction: 'rtl', textAlign: 'center', fontFamily, fontWeight: 900, fontSize: 118, lineHeight: 1.25, color: INK, padding: '0 60px'}}>
        {words.map((w, i) => {
          const p = interpolate(sec - 0.3 - i * 0.28, [0, 0.25], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
          return (
            <span key={i} style={{display: 'inline-block', margin: '0 14px', opacity: p, transform: `translateY(${(1 - p) * 40}px)`, color: colors[w] ?? INK}}>
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ٢) الفكرة: ملف ← NotebookLM ← شرائح
const Doc: React.FC = () => (
  <div style={{width: 200, height: 260, background: '#fff', borderRadius: 18, boxShadow: '0 12px 40px rgba(60,64,67,0.18)', padding: 26, boxSizing: 'border-box', position: 'relative'}}>
    <div style={{position: 'absolute', top: 18, right: 18, fontFamily: latin, fontSize: 18, fontWeight: 700, color: '#fff', background: G.red, borderRadius: 6, padding: '3px 8px'}}>PDF</div>
    {[0.5, 0.9, 0.8, 0.95, 0.7, 0.85, 0.6].map((w, i) => (
      <div key={i} style={{height: 12, width: `${w * 100}%`, background: '#e3e5e8', borderRadius: 6, marginTop: i === 0 ? 46 : 14}} />
    ))}
  </div>
);
const MiniSlide: React.FC<{title: string; color: string; chart?: boolean}> = ({title, color, chart}) => (
  <div style={{width: 300, height: 170, borderRadius: 16, background: '#fff', borderTop: `12px solid ${color}`, padding: 20, boxSizing: 'border-box', direction: 'rtl', color: INK, fontFamily, boxShadow: '0 12px 34px rgba(60,64,67,0.2)'}}>
    <div style={{fontSize: 28, fontWeight: 800, marginBottom: 12}}>{title}</div>
    {chart ? (
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 12, height: 70}}>
        {[0.45, 0.7, 0.55, 0.95].map((h, j) => (
          <div key={j} style={{width: 34, height: `${h * 100}%`, background: GC[j], borderRadius: 4}} />
        ))}
      </div>
    ) : (
      [0.9, 0.7, 0.8].map((w, j) => <div key={j} style={{height: 10, width: `${w * 100}%`, background: '#e3e5e8', borderRadius: 5, marginBottom: 12}} />)
    )}
  </div>
);
const Intro: React.FC<{sec: number}> = ({sec}) => {
  const a = (t: number, dur = 0.5) => interpolate(sec, [v(t), v(t) + dur], [0, 1], {...clamp, easing: ease});
  const tags = [
    {at: 9.88, label: 'مجانية', c: G.green},
    {at: 10.68, label: 'من Google', c: G.blue},
    {at: 23.2, label: 'وبالعربي', c: G.red},
  ];
  const flow = a(16.2, 1.6);
  const slides = [
    {at: 19.2, title: 'العناوين', x: -330, y: 0, c: G.blue},
    {at: 20.0, title: 'النقاط', x: 0, y: 40, c: G.yellow},
    {at: 21.6, title: 'رسوم بيانية', x: 330, y: 0, c: G.green, chart: true},
  ];
  const sources = ['كتاب', 'بحث', 'ملخص'];
  const srcAt = [14.1, 14.95, 15.55];
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 210, opacity: a(9.0)}}>
        <Logo size={84} />
      </div>
      <div style={{position: 'absolute', top: 360, display: 'flex', gap: 18, direction: 'rtl'}}>
        {tags.map((tg) => (
          <div key={tg.label} style={{fontFamily, fontWeight: 800, fontSize: 40, color: '#fff', background: tg.c, padding: '10px 30px', borderRadius: 40, opacity: a(tg.at), transform: `scale(${0.8 + 0.2 * a(tg.at)})`}}>
            {tg.label}
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', top: 470, left: 0, right: 0, height: 700}}>
        {/* كتاب · بحث · ملخص */}
        <div style={{position: 'absolute', top: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 22, direction: 'rtl', opacity: 1 - a(16.2, 0.4)}}>
          {sources.map((s, i) => (
            <div key={s} style={{fontFamily, fontWeight: 700, fontSize: 36, color: INK, border: `3px solid ${GC[i + 1]}`, padding: '6px 24px', borderRadius: 14, opacity: a(srcAt[i]), background: '#fff'}}>
              {s}
            </div>
          ))}
        </div>
        <div style={{position: 'absolute', left: 440, top: interpolate(flow, [0, 1], [110, 260]), opacity: a(13.1) * (1 - a(17.6, 0.4)), transform: `scale(${1 - 0.5 * flow})`}}>
          <Doc />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', opacity: a(16.2)}}>
          <div style={{width: 170, height: 170, borderRadius: 40, background: '#fff', boxShadow: '0 12px 40px rgba(60,64,67,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <LogoMark size={80} />
          </div>
        </div>
        {slides.map((sl) => {
          const p = a(sl.at, 0.6);
          return (
            <div key={sl.title} style={{position: 'absolute', left: 540 - 150 + sl.x * p, top: 400 + (110 + sl.y) * p, opacity: p, transform: `scale(${0.4 + 0.6 * p}) rotate(${(sl.x / 330) * 4 * p}deg)`}}>
              <MiniSlide title={sl.title} color={sl.c} chart={sl.chart} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ٣) الخطوات
const Demo: React.FC = () => (
  <AbsoluteFill>
    <div style={{position: 'absolute', top: 220, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <Logo size={64} />
    </div>
    <div style={{position: 'absolute', top: 400, left: 0, width: 1080, height: 720, overflow: 'hidden', boxShadow: '0 20px 60px rgba(60,64,67,0.2)'}}>
      <SlidesDemo t={DEMO_T} />
    </div>
  </AbsoluteFill>
);

// ٤) الخاتمة: تابعني
const Outro: React.FC<{sec: number}> = ({sec}) => {
  const p = interpolate(sec - OUTRO_START, [0, 0.5], [0, 1], {...clamp, easing: ease});
  const h = interpolate(sec, [v(61.94), v(61.94) + 0.5], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.8))});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 46, paddingBottom: 330, opacity: p}}>
      <Logo size={96} />
      <div style={{fontFamily: latin, fontSize: 38, color: GREY, direction: 'ltr'}}>notebooklm.google.com</div>
      <div style={{fontFamily, fontWeight: 900, fontSize: 92, color: G.blue, direction: 'rtl'}}>جرّبها الحين</div>
      <div style={{marginTop: 30, opacity: h, transform: `scale(${0.7 + 0.3 * h})`, background: '#fff', borderRadius: 40, padding: '26px 44px', boxShadow: '0 12px 40px rgba(60,64,67,0.18)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
        <div style={{fontFamily, fontWeight: 800, fontSize: 46, color: INK, direction: 'rtl'}}>تابعني لأدوات أكثر</div>
        <Handle size={50} />
      </div>
    </AbsoluteFill>
  );
};

const Scene: React.FC<{from: number; to: number; children: React.ReactNode}> = ({from, to, children}) => {
  const frame = useCurrentFrame();
  const f0 = Math.round(from * FPS);
  const f1 = Math.round(to * FPS);
  if (frame < f0 - 1 || frame > f1 + 8) return null;
  const o = interpolate(frame, [f0, f0 + 8, f1, f1 + 8], [0, 1, 1, 0], clamp);
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

export const NotebookSlidesJenan: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = frame / FPS;
  const handleP = interpolate(sec, [0.6, 1.2, OUTRO_START - 0.3, OUTRO_START], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#ffffff'}}>
      <div style={{position: 'absolute', top: 0, left: 0, right: 0}}>
        <GoogleBar h={14} />
      </div>
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
        <GoogleBar h={14} />
      </div>

      <Scene from={0} to={INTRO_START}>
        <Hook sec={sec} />
      </Scene>
      <Scene from={INTRO_START} to={DEMO_START}>
        <Intro sec={sec} />
      </Scene>
      <Scene from={DEMO_START} to={OUTRO_START}>
        <Sequence from={Math.round(DEMO_START * FPS)} layout="none">
          <Demo />
        </Sequence>
      </Scene>
      <Scene from={OUTRO_START} to={END + 1}>
        <Outro sec={sec} />
      </Scene>

      <Subtitle sec={sec} />

      {/* الحساب ثابت تحت طول الفيديو */}
      <div style={{position: 'absolute', bottom: 90, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: handleP * 0.9}}>
        <Handle size={34} color={GREY} />
      </div>

      <Audio src={staticFile('footage/nlm/user/rec.m4a')} startFrom={Math.round(OFF * FPS)} />
      <Audio src={staticFile('music/background.wav')} volume={(f) => interpolate(f, [0, 15, totalFrames() - 30, totalFrames()], [0, 0.05, 0.05, 0], clamp)} />
    </AbsoluteFill>
  );
};
