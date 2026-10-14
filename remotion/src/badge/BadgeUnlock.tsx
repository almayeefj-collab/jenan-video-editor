import {AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily} from '../reel/font';
import {Badge3D} from './Badge3D';
import {BADGE, BadgeUnlockProps, GOLD, HEIGHT, T, WIDTH} from './config';
import {GoldBurst, GoldDust} from './Particles';
import {cursorAt, tiltAt} from './physics';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const smooth = Easing.bezier(0.22, 1, 0.36, 1); // تباطؤ ناعم بدون ارتداد

// المشهد: مسرح داكن دافئ، كشاف من فوق، أرضية لامعة، أشعة خلف الشارة
const Stage: React.FC<{frame: number; unlock: number}> = ({frame, unlock}) => {
  const build = interpolate(frame, [0, 34], [0, 1], {...clamp, easing: smooth});
  const rays = interpolate(frame, [T.unlock - 4, T.unlock + 26], [0, 1], {...clamp, easing: smooth});
  const {cx, cy} = BADGE;
  return (
    <>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 120% 80% at 50% 38%, #2A1C0A 0%, #150E06 45%, #070503 100%)'}} />
      {/* كشاف علوي */}
      <AbsoluteFill
        style={{
          opacity: build,
          background: `radial-gradient(ellipse 46% 40% at 50% ${(cy / HEIGHT) * 100}%, rgba(255,206,120,0.30) 0%, rgba(255,180,80,0.10) 45%, rgba(0,0,0,0) 75%)`,
        }}
      />
      {/* مخروط الضوء من فوق */}
      <div
        style={{
          position: 'absolute',
          left: cx - 520,
          top: -200,
          width: 1040,
          height: cy + 640,
          opacity: build * 0.55,
          background: 'linear-gradient(180deg, rgba(255,222,160,0.22) 0%, rgba(255,210,140,0.06) 60%, rgba(255,200,120,0) 100%)',
          clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)',
          filter: 'blur(30px)',
        }}
      />
      {/* أشعة دوارة خلف الشارة بعد الفتح */}
      <div
        style={{
          position: 'absolute',
          left: cx - 900,
          top: cy - 900,
          width: 1800,
          height: 1800,
          opacity: rays * 0.5,
          transform: `rotate(${frame * 0.18}deg) scale(${0.85 + 0.15 * rays})`,
          background:
            'repeating-conic-gradient(from 0deg, rgba(255,214,140,0.20) 0deg 3deg, rgba(255,214,140,0) 3deg 15deg)',
          WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 18%, rgba(0,0,0,0) 62%)',
          maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 18%, rgba(0,0,0,0) 62%)',
        }}
      />
      {/* هالة دافئة خلف الشارة */}
      <div
        style={{
          position: 'absolute',
          left: cx - 560,
          top: cy - 560,
          width: 1120,
          height: 1120,
          borderRadius: '50%',
          opacity: 0.25 * build + 0.55 * unlock,
          background: 'radial-gradient(circle, rgba(255,196,96,0.55) 0%, rgba(255,170,60,0.12) 40%, rgba(0,0,0,0) 70%)',
        }}
      />
      {/* أرضية: خط أفق لامع + انعكاس */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: cy + 430,
          height: 2,
          opacity: build * 0.7,
          background: 'linear-gradient(90deg, rgba(255,210,130,0) 0%, rgba(255,214,140,0.55) 50%, rgba(255,210,130,0) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: cy + 431,
          bottom: 0,
          opacity: build,
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,190,90,0.13) 0%, rgba(0,0,0,0) 70%)',
        }}
      />
      {/* تعتيم الأطراف */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.7) 100%)'}} />
    </>
  );
};

// مؤشر الماوس: سهم أبيض ناعم بظل
const Cursor: React.FC<{x: number; y: number; opacity: number}> = ({x, y, opacity}) => (
  <svg width={54} height={66} viewBox="0 0 18 22" style={{position: 'absolute', left: x - 4, top: y - 3, opacity, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.55))'}}>
    <path d="M1.5 1.5 L1.5 17.5 L5.6 13.6 L8.4 20 L11 18.9 L8.3 12.7 L14 12.5 Z" fill="#FFFFFF" stroke="#1A1208" strokeWidth={1.1} strokeLinejoin="round" />
  </svg>
);

