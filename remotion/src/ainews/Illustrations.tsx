// رسومات متحركة بأسلوب 3D ناعم (SVG) لكل نوع خبر — تشتغل بدون إنترنت ولا مفاتيح API
import {createContext, useContext, useId} from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

// كل رسمة لها prefix خاص للـ ids عشان ما تتداخل التدرجات وقت الانتقال بين مشهدين
const Ids = createContext('a');
const useU = () => {
  const p = useContext(Ids);
  return (n: string) => `url(#${p}${n})`;
};

export type Art = 'chat' | 'assistant' | 'image' | 'video' | 'motion' | 'design' | 'robot' | 'voice' | 'code';

const W = 940;
const H = 620;

// طفو خفيف حسب الفريم
const useFloat = (phase: number, amp = 10, speed = 22) => {
  const f = useCurrentFrame();
  return Math.sin(f / speed + phase) * amp;
};

const usePop = (delay: number) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping: 12, mass: 0.7}});
};

const Defs: React.FC<{c: string; c2: string}> = ({c, c2}) => {
  const p = useContext(Ids);
  return (
  <defs>
    <linearGradient id={p + 'bg'} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#ffffff" />
      <stop offset="1" stopColor={`${c}30`} />
    </linearGradient>
    <linearGradient id={p + 'main'} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={c2} />
      <stop offset="1" stopColor={c} />
    </linearGradient>
    <linearGradient id={p + 'glass'} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#ffffff" />
      <stop offset="1" stopColor="#EEF2F8" />
    </linearGradient>
    <linearGradient id={p + 'dark'} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#2B3245" />
      <stop offset="1" stopColor="#151A27" />
    </linearGradient>
    <radialGradient id={p + 'glow'} cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor={c} stopOpacity="0.45" />
      <stop offset="1" stopColor={c} stopOpacity="0" />
    </radialGradient>
    <filter id={p + 'sh'} x="-30%" y="-30%" width="160%" height="170%">
      <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#1d2a4a" floodOpacity="0.18" />
    </filter>
  </defs>
  );
};

const Sparkles: React.FC<{c: string}> = ({c}) => {
  const frame = useCurrentFrame();
  const pts = [
    [90, 110, 0], [840, 90, 1.3], [800, 520, 2.1], [140, 500, 3.2], [470, 60, 4.1], [700, 300, 5],
  ];
  return (
    <>
      {pts.map(([x, y, p], i) => {
        const s = 0.6 + 0.4 * Math.sin(frame / 9 + p);
        return (
          <path
            key={i}
            d="M0,-14 C2,-2 2,-2 14,0 C2,2 2,2 0,14 C-2,2 -2,2 -14,0 C-2,-2 -2,-2 0,-14Z"
            fill={i % 2 ? c : '#FFC94D'}
            opacity={0.8}
            transform={`translate(${x},${y}) scale(${s}) rotate(${frame * 2 + i * 30})`}
          />
        );
      })}
    </>
  );
};

const Bubble: React.FC<{x: number; y: number; w: number; c: string; filled?: boolean; delay: number; phase: number; flip?: boolean}> = ({
  x, y, w, c, filled, delay, phase, flip,
}) => {
  const u = useU();
  const p = usePop(delay);
  const fy = useFloat(phase, 8);
  const frame = useCurrentFrame();
  const h = w * 0.55;
  return (
    <g transform={`translate(${x},${y + fy}) scale(${p})`} filter={u('sh')}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h * 0.35} fill={filled ? 'url(#main)' : 'url(#glass)'} />
      <path d={flip ? `M${w / 2 - 40},${h / 2 - 6} l26,30 l-6,-30z` : `M${-w / 2 + 40},${h / 2 - 6} l-26,30 l6,-30z`} fill={filled ? c : '#EEF2F8'} />
      {[-1, 0, 1].map((k) => (
        <circle
          key={k}
          cx={k * w * 0.18}
          cy={-3 * Math.max(0, Math.sin(frame / 5 - k))}
          r={w * 0.055}
          fill={filled ? '#fff' : c}
        />
      ))}
    </g>
  );
};

const Phone: React.FC<{x: number; y: number; c: string}> = ({x, y, c}) => {
  const u = useU();
  const fy = useFloat(0, 6, 30);
  return (
    <g transform={`translate(${x},${y + fy}) rotate(-8)`} filter={u('sh')}>
      <rect x={-120} y={-200} width={240} height={420} rx={42} fill={u('dark')} />
      <rect x={-106} y={-186} width={212} height={392} rx={32} fill={u('glass')} />
      <rect x={-40} y={-176} width={80} height={14} rx={7} fill="#151A27" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={i % 2 ? -10 : -86} y={-130 + i * 70} width={96} height={44} rx={18} fill={i % 2 ? c : '#DDE3EE'} opacity={0.9} />
      ))}
    </g>
  );
};

