// ريل "سوّ عرض تقديمي من أي ملف بـ NotebookLM": بدون متكلم، شرح صوتي (ElevenLabs عبر Higgsfield) + ترجمة
// نفس تسلسل الريل المرجعي: افتتاحية ← شرح الفكرة ← خطوات الاستخدام على الشاشة ← خاتمة
// الصوت في public/footage/nlm/vo0..vo7.mp3 (ما يرفع للمستودع)
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {fontFamily} from '../reel/font';
import {DemoT, SlidesDemo} from './SlidesDemo';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.33, 0, 0.2, 1);
const latin = 'Helvetica, Arial, sans-serif';
const BLUE = '#4a6cf7';
const INK = '#1b1d24';

// الجمل: نص الترجمة + مدة المقطع الصوتي (ثواني، من ffprobe)
const LINES = [
  {text: 'تبي عرض تقديمي كامل من أي ملف، بدون ما تصمم ولا شريحة وحدة؟', dur: 4.75},
  {text: 'فيه أداة مجانية من Google اسمها NotebookLM. ترفع لها كتاب أو بحث أو ملخص، وهي تقرأه وتطلع لك عرض مرتب بالعناوين والنقاط وحتى الرسوم البيانية، وبالعربي بعد.', dur: 15.96},
  {text: 'أول شي، افتح دفتر جديد وارفع ملفك كمصدر.', dur: 3.63},
  {text: 'بعدين من قائمة Studio، اختر Slide Deck.', dur: 2.93},
  {text: 'اختر نوع العرض، وخل اللغة عربي، واكتب وش تبي بالضبط. مثلاً: عرض مختصر لطلاب الثانوي بعشر شرائح. واضغط Generate.', dur: 8.91},
  {text: 'انتظر كم دقيقة وهو يجهز لك العرض.', dur: 3.0},
  {text: 'وهذا عرضك جاهز! تقدر تتصفحه شريحة شريحة، وتنزّله PDF وتعرضه على طول.', dur: 6.43},
  {text: 'جربها، وقول لي وش سويت فيها.', dur: 2.12},
];
// وقفة بعد كل جملة (ثواني)
const GAPS = [0.5, 0.6, 1.4, 0.6, 0.6, 2.2, 1.2, 1.4];

const starts = (() => {
  let t = 0.3;
  return LINES.map((l, i) => {
    const s = t;
    t += l.dur + GAPS[i];
    return s;
  });
})();
const END = starts[7] + LINES[7].dur + GAPS[7];
export const totalFrames = () => Math.round(END * FPS);

const DEMO_START = starts[2] - 0.2;
const INTRO_START = starts[1] - 0.2;
const OUTRO_START = starts[7] - 0.3;

// توقيت حركة العرض على الشاشة مربوط بالصوت (نسبةً لبداية العرض)
const rel = (i: number, off = 0) => starts[i] - DEMO_START + off;
const DEMO_T: Partial<DemoT> = {
  addClick: rel(2, 1.4),
  fileIn: rel(2, 2.1),
  toStudio: rel(3, 0),
  tileClick: rel(3, 2.0),
  dialogIn: rel(4, 0),
  typeStart: rel(4, 3.2),
  typeEnd: rel(4, 6.6),
  genClick: rel(4, 8.2),
  generating: rel(5, 0),
  ready: rel(6, 0),
  downloadClick: rel(6, 4.0),
};

// الترجمة: كل جملة تنقسم لمقاطع قصيرة موزعة على مدتها حسب طولها
const chunks = (text: string, max = 5) => {
  const w = text.split(/\s+/);
  const out: string[] = [];
  for (let i = 0; i < w.length; i += max) out.push(w.slice(i, i + max).join(' '));
  return out;
};
const Subtitle: React.FC<{sec: number}> = ({sec}) => {
  const i = LINES.findIndex((l, k) => sec >= starts[k] && sec < starts[k] + l.dur + 0.25);
  if (i < 0) return null;
  const parts = chunks(LINES[i].text);
  const total = parts.reduce((a, p) => a + p.length, 0);
  let acc = starts[i];
  let cur = 0;
  let curStart = acc;
  for (let k = 0; k < parts.length; k++) {
    const d = (parts[k].length / total) * LINES[i].dur;
    if (sec >= acc) {
      cur = k;
      curStart = acc;
    }
    acc += d;
  }
  const p = interpolate(sec - curStart, [0, 0.18], [0, 1], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        top: 1250,
        textAlign: 'center',
        direction: 'rtl',
        fontFamily,
        fontWeight: 800,
        fontSize: 64,
        lineHeight: 1.75,
        color: INK,
        opacity: p,
        transform: `translateY(${(1 - p) * 16}px)`,
      }}
    >
      <span style={{background: '#fff', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone', padding: '4px 22px', borderRadius: 18, boxShadow: '0 8px 30px rgba(30,40,90,0.12)'}}>
        {parts[cur]}
      </span>
    </div>
  );
};

