import {numberFamily} from '../reel/font';
import {GOLD} from './config';

// وجه الشارة: إطار مسنن، حلقات محفورة، أشعة، ونقش شبكة عصبية حول نجمة الذكاء الاصطناعي.
// النقش بارز: كل خط مرسوم مرتين — ظل غامق مزاح لتحت وإضاءة فاتحة مزاحة لفوق.

const C = 300;

const polar = (r: number, a: number) => [C + r * Math.cos(a), C + r * Math.sin(a)] as const;

const serratedRim = () => {
  const teeth = 96;
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const [x, y] = polar(i % 2 === 0 ? 300 : 291, a);
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(' ');
};

const star4 = (cx: number, cy: number, r: number, w: number) =>
  `M${cx},${cy - r} C${cx + w * 0.25},${cy - w * 0.25} ${cx + w * 0.25},${cy - w * 0.25} ${cx + r},${cy} ` +
  `C${cx + w * 0.25},${cy + w * 0.25} ${cx + w * 0.25},${cy + w * 0.25} ${cx},${cy + r} ` +
  `C${cx - w * 0.25},${cy + w * 0.25} ${cx - w * 0.25},${cy + w * 0.25} ${cx - r},${cy} ` +
  `C${cx - w * 0.25},${cy - w * 0.25} ${cx - w * 0.25},${cy - w * 0.25} ${cx},${cy - r} Z`;

// عقد الشبكة: حلقة سداسية حول النجمة، أذرع تطلع منها لعقد خارجية،
// ومسارات دوائر قصيرة بينها (شكل شريحة/شبكة عصبية بدون مثلثات متقاطعة)
const ang = (i: number, n: number, off = 0) => (i / n) * Math.PI * 2 - Math.PI / 2 + off;
const inner = Array.from({length: 6}, (_, i) => polar(100, ang(i, 6)));
const outer = Array.from({length: 6}, (_, i) => polar(166, ang(i, 6)));
const traceIn = Array.from({length: 6}, (_, i) => polar(128, ang(i, 6, Math.PI / 6)));
const traceOut = Array.from({length: 6}, (_, i) => polar(170, ang(i, 6, Math.PI / 6)));
const links: [readonly [number, number], readonly [number, number]][] = [];
for (let i = 0; i < 6; i++) {
  links.push([inner[i], inner[(i + 1) % 6]]);
  links.push([inner[i], outer[i]]);
  links.push([traceIn[i], traceOut[i]]);
}
const nodesSmall = [...outer, ...traceIn, ...traceOut];

const Engraved: React.FC<{d?: string; children?: never; lines?: typeof links; width: number}> = ({d, lines, width}) => {
  const draw = (stroke: string, dx: number, dy: number, w: number) =>
    d ? (
      <path d={d} fill="none" stroke={stroke} strokeWidth={w} transform={`translate(${dx} ${dy})`} strokeLinecap="round" />
    ) : (
      <g transform={`translate(${dx} ${dy})`}>
        {lines!.map(([a, b], i) => (
          <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={stroke} strokeWidth={w} strokeLinecap="round" />
        ))}
      </g>
    );
  return (
    <>
      {draw('rgba(70,40,5,0.75)', 1.6, 2.2, width + 1)}
      {draw('rgba(255,248,220,0.9)', -0.8, -1.1, width * 0.7)}
      {draw('url(#gEngrave)', 0, 0, width * 0.55)}
    </>
  );
};

const Node: React.FC<{p: readonly [number, number]; r: number}> = ({p, r}) => (
  <>
    <circle cx={p[0] + 1.6} cy={p[1] + 2.2} r={r + 1} fill="rgba(70,40,5,0.7)" />
    <circle cx={p[0]} cy={p[1]} r={r} fill="url(#gNode)" />
    <circle cx={p[0] - r * 0.3} cy={p[1] - r * 0.35} r={r * 0.35} fill="rgba(255,252,235,0.85)" />
  </>
);