const ChatArt: React.FC<{c: string}> = ({c}) => (
  <>
    <Phone x={470} y={330} c={c} />
    <Bubble x={250} y={170} w={190} c={c} filled delay={6} phase={0} />
    <Bubble x={700} y={150} w={170} c={c} delay={12} phase={1.5} flip />
    <Bubble x={730} y={400} w={200} c={c} filled delay={18} phase={3} flip />
    <Bubble x={210} y={430} w={150} c={c} delay={24} phase={4.2} />
  </>
);

const AssistantArt: React.FC<{c: string}> = ({c}) => {
  const u = useU();
  const frame = useCurrentFrame();
  const p = usePop(4);
  const fy = useFloat(0, 10);
  return (
    <>
      {/* لابتوب */}
      <g filter={u('sh')}>
        <path d="M200,470 L740,470 L800,520 L140,520 Z" fill="#D6DCE8" />
        <rect x={240} y={250} width={460} height={225} rx={18} fill={u('dark')} />
        <rect x={256} y={266} width={428} height={193} rx={10} fill={u('glass')} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={280} y={290 + i * 38} width={interpolate(frame - i * 8, [10, 40], [0, [360, 300, 330, 220][i]], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} height={16} rx={8} fill={i === 0 ? c : '#CBD3E1'} />
        ))}
      </g>
      {/* الكرة المضيئة بشكل شمس */}
      <g transform={`translate(470,${150 + fy}) scale(${p})`}>
        <circle r={120} fill={u('glow')} />
        {Array.from({length: 12}).map((_, i) => (
          <rect key={i} x={-9} y={-92} width={18} height={44} rx={9} fill={c} transform={`rotate(${i * 30 + frame * 0.8})`} />
        ))}
        <circle r={46} fill={u('main')} filter={u('sh')} />
      </g>
    </>
  );
};

const ImageArt: React.FC<{c: string}> = ({c}) => {
  const u = useU();
  const frame = useCurrentFrame();
  const frames = [
    {x: 250, y: 330, r: -10, col: '#FFB4A2', d: 4},
    {x: 690, y: 320, r: 9, col: '#9AD8FF', d: 10},
    {x: 470, y: 380, r: 0, col: '#B9F3D0', d: 16},
  ];
  return (
    <>
      {frames.map((f, i) => {
        const p = usePop(f.d);
        const fy = useFloat(i * 2, 8);
        return (
          <g key={i} transform={`translate(${f.x},${f.y + fy}) rotate(${f.r}) scale(${p})`} filter={u('sh')}>
            <rect x={-130} y={-105} width={260} height={210} rx={22} fill="#fff" />
            <rect x={-112} y={-87} width={224} height={150} rx={12} fill={f.col} />
            <circle cx={60} cy={-50} r={18} fill="#FFE07A" />
            <path d="M-112,63 L-40,-10 L20,40 L60,10 L112,63Z" fill="#ffffff" opacity={0.75} />
          </g>
        );
      })}
      <g transform={`translate(470,150) rotate(${Math.sin(frame / 20) * 8}) scale(${usePop(22) * (1 + Math.sin(frame / 8) * 0.06)})`} filter={u('sh')}>
        <circle r={90} fill={u('glow')} />
        <path d="M0,-80 C10,-10 10,-10 80,0 C10,10 10,10 0,80 C-10,10 -10,10 -80,0 C-10,-10 -10,-10 0,-80Z" fill={u('main')} />
      </g>
    </>
  );
};

const VideoArt: React.FC<{c: string}> = ({c}) => {
  const u = useU();
  const frame = useCurrentFrame();
  const open = interpolate(Math.sin(frame / 7), [-1, 1], [-24, -4]);
  const fy = useFloat(0, 8);
  return (
    <>
      {/* شريط فيلم */}
      <g transform={`translate(0,${useFloat(2, 6)})`} filter={u('sh')}>
        <g transform="translate(470,470) rotate(-6)">
          <rect x={-420} y={-50} width={840} height={100} rx={10} fill={u('dark')} />
          {Array.from({length: 14}).map((_, i) => (
            <rect key={i} x={-410 + ((i * 60 + frame * 3) % 840)} y={-40} width={30} height={14} rx={3} fill="#fff" opacity={0.85} />
          ))}
          {Array.from({length: 5}).map((_, i) => (
            <rect key={i} x={-380 + ((i * 170 + frame * 3) % 840)} y={-18} width={120} height={46} rx={6} fill={[c, '#FFC94D', '#9AD8FF', '#B9F3D0', '#C7A6FF'][i]} />
          ))}
        </g>
      </g>
      {/* كلاكيت */}
      <g transform={`translate(470,${230 + fy}) scale(${usePop(6)})`} filter={u('sh')}>
        <rect x={-150} y={-40} width={300} height={190} rx={18} fill={u('main')} />
        <g transform={`translate(-150,-40) rotate(${open})`}>
          <rect x={0} y={-46} width={300} height={46} rx={10} fill={u('dark')} />
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={`M${20 + i * 60},-46 l30,0 l-24,46 l-30,0z`} fill="#fff" />
          ))}
        </g>
        <path d="M-24,30 L36,62 L-24,94Z" fill="#fff" />
      </g>
    </>
  );
};

