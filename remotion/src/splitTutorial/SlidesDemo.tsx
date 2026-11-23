// عرض متحرك (مبسّط) لخطوات عمل عرض تقديمي في NotebookLM — يحل محل تسجيل الشاشة
// ١ أضف المصدر ← ٢ Studio ← Slide Deck ← ٣ خصّص العرض ← ٤ ينشئ ← ٥ العرض جاهز وتنزّله PDF
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {fontFamily} from '../reel/font';

const FPS = 30;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.45, 0, 0.2, 1);
const s = (sec: number) => Math.round(sec * FPS);
const latin = 'Helvetica, Arial, sans-serif';

// توقيت الخطوات (بالثواني من بداية العرض)
const T = {
  addClick: 1.4,
  fileIn: 2.2,
  toStudio: 5.5,
  tileClick: 7.2,
  dialogIn: 8.0,
  typeStart: 10.5,
  typeEnd: 14.0,
  genClick: 15.2,
  generating: 15.8,
  ready: 21.5,
  downloadClick: 30.0,
};

export const SLIDES_PROMPT = 'عرض مختصر لطلاب الثانوي، ١٠ شرائح';

const STEPS: {at: number; label: string}[] = [
  {at: 0, label: 'الخطوة ١: أضف ملفك كمصدر'},
  {at: T.toStudio, label: 'الخطوة ٢: من Studio اختر Slide Deck'},
  {at: T.dialogIn, label: 'الخطوة ٣: اختر النوع واللغة واكتب طلبك'},
  {at: T.generating, label: 'الخطوة ٤: ينشئ العرض خلال دقائق'},
  {at: T.ready, label: 'الخطوة ٥: العرض جاهز وتنزّله PDF'},
];

// لوحة: Sources | Chat | Studio — رسم مبسّط، مو نسخة طبق الأصل
const W = 1080;
const H = 720;
const BAR = 70;
const COL = {src: [16, 300], chat: [316, 748], studio: [764, 1064]} as const;

const card = (x: number, w: number): React.CSSProperties => ({
  position: 'absolute',
  left: x,
  top: BAR + 14,
  width: w,
  bottom: 16,
  background: '#fff',
  borderRadius: 22,
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  overflow: 'hidden',
});
const head: React.CSSProperties = {fontFamily: latin, fontSize: 22, color: '#333', padding: '16px 20px', fontWeight: 600};

const TILES = [
  ['Audio Overview', '#e7e8fb'],
  ['Slide Deck', '#eef0dc'],
  ['Video Overview', '#e2f0e5'],
  ['Mind Map', '#f3e4ef'],
  ['Reports', '#f2efdc'],
  ['Flashcards', '#f6e2e2'],
  ['Quiz', '#dfeef4'],
  ['Infographic', '#efe5f6'],
] as const;
const tilePos = (i: number) => ({x: COL.studio[0] + 14 + (i % 2) * 140, y: BAR + 70 + Math.floor(i / 2) * 64});

// مسار الماوس: [ثانية، x، y]
const PATH: [number, number, number][] = [
  [0, 560, 500],
  [T.addClick - 0.3, 158, BAR + 74],
  [T.addClick + 1.2, 158, BAR + 74],
  [T.toStudio, 600, 380],
  [T.tileClick - 0.2, tilePos(1).x + 64, tilePos(1).y + 26],
  [T.dialogIn + 0.6, tilePos(1).x + 64, tilePos(1).y + 26],
  [T.typeStart - 0.4, 540, 468],
  [T.typeEnd + 0.2, 540, 468],
  [T.genClick - 0.2, 760, 574],
  [T.generating + 1, 760, 574],
  [T.ready + 1, 540, 420],
  [T.downloadClick - 0.3, 900, 132],
  [99, 900, 132],
];
const cursorAt = (sec: number) => {
  for (let i = 0; i < PATH.length - 1; i++) {
    const [t0, x0, y0] = PATH[i];
    const [t1, x1, y1] = PATH[i + 1];
    if (sec <= t1) {
      const p = interpolate(sec, [t0, t1], [0, 1], {...clamp, easing: ease});
      return {x: x0 + (x1 - x0) * p, y: y0 + (y1 - y0) * p};
    }
  }
  return {x: PATH[PATH.length - 1][1], y: PATH[PATH.length - 1][2]};
};