export const Emblem: React.FC<{id: string}> = ({id}) => {
  // كل نسخة من الوجه (أمامي/خلفي) تحتاج معرّفات خاصة للتدرجات
  const u = (n: string) => `${n}-${id}`;
  const rays = Array.from({length: 72}, (_, i) => (i / 72) * Math.PI * 2);
  const dots = Array.from({length: 60}, (_, i) => (i / 60) * Math.PI * 2);
  return (
    <svg viewBox="0 0 600 600" width="100%" height="100%" style={{display: 'block'}}>
      <defs>
        <linearGradient id={u('gRim')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={GOLD.hi} />
          <stop offset="0.22" stopColor={GOLD.light} />
          <stop offset="0.5" stopColor={GOLD.deep} />
          <stop offset="0.72" stopColor={GOLD.light} />
          <stop offset="1" stopColor={GOLD.dark} />
        </linearGradient>
        <radialGradient id={u('gField')} cx="0.42" cy="0.36" r="0.75">
          <stop offset="0" stopColor="#FBE5A6" />
          <stop offset="0.45" stopColor="#E6B653" />
          <stop offset="0.85" stopColor="#B07A24" />
          <stop offset="1" stopColor="#7A4E12" />
        </radialGradient>
        <linearGradient id={u('gBand')} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#6B430E" />
          <stop offset="0.5" stopColor="#C8912F" />
          <stop offset="1" stopColor="#F2D284" />
        </linearGradient>
        <linearGradient id="gEngrave" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF2C4" />
          <stop offset="1" stopColor="#D49A35" />
        </linearGradient>
        <radialGradient id="gNode" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FFF8DE" />
          <stop offset="0.5" stopColor="#EBC060" />
          <stop offset="1" stopColor="#8E5F17" />
        </radialGradient>
        <radialGradient id={u('gStar')} cx="0.4" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.35" stopColor="#FCE9B0" />
          <stop offset="0.8" stopColor="#D9A23F" />
          <stop offset="1" stopColor="#9A6519" />
        </radialGradient>
        <path id={u('arcBottom')} d={`M ${C - 212} ${C} A 212 212 0 0 0 ${C + 212} ${C}`} />
        <path id={u('arcTop')} d={`M ${C - 212} ${C} A 212 212 0 0 1 ${C + 212} ${C}`} />
      </defs>

      {/* الإطار المسنن */}
      <polygon points={serratedRim()} fill={`url(#${u('gRim')})`} />
      <circle cx={C} cy={C} r={284} fill="none" stroke="rgba(80,48,8,0.6)" strokeWidth={3} />
      <circle cx={C} cy={C} r={278} fill={`url(#${u('gBand')})`} />
      <circle cx={C} cy={C} r={262} fill="none" stroke="rgba(255,244,205,0.85)" strokeWidth={2} />
      <circle cx={C} cy={C} r={258} fill={`url(#${u('gField')})`} />

      {/* أشعة شمسية خفيفة على الأرضية */}
      <g opacity={0.22}>
        {rays.map((a, i) => {
          const [x1, y1] = polar(70, a);
          const [x2, y2] = polar(250, a);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 2 ? '#7A4E12' : '#FFF4CF'} strokeWidth={i % 2 ? 1.4 : 1} />;
        })}
      </g>

      {/* حلقة الكتابة */}
      <circle cx={C} cy={C} r={240} fill="none" stroke="rgba(90,55,10,0.55)" strokeWidth={2.5} />
      <circle cx={C} cy={C} r={238.5} fill="none" stroke="rgba(255,246,214,0.7)" strokeWidth={1} />
      <circle cx={C} cy={C} r={186} fill="none" stroke="rgba(90,55,10,0.55)" strokeWidth={2.5} />
      <circle cx={C} cy={C} r={184.5} fill="none" stroke="rgba(255,246,214,0.7)" strokeWidth={1} />

      {[
        {arc: 'arcTop', text: 'ARTIFICIAL · INTELLIGENCE'},
        {arc: 'arcBottom', text: 'LATEST · NEWS'},
      ].map(({arc, text}) => (
        <g key={arc}>
          {[
            {fill: 'rgba(70,40,5,0.8)', dx: 1.5, dy: 2},
            {fill: 'rgba(255,248,222,0.9)', dx: -0.7, dy: -1},
            {fill: '#D9A541', dx: 0, dy: 0},
          ].map((l, i) => (
            <text
              key={i}
              transform={`translate(${l.dx} ${l.dy})`}
              fill={l.fill}
              fontFamily={numberFamily}
              fontWeight={800}
              fontSize={27}
              letterSpacing={5}
              textAnchor="middle"
              dominantBaseline="central"
            >
              <textPath href={`#${u(arc)}`} startOffset="50%">
                {text}
              </textPath>
            </text>
          ))}
        </g>
      ))}

      {/* نقاط على حلقة الكتابة بين الكلمتين */}
      {[Math.PI, 0].map((a, i) => {
        const [x, y] = polar(212, a);
        return <path key={i} d={star4(x, y, 11, 8)} fill={`url(#${u('gStar')})`} stroke="rgba(90,55,10,0.5)" strokeWidth={0.8} />;
      })}

      {/* حبات الحافة الداخلية */}
      {dots.map((a, i) => {
        const [x, y] = polar(250, a);
        return <circle key={i} cx={x} cy={y} r={2.2} fill={i % 2 ? 'rgba(255,245,210,0.9)' : 'rgba(110,70,15,0.7)'} />;
      })}

      {/* الشبكة العصبية */}
      <Engraved lines={links} width={4.2} />
      {nodesSmall.map((p, i) => (
        <Node key={`o${i}`} p={p} r={i < 6 ? 8 : 6} />
      ))}
      {inner.map((p, i) => (
        <Node key={`i${i}`} p={p} r={10} />
      ))}

      {/* نجمة الذكاء الاصطناعي في المنتصف */}
      <path d={star4(C + 3, C + 4, 74, 34)} fill="rgba(70,40,5,0.65)" />
      <path d={star4(C, C, 74, 34)} fill={`url(#${u('gStar')})`} stroke="rgba(120,75,15,0.6)" strokeWidth={1.4} />
      <path d={star4(C, C, 50, 22)} fill="none" stroke="rgba(255,255,245,0.7)" strokeWidth={1.4} />
      <path d={star4(C + 52, C - 52, 22, 12)} fill={`url(#${u('gStar')})`} stroke="rgba(120,75,15,0.6)" strokeWidth={1} />
      <path d={star4(C - 50, C + 54, 14, 8)} fill={`url(#${u('gStar')})`} stroke="rgba(120,75,15,0.6)" strokeWidth={1} />
    </svg>
  );
};