const MotionArt: React.FC<{c: string}> = ({c}) => {
  const u = useU();
  const frame = useCurrentFrame();
  const bounce = Math.abs(Math.sin(frame / 10)) * 120;
  const play = interpolate(frame % 90, [0, 90], [0, 600]);
  return (
    <>
      <circle cx={260} cy={360 - bounce} r={58} fill={u('main')} filter={u('sh')} />
      <ellipse cx={260} cy={430} rx={60 - bounce / 6} ry={10} fill="#1d2a4a" opacity={0.12} />
      <g transform={`translate(520,${260 + useFloat(1, 10)}) rotate(${frame * 2})`} filter={u('sh')}>
        <rect x={-60} y={-60} width={120} height={120} rx={26} fill="#FFC94D" />
      </g>
      <g transform={`translate(740,${300 + useFloat(2, 12)}) rotate(${-frame * 1.5})`} filter={u('sh')}>
        <path d="M0,-70 L62,40 L-62,40Z" fill="#9AD8FF" />
      </g>
      {/* تايملاين */}
      <g transform="translate(170,500)" filter={u('sh')}>
        <rect x={0} y={0} width={600} height={70} rx={20} fill="#fff" />
        {[80, 200, 330, 470].map((x, i) => (
          <path key={i} d={`M${x},35 l14,-14 l14,14 l-14,14z`} fill={i % 2 ? '#FFC94D' : c} />
        ))}
        <rect x={play} y={-14} width={6} height={98} rx={3} fill="#E5484D" />
      </g>
    </>
  );
};