const Cursor: React.FC<{sec: number}> = ({sec}) => {
  const {x, y} = cursorAt(sec);
  const clicks = [T.addClick, T.tileClick, T.genClick, T.downloadClick];
  const c = clicks.find((t) => sec >= t && sec < t + 0.5);
  const r = c === undefined ? 0 : interpolate(sec - c, [0, 0.5], [0, 1]);
  return (
    <>
      {c !== undefined && (
        <div
          style={{
            position: 'absolute',
            left: x - 30 * r,
            top: y - 30 * r,
            width: 60 * r,
            height: 60 * r,
            borderRadius: '50%',
            background: `rgba(66,133,244,${0.4 * (1 - r)})`,
          }}
        />
      )}
      <svg style={{position: 'absolute', left: x - 4, top: y - 2}} width="34" height="44" viewBox="0 0 17 22">
        <path d="M1 1 L1 17 L5.5 13 L8.5 20 L11 19 L8 12 L14 12 Z" fill="#111" stroke="#fff" strokeWidth="1.4" />
      </svg>
    </>
  );
};

const Typed: React.FC<{text: string; sec: number}> = ({text, sec}) => {
  const n = Math.round(interpolate(sec, [T.typeStart, T.typeEnd], [0, text.length], clamp));
  const caret = sec >= T.typeStart && sec < T.genClick && Math.floor(sec * 2) % 2 === 0;
  return (
    <span>
      {text.slice(0, n)}
      <span style={{opacity: caret ? 1 : 0}}>|</span>
    </span>
  );
};

const Opt: React.FC<{label: string; on?: boolean}> = ({label, on}) => (
  <div
    style={{
      flex: 1,
      padding: '12px 16px',
      borderRadius: 14,
      border: `2px solid ${on ? '#4a6cf7' : '#dde'}`,
      background: on ? '#eef2ff' : '#fff',
      fontFamily: latin,
      fontSize: 20,
      color: '#333',
      textAlign: 'center',
    }}
  >
    {label}
  </div>
);

const SLIDES = [
  {title: 'المقدمة', bars: [0.8, 0.6, 0.7]},
  {title: 'الفكرة الأساسية', bars: [0.9, 0.5]},
  {title: 'أهم الأرقام', chart: true},
  {title: 'الخلاصة', bars: [0.7, 0.8, 0.4]},
];

const Slide: React.FC<{i: number; big?: boolean}> = ({i, big}) => {
  const sl = SLIDES[i % SLIDES.length];
  const k = big ? 1 : 0.32;
  return (
    <div
      style={{
        width: 640 * k,
        height: 360 * k,
        background: 'linear-gradient(135deg,#1d2b53,#3a4f8f)',
        borderRadius: 14 * k,
        padding: 34 * k,
        boxSizing: 'border-box',
        direction: 'rtl',
        fontFamily,
        color: '#fff',
        flexShrink: 0,
      }}
    >
      <div style={{fontSize: 44 * k, fontWeight: 800, marginBottom: 24 * k}}>{sl.title}</div>
      {'chart' in sl ? (
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 22 * k, height: 170 * k}}>
          {[0.4, 0.7, 0.55, 0.95].map((h, j) => (
            <div key={j} style={{width: 60 * k, height: `${h * 100}%`, background: j === 3 ? '#f5c451' : '#8fa6e8', borderRadius: 6 * k}} />
          ))}
        </div>
      ) : (
        sl.bars!.map((b, j) => (
          <div key={j} style={{height: 18 * k, width: `${b * 100}%`, background: 'rgba(255,255,255,0.55)', borderRadius: 9 * k, marginBottom: 20 * k}} />
        ))
      )}
    </div>
  );
};