export const BadgeUnlock: React.FC<BadgeUnlockProps> = ({title, subtitle, showCursor}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {cx, cy} = BADGE;

  // دخول الشارة: تطلع من العمق وهي تلف — نابض مخمّد بدون أي تجاوز
  const enter = spring({frame: frame - T.enter, fps, config: {damping: 200, stiffness: 70, mass: 1.1}, durationInFrames: T.enterDur});
  const spinY = (1 - enter) * -540;
  const spinX = (1 - enter) * 14;
  const lift = (1 - enter) * 260;

  // لحظة الفتح: نبضة واحدة ناعمة (مو ارتداد)
  const u = frame - T.unlock;
  const pulse = u >= 0 && u <= 16 ? Math.sin((u / 16) * Math.PI) * 0.045 : 0;
  const unlockGlow = interpolate(frame, [T.unlock - 2, T.unlock + 6, T.unlock + 60], [0, 1, 0.55], clamp);
  const flash = interpolate(frame, [T.unlock - 2, T.unlock + 2, T.unlock + 20], [0, 1, 0], clamp);

  // الميلان نحو المؤشر (محاكاة فيزيائية) + طفو خفيف جداً
  const tilt = tiltAt(frame);
  const float = Math.sin((frame / fps) * 1.6) * 6 * enter;

  const rx = spinX + tilt.rx;
  const ry = spinY + tilt.ry;
  const scale = (0.35 + 0.65 * enter) * (1 + pulse);
  const badgeOpacity = interpolate(frame, [T.enter, T.enter + 10], [0, 1], clamp);

  // اللمعة على الوجه
  const sweep1 = interpolate(frame, [T.unlock - 2, T.unlock + 22], [0, 1], clamp);
  const sweep2 = interpolate(frame, [T.sweep2, T.sweep2 + 26], [0, 1], clamp);
  const sweep = frame < T.sweep2 ? (sweep1 >= 1 ? -1 : sweep1) : sweep2;

  // موجة الصدمة
  const wave = interpolate(frame, [T.unlock, T.unlock + 30], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const wave2 = interpolate(frame, [T.unlock + 5, T.unlock + 40], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

  // المؤشر
  const c = cursorAt(frame);
  const cursorX = cx + c.x * 400;
  const cursorY = cy + c.y * 440;
  const cursorOpacity = interpolate(frame, [T.cursorIn - 6, T.cursorIn + 8, 226, 238], [0, 1, 1, 0], clamp);

  // ظل الشارة على الأرضية — يقصر ويغمق لما تنزل، ويتحرك مع الميلان
  const shadowW = 420 * (0.4 + 0.6 * enter) * (1 - Math.abs(tilt.ry) / 90);

  // النصوص
  const titleIn = interpolate(frame, [T.title, T.title + 22], [0, 1], {...clamp, easing: smooth});
  const subIn = interpolate(frame, [T.subtitle, T.subtitle + 20], [0, 1], {...clamp, easing: smooth});
  const lineIn = interpolate(frame, [T.title + 8, T.title + 34], [0, 1], {...clamp, easing: smooth});
  const titleShine = interpolate(frame, [T.title + 10, T.title + 50], [-30, 130], clamp);

  return (
    <AbsoluteFill style={{overflow: 'hidden', fontFamily}}>
      <Stage frame={frame} unlock={unlockGlow} />
      <GoldDust frame={frame} width={WIDTH} height={HEIGHT} intensity={interpolate(frame, [0, 40], [0.3, 1], clamp)} />

      {/* ظل الأرضية */}
      <div
        style={{
          position: 'absolute',
          left: cx - shadowW / 2 - tilt.ry * 2.2,
          top: cy + 400 + float * 0.3,
          width: shadowW,
          height: 46,
          borderRadius: '50%',
          opacity: badgeOpacity * 0.75,
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(6px)',
        }}
      />

      {/* وميض الفتح */}
      <div
        style={{
          position: 'absolute',
          left: cx - 700,
          top: cy - 700,
          width: 1400,
          height: 1400,
          borderRadius: '50%',
          opacity: flash,
          background: 'radial-gradient(circle, rgba(255,250,230,0.95) 0%, rgba(255,215,130,0.45) 25%, rgba(255,190,90,0) 60%)',
        }}
      />

      {/* موجات الصدمة */}
      {[wave, wave2].map((w, i) =>
        w > 0 && w < 1 ? (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: cx - BADGE.size / 2,
              top: cy - BADGE.size / 2,
              width: BADGE.size,
              height: BADGE.size,
              borderRadius: '50%',
              border: `${i === 0 ? 6 : 3}px solid ${GOLD.light}`,
              boxShadow: `0 0 40px rgba(255,200,100,0.8), inset 0 0 30px rgba(255,200,100,0.6)`,
              transform: `scale(${1 + w * (i === 0 ? 1.5 : 2.1)})`,
              opacity: (1 - w) * (i === 0 ? 0.9 : 0.6),
            }}
          />
        ) : null,
      )}

      {/* الشارة ثلاثية الأبعاد */}
      <div
        style={{
          position: 'absolute',
          left: cx + tilt.ry * 1.6,
          top: cy + lift + float - tilt.rx * 1.6,
          width: 0,
          height: 0,
          perspective: 1600,
          opacity: badgeOpacity,
        }}
      >
        <Badge3D rx={rx} ry={ry} scale={scale} sweep={sweep} glow={unlockGlow} />
      </div>

      {/* جزيئات الذهب */}
      <GoldBurst frame={frame} at={T.unlock} origin={{x: cx, y: cy}} />

      {/* العنوان */}
      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 60,
          top: cy + 500,
          direction: 'rtl',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 86,
            fontWeight: 900,
            lineHeight: 1.5,
            whiteSpace: 'nowrap',
            opacity: titleIn,
            transform: `translateY(${(1 - titleIn) * 40}px)`,
            filter: `blur(${(1 - titleIn) * 12}px)`,
            backgroundImage: `linear-gradient(105deg, ${GOLD.mid} 0%, ${GOLD.light} ${titleShine - 20}%, #FFFFFF ${titleShine}%, ${GOLD.light} ${titleShine + 20}%, ${GOLD.mid} 100%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            // مساحة تحت السطر عشان نقاط الياء ما تنقص من التدرج
            padding: '10px 0 34px',
            marginBottom: -34,
          }}
        >
          {title}
        </div>
        {/* خط فاصل ذهبي ينفتح من النص */}
        <div
          style={{
            margin: '18px auto 22px',
            width: 520 * lineIn,
            height: 3,
            borderRadius: 2,
            background: `linear-gradient(90deg, rgba(226,180,81,0) 0%, ${GOLD.light} 50%, rgba(226,180,81,0) 100%)`,
            boxShadow: '0 0 14px rgba(255,205,110,0.7)',
          }}
        />
        <div
          style={{
            fontSize: 46,
            fontWeight: 600,
            color: '#EBD9AE',
            opacity: subIn * 0.92,
            transform: `translateY(${(1 - subIn) * 24}px)`,
            filter: `blur(${(1 - subIn) * 8}px)`,
          }}
        >
          {subtitle}
        </div>
      </div>

      {showCursor && cursorOpacity > 0 ? <Cursor x={cursorX} y={cursorY} opacity={cursorOpacity} /> : null}

      {/* الصوت */}
      <Sequence from={0}>
        <Audio src={staticFile('sfx/cinematic-riser.wav')} volume={0.32} />
      </Sequence>
      <Sequence from={T.enter}>
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.45} />
      </Sequence>
      <Sequence from={T.unlock - 1}>
        <Audio src={staticFile('sfx/impact.wav')} volume={0.5} />
      </Sequence>
      <Sequence from={T.unlock}>
        <Audio src={staticFile('sfx/shimmer.wav')} volume={0.5} />
      </Sequence>
      <Sequence from={T.sweep2}>
        <Audio src={staticFile('sfx/shimmer.wav')} volume={0.18} />
      </Sequence>
    </AbsoluteFill>
  );
};