const DesignArt: React.FC<{c: string}> = ({c}) => {
  const u = useU();
  const frame = useCurrentFrame();
  const bars = [0.5, 0.8, 0.6, 1, 0.75];
  return (
    <>
      <g transform={`translate(300,${290 + useFloat(0, 8)}) rotate(-6) scale(${usePop(4)})`} filter={u('sh')}>
        <rect x={-180} y={-130} width={360} height={260} rx={22} fill="#fff" />
        <rect x={-150} y={-100} width={180} height={22} rx={11} fill={c} />
        <rect x={-150} y={-60} width={290} height={14} rx={7} fill="#DDE3EE" />
        <rect x={-150} y={-34} width={240} height={14} rx={7} fill="#DDE3EE" />
        <rect x={-150} y={0} width={300} height={100} rx={14} fill={`${c}33`} />
      </g>
      <g transform={`translate(650,${330 + useFloat(2, 10)}) rotate(5) scale(${usePop(12)})`} filter={u('sh')}>
        <rect x={-170} y={-150} width={340} height={300} rx={22} fill="#fff" />
        {bars.map((b, i) => {
          const h = 190 * b * interpolate(frame - 14 - i * 4, [0, 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return <rect key={i} x={-130 + i * 54} y={110 - h} width={36} height={h} rx={10} fill={i === 3 ? c : '#C9D3E6'} />;
        })}
      </g>
      <g transform={`translate(470,${120 + useFloat(3, 8)}) scale(${usePop(20)})`} filter={u('sh')}>
        <circle r={56} fill={u('main')} />
        <path d="M-20,18 L18,-20 L28,-10 L-10,28 L-26,26Z" fill="#fff" />
      </g>
    </>
  );
};

const RobotArt: React.FC<{c: string}> = ({c}) => {
  const u = useU();
  const frame = useCurrentFrame();
  const blink = frame % 70 < 4 ? 0.15 : 1;
  const fy = useFloat(0, 10);
  return (
    <>
      <circle cx={470} cy={320} r={230} fill={u('glow')} />
      <g transform={`translate(470,${320 + fy}) scale(${usePop(4)})`} filter={u('sh')}>
        <line x1={0} y1={-170} x2={0} y2={-120} stroke="#C9D3E6" strokeWidth={10} />
        <circle cy={-180} r={20} fill={c} opacity={0.6 + 0.4 * Math.sin(frame / 6)} />
        <rect x={-170} y={-125} width={340} height={260} rx={80} fill={u('glass')} />
        <rect x={-130} y={-80} width={260} height={150} rx={60} fill={u('dark')} />
        <ellipse cx={-55} cy={-5} rx={26} ry={30 * blink} fill={c} />
        <ellipse cx={55} cy={-5} rx={26} ry={30 * blink} fill={c} />
        <path d="M-30,40 Q0,60 30,40" stroke={c} strokeWidth={8} fill="none" strokeLinecap="round" />
        <rect x={-200} y={-30} width={36} height={80} rx={18} fill="#D6DCE8" />
        <rect x={164} y={-30} width={36} height={80} rx={18} fill="#D6DCE8" />
      </g>
      {[[150, 170, 0], [790, 200, 2], [800, 470, 4]].map(([x, y, p], i) => (
        <g key={i} transform={`translate(${x},${y + Math.sin(frame / 20 + p) * 10}) scale(${usePop(14 + i * 6)})`} filter={u('sh')}>
          <rect x={-70} y={-45} width={140} height={90} rx={18} fill="#fff" />
          <rect x={-50} y={-25} width={60} height={14} rx={7} fill={c} />
          <rect x={-50} y={2} width={100} height={10} rx={5} fill="#DDE3EE" />
          <rect x={-50} y={20} width={80} height={10} rx={5} fill="#DDE3EE" />
        </g>
      ))}
    </>
  );
};

const VoiceArt: React.FC<{c: string}> = ({c}) => {
  const u = useU();
  const frame = useCurrentFrame();
  return (
    <>
      <g transform={`translate(470,${270 + useFloat(0, 8)}) scale(${usePop(4)})`} filter={u('sh')}>
        <rect x={-60} y={-130} width={120} height={200} rx={60} fill={u('main')} />
        <path d="M-95,10 Q-95,120 0,120 Q95,120 95,10" stroke="#C9D3E6" strokeWidth={14} fill="none" />
        <rect x={-7} y={120} width={14} height={50} fill="#C9D3E6" />
        <rect x={-60} y={168} width={120} height={16} rx={8} fill="#C9D3E6" />
      </g>
      {Array.from({length: 18}).map((_, i) => {
        const side = i < 9 ? -1 : 1;
        const k = i % 9;
        const h = 20 + Math.abs(Math.sin(frame / 6 + k * 0.8)) * (110 - k * 8);
        return <rect key={i} x={470 + side * (130 + k * 34) - 9} y={300 - h / 2} width={18} height={h} rx={9} fill={k % 2 ? c : '#9AD8FF'} opacity={1 - k * 0.07} />;
      })}
    </>
  );
};

const CodeArt: React.FC<{c: string}> = ({c}) => {
  const u = useU();
  const frame = useCurrentFrame();
  const lines = [260, 180, 320, 220, 280, 150];
  return (
    <g transform={`translate(470,${320 + useFloat(0, 8)}) scale(${usePop(4)})`} filter={u('sh')}>
      <rect x={-330} y={-220} width={660} height={440} rx={28} fill={u('dark')} />
      {['#FF6B6B', '#FFC94D', '#3EE8B5'].map((col, i) => (
        <circle key={i} cx={-290 + i * 34} cy={-185} r={10} fill={col} />
      ))}
      {lines.map((w, i) => (
        <rect
          key={i}
          x={-280 + (i % 3) * 30}
          y={-130 + i * 52}
          width={interpolate(frame - i * 6, [6, 26], [0, w], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
          height={20}
          rx={10}
          fill={i % 2 ? '#9AD8FF' : c}
        />
      ))}
      <rect x={-280 + 30 + lines[5]} y={-130 + 5 * 52} width={14} height={24} fill="#fff" opacity={frame % 20 < 10 ? 1 : 0} />
    </g>
  );
};

const ARTS: Record<Art, React.FC<{c: string}>> = {
  chat: ChatArt, assistant: AssistantArt, image: ImageArt, video: VideoArt, motion: MotionArt,
  design: DesignArt, robot: RobotArt, voice: VoiceArt, code: CodeArt,
};

// بطاقة الرسمة: خلفية بيضاء ناعمة بزوايا دائرية
export const Illustration: React.FC<{art: Art; accent: string; accent2?: string; width?: number}> = ({art, accent, accent2, width = W}) => {
  const A = ARTS[art];
  const id = useId().replace(/[^a-zA-Z0-9]/g, '') + art;
  return (
    <Ids.Provider value={id}>
    <svg width={width} height={(width * H) / W} viewBox={`0 0 ${W} ${H}`} style={{display: 'block'}}>
      <Defs c={accent} c2={accent2 ?? `${accent}AA`} />
      <rect width={W} height={H} rx={48} fill={`url(#${id}bg)`} />
      <Sparkles c={accent} />
      <A c={accent} />
    </svg>
    </Ids.Provider>
  );
};