export const SlidesDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const sec = frame / FPS;
  const fileP = interpolate(frame, [s(T.fileIn), s(T.fileIn) + 10], [0, 1], clamp);
  const tileOn = sec >= T.tileClick;
  const dialogP = interpolate(frame, [s(T.dialogIn), s(T.dialogIn) + 10], [0, 1], {...clamp, easing: ease});
  const dialogOut = interpolate(frame, [s(T.genClick) + 6, s(T.genClick) + 14], [1, 0], clamp);
  const showDialog = sec >= T.dialogIn && sec < T.genClick + 0.5;
  const generating = sec >= T.generating && sec < T.ready;
  const readyP = interpolate(frame, [s(T.ready), s(T.ready) + 12], [0, 1], {...clamp, easing: ease});
  const step = [...STEPS].reverse().find((st) => sec >= st.at)!;
  const stepIdx = STEPS.indexOf(step);
  const stepP = interpolate(frame - s(step.at), [0, 10], [0, 1], clamp);
  // تقليب الشرائح بعد ما يجهز العرض
  const slideIdx = Math.max(0, Math.floor((sec - T.ready - 1.5) / 2));
  const dlP = interpolate(frame, [s(T.downloadClick) + 6, s(T.downloadClick) + 16], [0, 1], clamp);

  return (
    <AbsoluteFill style={{background: '#f3f4f8', width: W, height: H}}>
      {/* الشريط العلوي */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: BAR, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16}}>
        <div style={{width: 40, height: 40, borderRadius: 20, background: '#222'}} />
        <div style={{fontFamily: latin, fontSize: 24, color: '#222', fontWeight: 600}}>My notebook</div>
        <div style={{flex: 1}} />
        <div style={{fontFamily: latin, fontSize: 20, background: '#111', color: '#fff', padding: '8px 18px', borderRadius: 20}}>+ Create notebook</div>
      </div>

      {/* Sources */}
      <div style={card(COL.src[0], COL.src[1] - COL.src[0])}>
        <div style={head}>Sources</div>
        <div style={{margin: '0 16px', padding: '12px 0', borderRadius: 20, border: '1.5px solid #ccd', textAlign: 'center', fontFamily: latin, fontSize: 20, color: '#333', background: sec >= T.addClick && sec < T.addClick + 0.4 ? '#e8ecff' : '#fff'}}>
          + Add sources
        </div>
        <div
          style={{
            margin: '22px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            opacity: fileP,
            transform: `translateY(${(1 - fileP) * 14}px)`,
            direction: 'rtl',
          }}
        >
          <div style={{fontFamily: latin, fontSize: 14, fontWeight: 700, color: '#fff', background: '#d93025', borderRadius: 4, padding: '3px 6px'}}>PDF</div>
          <div style={{fontFamily, fontSize: 22, color: '#333', flex: 1}}>ملفك.pdf</div>
          <div style={{fontFamily: latin, fontSize: 20, color: '#4a6cf7'}}>✓</div>
        </div>
      </div>

      {/* Chat */}
      <div style={card(COL.chat[0], COL.chat[1] - COL.chat[0])}>
        <div style={head}>Chat</div>
        {[0.9, 0.75, 0.85, 0.6, 0.8].map((w, i) => (
          <div key={i} style={{height: 14, width: `${w * 85}%`, marginRight: 22, marginLeft: 'auto', marginBottom: 16, background: '#e6e7ee', borderRadius: 7, opacity: fileP}} />
        ))}
      </div>

      {/* Studio */}
      <div style={card(COL.studio[0], COL.studio[1] - COL.studio[0])}>
        <div style={head}>Studio</div>
      </div>
      {TILES.map(([label, bg], i) => {
        const p = tilePos(i);
        const on = i === 1 && tileOn;
        const hover = i === 1 && sec > T.tileClick - 0.8 && !on;
        return (
          <div
            key={label}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              width: 132,
              height: 54,
              borderRadius: 12,
              background: bg,
              border: `2px solid ${on ? '#4a6cf7' : hover ? '#9aa' : 'transparent'}`,
              fontFamily: latin,
              fontSize: 15,
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              padding: '0 10px',
              boxSizing: 'border-box',
              transform: on && sec < T.tileClick + 0.3 ? 'scale(0.96)' : 'none',
            }}
          >
            {label}
          </div>
        );
      })}
      {generating && (
        <div style={{position: 'absolute', left: COL.studio[0] + 18, top: BAR + 350, display: 'flex', alignItems: 'center', gap: 12, fontFamily: latin, fontSize: 18, color: '#333'}}>
          <div style={{width: 22, height: 22, borderRadius: 11, border: '3px solid #ccd', borderTopColor: '#4a6cf7', transform: `rotate(${frame * 12}deg)`}} />
          Generating Slide Deck…
        </div>
      )}
      {sec >= T.ready && (
        <div style={{position: 'absolute', left: COL.studio[0] + 14, top: BAR + 340, width: 272, padding: '12px 14px', borderRadius: 12, background: '#eef0dc', fontFamily: latin, fontSize: 17, color: '#333', opacity: readyP}}>
          ▦ Slide Deck · 10 slides
        </div>
      )}

      {/* نافذة التخصيص */}
      {showDialog && (
        <AbsoluteFill style={{background: `rgba(0,0,0,${0.3 * dialogP * dialogOut})`}}>
          <div
            style={{
              position: 'absolute',
              left: 240,
              top: 130,
              width: 600,
              padding: 30,
              background: '#fff',
              borderRadius: 24,
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              opacity: dialogP * dialogOut,
              transform: `scale(${0.95 + 0.05 * dialogP})`,
            }}
          >
            <div style={{fontFamily: latin, fontSize: 26, fontWeight: 700, color: '#222', marginBottom: 18}}>Customize Slide Deck</div>
            <div style={{display: 'flex', gap: 12, marginBottom: 14}}>
              <Opt label="Detailed Deck" on />
              <Opt label="Presenter Slides" />
            </div>
            <div style={{display: 'flex', gap: 12, marginBottom: 18}}>
              <Opt label="Language: العربية" on />
              <Opt label="Length: Default" />
            </div>
            <div style={{border: '1.5px solid #ccd', borderRadius: 14, padding: '14px 16px', minHeight: 60, direction: 'rtl', fontFamily, fontSize: 24, color: '#222'}}>
              <Typed text={SLIDES_PROMPT} sec={sec} />
            </div>
            <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 18}}>
              <div style={{fontFamily: latin, fontSize: 20, background: sec >= T.genClick ? '#3550d4' : '#4a6cf7', color: '#fff', padding: '10px 26px', borderRadius: 20}}>Generate</div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* العرض الجاهز */}
      {sec >= T.ready + 0.8 && (
        <AbsoluteFill style={{background: `rgba(243,244,248,${interpolate(sec, [T.ready + 0.8, T.ready + 1.2], [0, 1], clamp)})`}}>
          <div style={{position: 'absolute', left: 60, top: 100, display: 'flex', gap: 30, opacity: interpolate(sec, [T.ready + 0.8, T.ready + 1.3], [0, 1], clamp)}}>
            <div style={{transform: `scale(${1 - 0.04 * Math.max(0, Math.min(1, (sec - T.ready - 1.5 - slideIdx * 2) * 4))})`}}>
              <Slide i={slideIdx} big />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
              <div style={{fontFamily: latin, fontSize: 18, padding: '10px 16px', borderRadius: 18, background: sec >= T.downloadClick ? '#3550d4' : '#111', color: '#fff', textAlign: 'center'}}>⤓ Download PDF</div>
              {[0, 1, 2].map((j) => (
                <div key={j} style={{outline: (slideIdx + 1 + j) % 4 === (slideIdx + 1) % 4 ? '3px solid #4a6cf7' : 'none', borderRadius: 6}}>
                  <Slide i={slideIdx + 1 + j} />
                </div>
              ))}
            </div>
          </div>
          {sec >= T.downloadClick && (
            <div style={{position: 'absolute', right: 40, bottom: 40, background: '#222', color: '#fff', fontFamily, fontSize: 24, padding: '12px 22px', borderRadius: 14, opacity: dlP, direction: 'rtl'}}>
              ✓ تم تنزيل العرض
            </div>
          )}
        </AbsoluteFill>
      )}

      <Cursor sec={sec} />

      {/* رقم الخطوة */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 26,
          transform: `translateX(-50%) translateY(${(1 - stepP) * 20}px)`,
          opacity: stepP,
          background: '#4a6cf7',
          color: '#fff',
          fontFamily,
          fontWeight: 800,
          fontSize: 34,
          padding: '10px 30px',
          borderRadius: 40,
          direction: 'rtl',
          whiteSpace: 'nowrap',
          boxShadow: '0 6px 20px rgba(74,108,247,0.4)',
        }}
        key={stepIdx}
      >
        {step.label}
      </div>
    </AbsoluteFill>
  );
};
