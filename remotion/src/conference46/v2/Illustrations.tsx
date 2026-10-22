// رسوم موشن متحركة لكل توصية — SVG مرسوم بالكود بألوان هوية الجمعية (بدون صور حقيقية)
// كل رسمة تاخذ f = فريم المشهد المحلي، وتبني نفسها قدام المشاهد
import {Easing, interpolate} from 'remotion';
import {C} from '../config';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const back = Easing.out(Easing.back(1.8));

// تقدّم من 0 إلى 1 بين فريمين
const p = (f: number, start: number, dur = 18, e = ease) => interpolate(f, [start, start + dur], [0, 1], {...clamp, easing: e});

const NAVY = '#123d7a';
const NAVY2 = '#0b2a62';
const STROKE = {fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round'} as const;

// خط يترسم
const Draw: React.FC<{d: string; f: number; start: number; dur?: number; color?: string; w?: number}> = ({d, f, start, dur = 22, color = C.cyan, w = 6}) => (
  <path d={d} pathLength={1} stroke={color} strokeWidth={w} strokeDasharray="1 1" strokeDashoffset={1 - p(f, start, dur)} {...STROKE} />
);

// مجموعة تنط (scale) من نقطة
const Pop: React.FC<{f: number; start: number; x: number; y: number; children: React.ReactNode; dur?: number}> = ({f, start, x, y, children, dur = 16}) => {
  const s = p(f, start, dur, back);
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`} opacity={Math.min(1, s * 2)}>
      {children}
    </g>
  );
};

// هالة متوهجة خلف الرسمة
const Glow: React.FC<{f: number; color?: string}> = ({f, color = C.cyan}) => {
  const k = 0.5 + 0.5 * Math.sin(f / 14);
  return (
    <>
      <circle cx={400} cy={320} r={250 + k * 10} fill={color} opacity={0.07 * p(f, 0, 20)} />
      <circle cx={400} cy={320} r={290} fill="none" stroke={color} strokeWidth={2} strokeDasharray="4 14" opacity={0.35 * p(f, 4, 20)} transform={`rotate(${f * 0.4} 400 320)`} />
    </>
  );
};

const Sparkle: React.FC<{x: number; y: number; f: number; start: number; s?: number}> = ({x, y, f, start, s = 1}) => {
  const k = p(f, start, 12, back) * (0.75 + 0.25 * Math.sin((f - start) / 6));
  return <path d="M0 -14 L3 -3 L14 0 L3 3 L0 14 L-3 3 L-14 0 L-3 -3Z" fill={C.gold} transform={`translate(${x} ${y}) scale(${k * s}) rotate(${f * 2})`} />;
};

const Person: React.FC<{x: number; y: number; s?: number; color?: string; hijab?: boolean}> = ({x, y, s = 1, color = C.cyan, hijab}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {hijab ? <path d="M-24 -40 Q0 -78 24 -40 L26 -14 Q0 -4 -26 -14Z" fill={color} /> : null}
    <circle cx={0} cy={-42} r={20} fill={hijab ? '#f3d9b8' : '#f3d9b8'} />
    {hijab ? <path d="M-22 -48 Q0 -76 22 -48 L22 -30 Q18 -58 0 -60 Q-18 -58 -22 -30Z" fill={color} /> : <path d="M-22 -50 Q0 -72 22 -50 L24 -36 L-24 -36Z" fill="#fff" />}
    <path d="M-36 34 Q-36 -14 0 -16 Q36 -14 36 34Z" fill={hijab ? color : '#fff'} />
  </g>
);

// ========== 1. إعداد المعلم بكليات التربية: مبنى كلية + قبعة تخرج + دوائر ذكاء ==========
const R1: React.FC<{f: number}> = ({f}) => {
  const cap = p(f, 40, 22, back);
  return (
    <>
      <Glow f={f} />
      <Pop f={f} start={6} x={400} y={520}>
        <path d="M200 520 L600 520 L600 545 L200 545Z" fill={NAVY2} stroke={C.cyan} strokeWidth={4} />
      </Pop>
      {[250, 330, 470, 550].map((x, i) => (
        <rect key={i} x={x - 16} y={520 - 180 * p(f, 10 + i * 4, 16)} width={32} height={180 * p(f, 10 + i * 4, 16)} fill={NAVY} stroke={C.cyan} strokeWidth={3} />
      ))}
      <Draw d="M190 340 L400 240 L610 340Z" f={f} start={26} color={C.gold} w={7} />
      <Draw d="M210 340 L590 340" f={f} start={30} color={C.cyan} w={6} />
      <g transform={`translate(400 ${interpolate(cap, [0, 1], [60, 190])}) rotate(${(1 - cap) * -30})`} opacity={cap}>
        <path d="M-90 0 L0 -40 L90 0 L0 40Z" fill={C.gold} />
        <path d="M-50 18 L-50 52 Q0 76 50 52 L50 18" fill={C.gold2} />
        <path d="M80 4 L80 60" stroke={C.gold} strokeWidth={5} />
        <circle cx={80} cy={64} r={8} fill={C.gold} />
      </g>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 + f / 40;
        const k = p(f, 60 + i * 5, 12, back);
        return (
          <g key={i} opacity={k}>
            <line x1={400} y1={330} x2={400 + Math.cos(a) * 250} y2={330 + Math.sin(a) * 170} stroke={C.cyan} strokeWidth={2} strokeDasharray="6 8" opacity={0.5} />
            <circle cx={400 + Math.cos(a) * 250} cy={330 + Math.sin(a) * 170} r={14 * k} fill={NAVY2} stroke={C.cyan} strokeWidth={4} />
          </g>
        );
      })}
      <Sparkle x={560} y={160} f={f} start={62} />
      <Sparkle x={240} y={200} f={f} start={70} s={0.7} />
    </>
  );
};

// ========== 2. إطار وطني للذكاء الاصطناعي: درع + قفل + دوائر + مسح ضوئي ==========
const R2: React.FC<{f: number}> = ({f}) => {
  const scan = ((f - 50) % 60) / 60;
  return (
    <>
      <Glow f={f} />
      <Draw d="M400 90 L590 160 L590 330 Q590 480 400 560 Q210 480 210 330 L210 160Z" f={f} start={6} w={10} color={C.cyan} />
      <path d="M400 90 L590 160 L590 330 Q590 480 400 560 Q210 480 210 330 L210 160Z" fill={NAVY} opacity={0.55 * p(f, 18, 20)} />
      <Pop f={f} start={30} x={400} y={340}>
        <rect x={330} y={310} width={140} height={120} rx={20} fill={C.gold} />
        <path d="M355 310 L355 270 Q355 220 400 220 Q445 220 445 270 L445 310" fill="none" stroke={C.gold} strokeWidth={18} />
        <circle cx={400} cy={360} r={16} fill={NAVY2} />
        <rect x={394} y={366} width={12} height={34} rx={4} fill={NAVY2} />
      </Pop>
      {[-1, 1].map((sd) =>
        [0, 1, 2].map((i) => (
          <g key={`${sd}${i}`}>
            <Draw d={`M${400 + sd * 200} ${220 + i * 90} L${400 + sd * 270} ${220 + i * 90} L${400 + sd * 300} ${190 + i * 90}`} f={f} start={44 + i * 6} w={4} />
            <circle cx={400 + sd * 300} cy={190 + i * 90} r={10 * p(f, 56 + i * 6, 10, back)} fill={C.cyan} />
          </g>
        )),
      )}
      {f > 50 ? <rect x={200} y={90 + scan * 470} width={400} height={6} fill={C.cyan} opacity={0.6 * (1 - Math.abs(scan - 0.5))} /> : null}
      <Sparkle x={600} y={110} f={f} start={70} />
    </>
  );
};

// ========== 3. قيادة الأثر: هدف + سهم يصيب + أعمدة بيانية ==========
const R3: React.FC<{f: number}> = ({f}) => {
  const arrow = p(f, 40, 16, Easing.in(Easing.quad));
  const hit = p(f, 56, 10, back);
  return (
    <>
      <Glow f={f} />
      {[190, 140, 90, 40].map((r, i) => (
        <circle key={i} cx={330} cy={320} r={r * p(f, 6 + i * 5, 18, back)} fill={i % 2 ? NAVY2 : NAVY} stroke={i === 3 ? C.gold : C.cyan} strokeWidth={5} />
      ))}
      <g transform={`translate(${interpolate(arrow, [0, 1], [760, 340])} ${interpolate(arrow, [0, 1], [60, 312])}) rotate(-31)`} opacity={arrow > 0 ? 1 : 0}>
        <line x1={0} y1={0} x2={170} y2={0} stroke={C.gold} strokeWidth={9} strokeLinecap="round" />
        <path d="M-6 0 L22 -16 L22 16Z" fill={C.gold} />
        <path d="M150 0 L185 -22 L175 0 L185 22Z" fill={C.cyan} />
      </g>
      <circle cx={330} cy={320} r={60 + hit * 120} fill="none" stroke={C.gold} strokeWidth={4} opacity={(1 - hit) * 0.9} />
      {[0, 1, 2, 3].map((i) => {
        const h = [70, 120, 170, 230][i] * p(f, 64 + i * 6, 16, back);
        return <rect key={i} x={560 + i * 46} y={540 - h} width={34} height={h} rx={6} fill={i === 3 ? C.gold : C.cyan} />;
      })}
      <Draw d="M560 470 L606 420 L652 370 L698 300 L744 240" f={f} start={80} color="#fff" w={5} />
      <Sparkle x={744} y={232} f={f} start={98} />
    </>
  );
};

// ========== 4. التقويم التكويني التشاركي: لوحة + صحّات تتأشر + أقران ==========
const R4: React.FC<{f: number}> = ({f}) => (
  <>
    <Glow f={f} />
    <Pop f={f} start={6} x={400} y={330}>
      <rect x={250} y={110} width={300} height={420} rx={28} fill={NAVY} stroke={C.cyan} strokeWidth={6} />
      <rect x={340} y={86} width={120} height={50} rx={14} fill={C.gold} />
    </Pop>
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <rect x={290} y={180 + i * 82} width={44} height={44} rx={10} fill="none" stroke={C.cyan} strokeWidth={4} opacity={p(f, 20 + i * 4, 10)} />
        <rect x={354} y={194 + i * 82} width={150 * p(f, 22 + i * 4, 14)} height={14} rx={7} fill="rgba(255,255,255,.55)" />
        <Draw d={`M298 ${202 + i * 82} L310 ${214 + i * 82} L330 ${188 + i * 82}`} f={f} start={44 + i * 12} dur={10} color={C.gold} w={7} />
      </g>
    ))}
    <Pop f={f} start={60} x={160} y={420}>
      <Person x={160} y={440} s={1.3} />
    </Pop>
    <Pop f={f} start={70} x={640} y={420}>
      <Person x={640} y={440} s={1.3} hijab />
    </Pop>
    <Draw d="M200 350 Q230 250 270 240" f={f} start={78} w={4} color={C.cyan} />
    <Draw d="M600 350 Q570 250 530 240" f={f} start={84} w={4} color={C.cyan} />
    <Sparkle x={560} y={110} f={f} start={92} />
  </>
);

// ========== 5. الدور القيمي والمحافظة على النعم: يدين + نبتة تكبر + قلب ==========
const R5: React.FC<{f: number}> = ({f}) => {
  const grow = p(f, 30, 40);
  const beat = 1 + 0.08 * Math.max(0, Math.sin(f / 5));
  return (
    <>
      <Glow f={f} color={C.gold} />
      <Pop f={f} start={6} x={400} y={480}>
        <path d="M180 470 Q240 560 400 560 Q560 560 620 470 L560 450 Q500 500 400 500 Q300 500 240 450Z" fill="#f3d9b8" />
        <path d="M240 450 Q300 500 400 500 Q500 500 560 450" fill="none" stroke={C.gold2} strokeWidth={4} />
      </Pop>
      <ellipse cx={400} cy={470} rx={110} ry={26} fill="#5b3b1e" opacity={p(f, 18, 12)} />
      <path d={`M400 470 L400 ${470 - 220 * grow}`} stroke="#4fc38a" strokeWidth={10} strokeLinecap="round" />
      {[0, 1, 2].map((i) => {
        const k = p(f, 46 + i * 10, 14, back);
        const y = 420 - i * 70;
        const sd = i % 2 ? 1 : -1;
        return <path key={i} d={`M400 ${y} Q${400 + sd * 90} ${y - 60} ${400 + sd * 120} ${y - 10} Q${400 + sd * 70} ${y + 20} 400 ${y}Z`} fill="#4fc38a" transform={`translate(400 ${y}) scale(${k}) translate(-400 ${-y})`} />;
      })}
      <g transform={`translate(400 190) scale(${p(f, 80, 14, back) * beat})`}>
        <path d="M0 30 C-60 -10 -40 -60 0 -30 C40 -60 60 -10 0 30Z" fill={C.gold} />
      </g>
      <Sparkle x={280} y={180} f={f} start={88} />
      <Sparkle x={530} y={150} f={f} start={94} s={0.8} />
    </>
  );
};

// ========== 6. الشراكات والمدرسة المستدامة: مدرسة + علم الكويت + ألواح شمسية + شجر ==========
const R6: React.FC<{f: number}> = ({f}) => (
  <>
    <Glow f={f} />
    <Pop f={f} start={6} x={400} y={540}>
      <rect x={210} y={300} width={380} height={240} rx={10} fill={NAVY} stroke={C.cyan} strokeWidth={5} />
    </Pop>
    <Draw d="M190 310 L400 190 L610 310" f={f} start={16} color={C.gold} w={8} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <rect key={i} x={240 + (i % 3) * 110} y={330 + Math.floor(i / 3) * 80} width={60} height={50} rx={6} fill={C.cyan} opacity={0.85 * p(f, 26 + i * 3, 8)} />
    ))}
    <rect x={370} y={470} width={60} height={70} rx={6} fill={C.gold} opacity={p(f, 40, 10)} />
    {/* علم الكويت */}
    <line x1={400} y1={190} x2={400} y2={190 - 110 * p(f, 44, 14)} stroke="#fff" strokeWidth={5} />
    <g opacity={p(f, 56, 10)} transform={`translate(402 ${84}) skewY(${Math.sin(f / 8) * 4})`}>
      <path d="M0 0 L22 12 L22 36 L0 48Z" fill="#000" />
      <rect x={22} y={0} width={70} height={16} fill="#007a3d" />
      <rect x={22} y={16} width={70} height={16} fill="#fff" />
      <rect x={22} y={32} width={70} height={16} fill="#ce1126" />
    </g>
    {/* ألواح شمسية */}
    {[0, 1].map((i) => (
      <g key={i} transform={`translate(${250 + i * 220} 240) skewX(-20)`} opacity={p(f, 62 + i * 6, 10)}>
        <rect x={0} y={0} width={80} height={34} fill="#1d64c4" stroke="#fff" strokeWidth={2} />
        <line x1={40} y1={0} x2={40} y2={34} stroke="#fff" strokeWidth={2} />
      </g>
    ))}
    {[120, 680].map((x, i) => (
      <g key={i}>
        <rect x={x - 8} y={540 - 90 * p(f, 70, 14)} width={16} height={90 * p(f, 70, 14)} fill="#7a5230" />
        <circle cx={x} cy={440} r={60 * p(f, 78 + i * 4, 14, back)} fill="#4fc38a" />
      </g>
    ))}
    <circle cx={660} cy={120} r={40 * p(f, 86, 14, back)} fill={C.gold} opacity={0.9} />
    <Sparkle x={150} y={150} f={f} start={96} />
  </>
);

// ========== 7. تحديث الاختبارات: ورقة تتحول لمخ + تروس ==========
const R7: React.FC<{f: number}> = ({f}) => {
  const morph = p(f, 46, 20);
  return (
    <>
      <Glow f={f} />
      <g opacity={1 - morph} transform={`translate(400 330) scale(${1 - morph * 0.4}) translate(-400 -330)`}>
        <Pop f={f} start={6} x={400} y={330}>
          <rect x={290} y={130} width={220} height={300} rx={18} fill="#fff" />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={320} y={170 + i * 46} width={160 * p(f, 14 + i * 4, 12)} height={14} rx={7} fill="#9fb7d9" />
          ))}
        </Pop>
      </g>
      <g opacity={morph} transform={`translate(400 320) scale(${0.6 + morph * 0.4}) translate(-400 -320)`}>
        <path d="M400 170 C330 140 260 190 270 250 C220 280 230 360 290 380 C300 450 380 460 400 420 C420 460 500 450 510 380 C570 360 580 280 530 250 C540 190 470 140 400 170Z" fill={NAVY} stroke={C.cyan} strokeWidth={8} />
        <path d="M400 170 L400 420 M330 240 Q370 260 400 240 M470 300 Q430 320 400 300 M320 330 Q360 350 400 330" stroke={C.cyan} strokeWidth={6} fill="none" strokeLinecap="round" />
      </g>
      {[
        {x: 180, y: 200, r: 50, s: 1},
        {x: 620, y: 460, r: 64, s: -0.8},
      ].map((g, i) => (
        <g key={i} transform={`translate(${g.x} ${g.y}) rotate(${f * 2 * g.s}) scale(${p(f, 60 + i * 6, 14, back)})`}>
          {new Array(8).fill(0).map((_, k) => (
            <rect key={k} x={-10} y={-g.r - 14} width={20} height={26} rx={4} fill={C.gold} transform={`rotate(${k * 45})`} />
          ))}
          <circle r={g.r} fill={C.gold} />
          <circle r={g.r * 0.4} fill={NAVY2} />
        </g>
      ))}
      <Sparkle x={560} y={160} f={f} start={70} />
      <Sparkle x={250} y={470} f={f} start={78} s={0.7} />
    </>
  );
};

// ========== 8. صناعة المحتوى: شاشة + زر تشغيل + مكعب ثلاثي الأبعاد + نظارة VR ==========
const R8: React.FC<{f: number}> = ({f}) => {
  const rot = f * 2.2;
  const c = Math.cos((rot * Math.PI) / 180);
  return (
    <>
      <Glow f={f} />
      <Pop f={f} start={6} x={400} y={360}>
        <rect x={180} y={170} width={440} height={280} rx={22} fill={NAVY} stroke={C.cyan} strokeWidth={6} />
        <rect x={360} y={450} width={80} height={50} fill={C.cyan} />
        <rect x={300} y={500} width={200} height={16} rx={8} fill={C.cyan} />
      </Pop>
      <Pop f={f} start={24} x={400} y={310}>
        <circle cx={400} cy={310} r={64} fill={C.gold} />
        <path d="M380 276 L438 310 L380 344Z" fill={NAVY2} />
      </Pop>
      <circle cx={400} cy={310} r={64 + ((f - 30) % 30) * 3} fill="none" stroke={C.gold} strokeWidth={3} opacity={f > 30 ? 1 - ((f - 30) % 30) / 30 : 0} />
      {/* مكعب يدور */}
      <g transform={`translate(640 160) scale(${p(f, 44, 14, back)})`}>
        <path d={`M${-50 * c} -30 L0 -60 L${50 * c} -30 L0 0Z`} fill={C.cyan} />
        <path d={`M${-50 * c} -30 L0 0 L0 60 L${-50 * c} 30Z`} fill="#3aa6c8" />
        <path d={`M${50 * c} -30 L0 0 L0 60 L${50 * c} 30Z`} fill="#246f94" />
      </g>
      {/* نظارة VR */}
      <g transform={`translate(170 500) scale(${p(f, 54, 14, back)}) rotate(${Math.sin(f / 10) * 6})`}>
        <rect x={-80} y={-36} width={160} height={72} rx={30} fill="#fff" />
        <rect x={-64} y={-22} width={56} height={44} rx={16} fill={NAVY2} />
        <rect x={8} y={-22} width={56} height={44} rx={16} fill={NAVY2} />
        <path d="M-80 -6 L-110 -6 M80 -6 L110 -6" stroke="#fff" strokeWidth={8} strokeLinecap="round" />
      </g>
      <Sparkle x={620} y={500} f={f} start={70} />
    </>
  );
};

// ========== 9. مدارس الموهبة: كأس + نجوم تدور + صاروخ ==========
const R9: React.FC<{f: number}> = ({f}) => {
  const rk = p(f, 50, 40, Easing.in(Easing.quad));
  return (
    <>
      <Glow f={f} color={C.gold} />
      <Pop f={f} start={8} x={400} y={520}>
        <path d="M300 150 L500 150 L490 290 Q480 360 400 370 Q320 360 310 290Z" fill={C.gold} />
        <path d="M300 180 Q230 180 240 250 Q250 300 310 300 M500 180 Q570 180 560 250 Q550 300 490 300" fill="none" stroke={C.gold} strokeWidth={14} />
        <rect x={380} y={370} width={40} height={70} fill={C.gold2} />
        <rect x={320} y={440} width={160} height={40} rx={10} fill={C.gold2} />
        <path d="M400 200 L414 232 L448 236 L422 258 L430 292 L400 274 L370 292 L378 258 L352 236 L386 232Z" fill="#fff" opacity={p(f, 30, 10)} />
      </Pop>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2 + f / 30;
        return <Sparkle key={i} x={400 + Math.cos(a) * 260} y={300 + Math.sin(a) * 180} f={f} start={36 + i * 5} s={0.9} />;
      })}
      <g transform={`translate(${interpolate(rk, [0, 1], [150, 640])} ${interpolate(rk, [0, 1], [560, 80])}) rotate(40)`} opacity={rk > 0 && rk < 1 ? 1 : 0}>
        <path d="M0 -50 Q24 -20 20 30 L-20 30 Q-24 -20 0 -50Z" fill="#fff" />
        <circle cx={0} cy={-8} r={8} fill={C.cyan} />
        <path d="M-12 30 L0 70 L12 30Z" fill={C.gold2} />
      </g>
    </>
  );
};

// ========== 10. القيادة الاحتوائية والأمان النفسي: مظلة تنفتح فوق مجموعة + قلوب ==========
const R10: React.FC<{f: number}> = ({f}) => {
  const open = p(f, 30, 22, back);
  return (
    <>
      <Glow f={f} />
      <g transform={`translate(400 250) scale(${open} ${0.3 + open * 0.7})`}>
        <path d="M-260 0 Q-260 -170 0 -180 Q260 -170 260 0 Q217 -30 173 0 Q130 -30 87 0 Q43 -30 0 0 Q-43 -30 -87 0 Q-130 -30 -173 0 Q-217 -30 -260 0Z" fill={C.cyan} stroke="#fff" strokeWidth={4} />
        <path d="M0 -180 Q-60 -90 -87 0 M0 -180 Q60 -90 87 0 M0 -180 L0 0" stroke="#fff" strokeWidth={3} fill="none" opacity={0.7} />
      </g>
      <Draw d="M400 250 L400 470 Q400 500 430 500" f={f} start={22} color="#fff" w={8} />
      {[
        {x: 280, h: false},
        {x: 400, h: true},
        {x: 520, h: false},
      ].map((m, i) => (
        <Pop key={i} f={f} start={50 + i * 6} x={m.x} y={520}>
          <Person x={m.x} y={500} s={1.35} hijab={m.h} color={i === 1 ? C.gold : C.cyan} />
        </Pop>
      ))}
      {[0, 1, 2].map((i) => {
        const t = ((f - 70 - i * 10) % 50) / 50;
        return f > 70 + i * 10 ? (
          <path key={i} d="M0 12 C-24 -4 -16 -24 0 -12 C16 -24 24 -4 0 12Z" fill={C.gold} transform={`translate(${300 + i * 100} ${380 - t * 120}) scale(${1.4})`} opacity={1 - t} />
        ) : null;
      })}
    </>
  );
};

// ========== 11. التوجيه الفني: لوحة تحكم + خط بياني + عدّاد ==========
const R11: React.FC<{f: number}> = ({f}) => {
  const needle = interpolate(p(f, 50, 30), [0, 1], [-90, 50]);
  return (
    <>
      <Glow f={f} />
      <Pop f={f} start={6} x={400} y={320}>
        <rect x={150} y={110} width={500} height={400} rx={28} fill={NAVY} stroke={C.cyan} strokeWidth={6} />
        <rect x={150} y={110} width={500} height={56} rx={28} fill={NAVY2} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={190 + i * 30} cy={138} r={9} fill={[C.gold, C.cyan, '#fff'][i]} />
        ))}
      </Pop>
      <rect x={180} y={190} width={200} height={140} rx={16} fill={NAVY2} opacity={p(f, 18, 10)} />
      <Draw d="M195 300 L235 270 L270 285 L310 230 L360 210" f={f} start={26} w={5} color={C.cyan} />
      <rect x={400} y={190} width={220} height={140} rx={16} fill={NAVY2} opacity={p(f, 22, 10)} />
      <Draw d="M440 300 A70 70 0 0 1 580 300" f={f} start={34} w={14} color={C.gold} />
      <line x1={510} y1={300} x2={510 + Math.cos(((needle - 90) * Math.PI) / 180) * 60} y2={300 + Math.sin(((needle - 90) * Math.PI) / 180) * 60} stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={p(f, 44, 6)} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const h = [60, 90, 50, 120, 80, 130][i] * p(f, 54 + i * 4, 14, back);
        return <rect key={i} x={190 + i * 72} y={480 - h} width={48} height={h} rx={8} fill={i % 2 ? C.gold : C.cyan} />;
      })}
      <Sparkle x={640} y={110} f={f} start={84} />
    </>
  );
};

// ========== 12. الابتكارات الصفية (نابغ): مصباح يشتعل + أشعة + وسام ==========
const R12: React.FC<{f: number}> = ({f}) => {
  const on = p(f, 34, 8);
  const flick = on * (0.85 + 0.15 * Math.sin(f / 3));
  return (
    <>
      <Glow f={f} color={C.gold} />
      {new Array(12).fill(0).map((_, i) => {
        const a = (i / 12) * 360;
        const k = p(f, 40 + i * 2, 10);
        return <rect key={i} x={-6} y={-250} width={12} height={60 * k} rx={6} fill={C.gold} opacity={flick} transform={`translate(400 290) rotate(${a + f * 0.3})`} />;
      })}
      <circle cx={400} cy={270} r={150} fill={C.gold} opacity={0.25 * flick} />
      <Draw d="M330 380 Q260 320 270 240 Q290 140 400 130 Q510 140 530 240 Q540 320 470 380 L470 420 L330 420Z" f={f} start={6} color="#fff" w={9} />
      <path d="M330 380 Q260 320 270 240 Q290 140 400 130 Q510 140 530 240 Q540 320 470 380 L470 420 L330 420Z" fill={C.gold} opacity={flick} />
      <rect x={340} y={430} width={120} height={20} rx={10} fill="#fff" opacity={p(f, 24, 8)} />
      <rect x={350} y={460} width={100} height={20} rx={10} fill="#fff" opacity={p(f, 28, 8)} />
      <Draw d="M370 380 L370 300 Q400 260 430 300 L430 380" f={f} start={36} color={NAVY2} w={6} />
      <Pop f={f} start={70} x={640} y={460}>
        <path d="M610 480 L590 560 L620 545 L640 570 L650 490Z M670 480 L690 560 L660 545 L640 570 L630 490Z" fill={C.cyan} />
        <circle cx={640} cy={460} r={44} fill={C.gold} stroke="#fff" strokeWidth={5} />
        <path d="M640 438 L647 454 L664 456 L651 467 L655 484 L640 475 L625 484 L629 467 L616 456 L633 454Z" fill="#fff" />
      </Pop>
    </>
  );
};

// ========== 13. المعايير الدولية: كرة أرضية تدور + مدار + وسام ==========
const R13: React.FC<{f: number}> = ({f}) => {
  const sc = p(f, 6, 20, back);
  return (
    <>
      <Glow f={f} />
      <g transform={`translate(400 320) scale(${sc})`}>
        <circle r={200} fill={NAVY} stroke={C.cyan} strokeWidth={6} />
        {[0, 1, 2, 3].map((i) => {
          const ph = ((f * 1.5 + i * 45) % 180) - 90;
          const rx = Math.abs(Math.cos((ph * Math.PI) / 180)) * 200;
          return <ellipse key={i} rx={rx} ry={200} fill="none" stroke={C.cyan} strokeWidth={3} opacity={0.6} />;
        })}
        {[-120, -60, 0, 60, 120].map((y, i) => (
          <ellipse key={i} cy={y} rx={Math.sqrt(200 * 200 - y * y)} ry={14} fill="none" stroke={C.cyan} strokeWidth={3} opacity={0.6} />
        ))}
      </g>
      <g transform={`translate(400 320) rotate(-20)`} opacity={p(f, 30, 14)}>
        <ellipse rx={300} ry={70} fill="none" stroke={C.gold} strokeWidth={5} />
        <circle cx={300 * Math.cos(f / 15)} cy={70 * Math.sin(f / 15)} r={18} fill={C.gold} />
      </g>
      <Pop f={f} start={60} x={620} y={520}>
        <circle cx={620} cy={520} r={50} fill={C.gold} stroke="#fff" strokeWidth={6} />
        <path d="M600 520 L615 536 L644 504" stroke={NAVY2} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Pop>
      <Sparkle x={170} y={130} f={f} start={70} />
    </>
  );
};

// ========== 14. المشكلات التحصيلية: قطع بزل تتجمع + بوصلة ==========
const PIECE = 'M0 0 L60 0 Q60 -26 80 -26 Q100 -26 100 0 L160 0 L160 60 Q186 60 186 80 Q186 100 160 100 L160 160 L0 160Z';
const R14: React.FC<{f: number}> = ({f}) => {
  const pieces = [
    {x: 240, y: 160, fx: -200, fy: -120, c: C.cyan, r: 0},
    {x: 400, y: 160, fx: 260, fy: -140, c: C.gold, r: 90},
    {x: 240, y: 320, fx: -240, fy: 200, c: C.gold, r: 270},
    {x: 400, y: 320, fx: 240, fy: 220, c: C.cyan, r: 180},
  ];
  return (
    <>
      <Glow f={f} />
      {pieces.map((pc, i) => {
        const k = p(f, 10 + i * 10, 22, back);
        return (
          <g key={i} transform={`translate(${pc.x + 80 + pc.fx * (1 - k)} ${pc.y + 80 + pc.fy * (1 - k)}) rotate(${pc.r + (1 - k) * 90}) translate(-80 -80)`} opacity={Math.min(1, k * 2)}>
            <path d={PIECE} fill={pc.c} stroke={NAVY2} strokeWidth={6} />
          </g>
        );
      })}
      <circle cx={400} cy={320} r={170 + p(f, 56, 12) * 30} fill="none" stroke="#fff" strokeWidth={4} opacity={(1 - p(f, 62, 12)) * p(f, 56, 4)} />
      <Pop f={f} start={64} x={640} y={500}>
        <circle cx={640} cy={500} r={60} fill={NAVY2} stroke={C.cyan} strokeWidth={6} />
        <g transform={`translate(640 500) rotate(${Math.sin(f / 8) * 30 + 20})`}>
          <path d="M0 -44 L12 0 L0 44 L-12 0Z" fill={C.gold} />
          <path d="M0 0 L12 0 L0 44 L-12 0Z" fill="#fff" />
        </g>
      </Pop>
      <Sparkle x={180} y={520} f={f} start={74} />
    </>
  );
};

// ========== 15. حلقات عمل لقيادات الوزارة: مبنى الوزارة + خارطة طريق تتوصل ==========
const R15: React.FC<{f: number}> = ({f}) => {
  const nodes = [
    {x: 180, y: 140},
    {x: 340, y: 230},
    {x: 500, y: 150},
    {x: 640, y: 250},
  ];
  return (
    <>
      <Glow f={f} />
      <Draw d="M180 140 C260 140 260 230 340 230 C420 230 420 150 500 150 C580 150 560 250 640 250" f={f} start={8} w={6} color={C.cyan} />
      {nodes.map((n, i) => (
        <Pop key={i} f={f} start={14 + i * 8} x={n.x} y={n.y}>
          <circle cx={n.x} cy={n.y} r={32} fill={i === 3 ? C.gold : NAVY2} stroke={i === 3 ? '#fff' : C.cyan} strokeWidth={5} />
          <text x={n.x} y={n.y + 11} textAnchor="middle" fontFamily="Playfair Display" fontWeight={900} fontSize={30} fill={i === 3 ? NAVY2 : '#fff'}>
            {i + 1}
          </text>
        </Pop>
      ))}
      {/* مبنى بأعمدة */}
      <Pop f={f} start={44} x={400} y={560}>
        <path d="M200 400 L400 320 L600 400Z" fill={C.gold} />
        <rect x={210} y={400} width={380} height={20} fill={C.gold2} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={236 + i * 72} y={430} width={34} height={100} fill="#fff" />
        ))}
        <rect x={200} y={530} width={400} height={26} rx={4} fill={C.gold2} />
      </Pop>
      <Draw d="M372 380 L392 398 L428 362" f={f} start={70} dur={12} color={NAVY2} w={8} />
      <Sparkle x={660} y={170} f={f} start={80} />
    </>
  );
};

export const ILLUSTRATIONS = [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15];
