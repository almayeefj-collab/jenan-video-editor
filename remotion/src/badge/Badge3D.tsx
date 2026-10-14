import {BADGE, GOLD} from './config';
import {Emblem} from './Emblem';

// الشارة كجسم صلب: وجه أمامي + وجه خلفي + طبقات للحافة تعطي سماكة حقيقية لما تلف.
// الإضاءة على الوجه تتحرك عكس الميلان (مصدر الضوء ثابت فوق يسار المشهد).

const LAYERS = 20;

type Props = {
  rx: number; // ميلان حول المحور الأفقي (درجات)
  ry: number; // ميلان/دوران حول المحور العمودي (درجات)
  scale: number;
  sweep: number; // تقدم اللمعة على الوجه 0..1 (خارج المدى = مخفية)
  glow: number; // توهج الحافة بعد الفتح
};

const Face: React.FC<{id: string; back?: boolean; light: {x: number; y: number}; sweep: number}> = ({id, back, light, sweep}) => {
  const {size, thickness} = BADGE;
  const sweepVisible = sweep > 0 && sweep < 1;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        overflow: 'hidden',
        backfaceVisibility: 'hidden',
        transform: back ? `translateZ(${-thickness}px) rotateY(180deg)` : 'translateZ(0px)',
      }}
    >
      <Emblem id={id} />
      {/* بقعة الضوء المنعكس — تتحرك مع زاوية الشارة */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at ${light.x}% ${light.y}%, rgba(255,252,238,0.62) 0%, rgba(255,240,200,0.22) 22%, rgba(255,230,170,0) 48%)`,
        }}
      />
      {/* ظل الجهة البعيدة عن الضوء */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at ${100 - light.x}% ${100 - light.y}%, rgba(40,20,0,0.38) 0%, rgba(40,20,0,0) 55%)`,
        }}
      />
      {sweepVisible ? (
        <div
          style={{
            position: 'absolute',
            top: -size * 0.25,
            left: -size * 0.6 + sweep * size * 2.2,
            width: size * 0.32,
            height: size * 1.5,
            transform: 'rotate(24deg)',
            background:
              'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,250,225,0.18) 30%, rgba(255,255,255,0.75) 50%, rgba(255,250,225,0.18) 70%, rgba(255,255,255,0) 100%)',
          }}
        />
      ) : null}
    </div>
  );
};

export const Badge3D: React.FC<Props> = ({rx, ry, scale, sweep, glow}) => {
  const {size, thickness} = BADGE;
  // اتجاه الوجه بالنسبة للضوء: لما الوجه يلتفت يمين، الانعكاس ينزاح يسار
  const rad = (d: number) => (d * Math.PI) / 180;
  const nx = Math.sin(rad(ry));
  const ny = -Math.sin(rad(rx));
  const light = {x: 34 - nx * 70, y: 28 - ny * 70};
  const backLight = {x: 34 + nx * 70, y: 28 - ny * 70};
  const step = thickness / (LAYERS + 1);

  return (
    <div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        left: -size / 2,
        top: -size / 2,
        transformStyle: 'preserve-3d',
        transform: `scale(${scale}) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${thickness / 2}px)`,
      }}
    >
      {/* الحافة: طبقات معدنية متراصة */}
      {Array.from({length: LAYERS}, (_, i) => {
        const z = -(i + 1) * step;
        const shade = 0.55 + 0.45 * Math.abs(Math.cos(rad(ry) + i * 0.15));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              transform: `translateZ(${z}px)`,
              background: `linear-gradient(${180 + ry * 0.6}deg, ${GOLD.light} 0%, ${GOLD.deep} 38%, ${GOLD.dark} 60%, ${GOLD.mid} 100%)`,
              filter: `brightness(${shade})`,
            }}
          />
        );
      })}
      <Face id="front" light={light} sweep={sweep} />
      <Face id="back" back light={backLight} sweep={-1} />
      {/* توهج ذهبي حول الحافة بعد الفتح */}
      {glow > 0 ? (
        <div
          style={{
            position: 'absolute',
            inset: -6,
            borderRadius: '50%',
            transform: 'translateZ(1px)',
            boxShadow: `0 0 ${40 + glow * 50}px ${glow * 14}px rgba(255,196,90,${0.45 * glow}), inset 0 0 ${18 * glow}px rgba(255,240,200,${0.5 * glow})`,
            pointerEvents: 'none',
          }}
        />
      ) : null}
    </div>
  );
};