const LogoMark: React.FC<{size: number; color?: string}> = ({size, color = INK}) => (
  <svg width={size * 1.4} height={size} viewBox="0 0 110 80">
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M ${10 + i * 14} 76 A ${45 - i * 14} ${45 - i * 14} 0 0 1 ${100 - i * 14} 76`} stroke={color} strokeWidth="10" fill="none" />
    ))}
  </svg>
);
const Logo: React.FC<{size: number}> = ({size}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: size * 0.3, direction: 'ltr'}}>
    <LogoMark size={size * 0.8} />
    <span style={{fontFamily: latin, fontSize: size, color: INK, fontWeight: 500, letterSpacing: -size * 0.02}}>NotebookLM</span>
  </div>
);

// ١) الافتتاحية: الشعار كبير + السؤال كلمة كلمة
const Hook: React.FC<{sec: number}> = ({sec}) => {
  const words = 'سوّ عرض تقديمي كامل من أي ملف'.split(' ');
  const logoP = interpolate(sec, [0, 0.5], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 70, paddingBottom: 260}}>
      <div style={{opacity: logoP, transform: `scale(${0.9 + 0.1 * logoP})`}}>
        <Logo size={110} />
      </div>
      <div style={{direction: 'rtl', textAlign: 'center', fontFamily, fontWeight: 900, fontSize: 112, lineHeight: 1.25, color: INK, padding: '0 70px'}}>
        {words.map((w, i) => {
          const p = interpolate(sec - 0.5 - i * 0.22, [0, 0.25], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
          const hl = w === 'تقديمي' || w === 'عرض';
          return (
            <span key={i} style={{display: 'inline-block', margin: '0 14px', opacity: p, transform: `translateY(${(1 - p) * 40}px)`, color: hl ? BLUE : INK}}>
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
  <div style={{width: 200, height: 260, background: '#fff', borderRadius: 18, boxShadow: '0 12px 40px rgba(30,40,90,0.15)', padding: 26, boxSizing: 'border-box', position: 'relative'}}>
    <div style={{position: 'absolute', top: 18, right: 18, fontFamily: latin, fontSize: 18, fontWeight: 700, color: '#fff', background: '#d93025', borderRadius: 6, padding: '3px 8px'}}>PDF</div>
    {[0.5, 0.9, 0.8, 0.95, 0.7, 0.85, 0.6].map((w, i) => (
      <div key={i} style={{height: 12, width: `${w * 100}%`, background: '#dfe2ec', borderRadius: 6, marginTop: i === 0 ? 46 : 14}} />
    ))}
  </div>
);
const MiniSlide: React.FC<{title: string; chart?: boolean}> = ({title, chart}) => (
  <div style={{width: 300, height: 170, borderRadius: 14, background: 'linear-gradient(135deg,#1d2b53,#3a4f8f)', padding: 20, boxSizing: 'border-box', direction: 'rtl', color: '#fff', fontFamily, boxShadow: '0 12px 34px rgba(29,43,83,0.3)'}}>
    <div style={{fontSize: 26, fontWeight: 800, marginBottom: 14}}>{title}</div>
    {chart ? (
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 12, height: 70}}>
        {[0.4, 0.7, 0.55, 0.95].map((h, j) => (
          <div key={j} style={{width: 34, height: `${h * 100}%`, background: j === 3 ? '#f5c451' : '#8fa6e8', borderRadius: 4}} />
        ))}
      </div>
    ) : (
      [0.9, 0.7, 0.8].map((w, j) => <div key={j} style={{height: 10, width: `${w * 100}%`, background: 'rgba(255,255,255,0.55)', borderRadius: 5, marginBottom: 12}} />)
    )}
  </div>
);
const Intro: React.FC<{sec: number}> = ({sec}) => {
  const t = sec - INTRO_START;
  const a = (from: number, d = 0.5) => interpolate(t, [from, from + d], [0, 1], {...clamp, easing: ease});
  const tags = [
    {at: 0.8, label: 'مجانية من Google'},
    {at: 5.0, label: 'كتاب · بحث · ملخص'},
    {at: 13.2, label: 'وبالعربي'},
  ];
  const flow = a(5.6, 1.6); // الملف يدخل الأداة
  const slides = [
    {at: 9.2, title: 'العناوين', x: -330, y: 0},
    {at: 10.3, title: 'النقاط', x: 0, y: 40},
    {at: 11.4, title: 'رسوم بيانية', x: 330, y: 0, chart: true},
  ];
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 210, opacity: a(0)}}>
        <Logo size={84} />
      </div>
      <div style={{position: 'absolute', top: 360, display: 'flex', gap: 18, direction: 'rtl'}}>
        {tags.map((tg) => (
          <div key={tg.label} style={{fontFamily, fontWeight: 700, fontSize: 38, color: BLUE, background: '#e8ecff', padding: '10px 28px', borderRadius: 40, opacity: a(tg.at), transform: `scale(${0.8 + 0.2 * a(tg.at)})`}}>
            {tg.label}
          </div>
        ))}
      </div>
      {/* ملف ← سهم ← شرائح */}
      <div style={{position: 'absolute', top: 540, left: 0, right: 0, height: 700}}>
        <div style={{position: 'absolute', left: 440, top: interpolate(flow, [0, 1], [0, 210]), opacity: a(4.8) * (1 - a(7.4, 0.4)), transform: `scale(${1 - 0.5 * flow})`}}>
          <Doc />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', opacity: a(5.6)}}>
          <div style={{width: 170, height: 170, borderRadius: 40, background: '#fff', boxShadow: '0 12px 40px rgba(30,40,90,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + 0.08 * Math.sin(Math.max(0, t - 7.2) * 6) * (t > 7.2 && t < 9 ? 1 : 0)})`}}>
            <LogoMark size={80} />
          </div>
        </div>
        {slides.map((sl) => {
          const p = a(sl.at, 0.6);
          return (
            <div key={sl.title} style={{position: 'absolute', left: 540 - 150 + sl.x * p, top: 380 + (100 + sl.y) * p, opacity: p, transform: `scale(${0.4 + 0.6 * p}) rotate(${(sl.x / 330) * 4 * p}deg)`}}>
              <MiniSlide title={sl.title} chart={sl.chart} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ٣) الخطوات: شاشة الأداة مكبّرة في النص
const DEMO_SCALE = 1.0;
const Demo: React.FC = () => (
  <AbsoluteFill>
    <div style={{position: 'absolute', top: 220, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <Logo size={64} />
    </div>
    <div
      style={{
        position: 'absolute',
        top: 400,
        left: 0,
        width: 1080,
        height: 720,
        transform: `scale(${DEMO_SCALE})`,
        borderRadius: 0,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(30,40,90,0.18)',
      }}
    >
      <SlidesDemo t={DEMO_T} />
    </div>
  </AbsoluteFill>
);

// ٤) الخاتمة
const Outro: React.FC<{sec: number}> = ({sec}) => {
  const p = interpolate(sec - OUTRO_START, [0, 0.5], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 50, paddingBottom: 300, opacity: p}}>
      <Logo size={100} />
      <div style={{fontFamily: latin, fontSize: 40, color: '#666', direction: 'ltr'}}>notebooklm.google.com</div>
      <div style={{fontFamily, fontWeight: 900, fontSize: 96, color: BLUE, direction: 'rtl', transform: `scale(${0.9 + 0.1 * p})`}}>جرّبها الحين</div>
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

export const NotebookSlidesVO: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = frame / FPS;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#f6f7fb 0%,#eceffa 100%)'}}>
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

      {LINES.map((_, i) => (
        <Sequence key={i} from={Math.round(starts[i] * FPS)}>
          <Audio src={staticFile(`footage/nlm/vo${i}.mp3`)} />
        </Sequence>
      ))}
      <Audio src={staticFile('music/background.wav')} volume={(f) => interpolate(f, [0, 15, totalFrames() - 30, totalFrames()], [0, 0.07, 0.07, 0], clamp)} />
    </AbsoluteFill>
  );
};
