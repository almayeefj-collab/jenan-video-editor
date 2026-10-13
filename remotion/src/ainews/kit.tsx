// عناصر مشتركة لريلز جنان بالستايل الفاتح: الخلفية، يوزر الانستغرام، الخاتمة
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily} from '../reel/font';
import {FPS, INK, INSTAGRAM, PAPER, TRANSITION} from './config';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = Easing.bezier(0.65, 0, 0.35, 1);
export const latin = '"Helvetica Neue", Arial, sans-serif';

export const useReveal = (delay: number, dur = 14) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, dur], [0, 1], {...clamp, easing: ease});
  return {opacity: p, filter: `blur(${(1 - p) * 10}px)`, transform: `translateY(${(1 - p) * 36}px)`};
};

export const useExit = (frames: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [frames - TRANSITION - 8, frames - TRANSITION + 4], [1, 0], clamp);
};

// خلفية فاتحة: ورقي + بقع باستيل تتحرك + نقاط شبكة خفيفة + أشكال تطفو
export const LightBg: React.FC<{accent: string; glow: string}> = ({accent, glow}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{background: PAPER, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute', width: 1100, height: 1100, borderRadius: '50%', filter: 'blur(120px)', background: glow,
          left: -350 + Math.sin(t * 0.6) * 120, top: -300 + Math.cos(t * 0.5) * 100,
        }}
      />
      <div
        style={{
          position: 'absolute', width: 900, height: 900, borderRadius: '50%', filter: 'blur(130px)', background: glow, opacity: 0.8,
          right: -350 + Math.cos(t * 0.7) * 120, bottom: -250 + Math.sin(t * 0.4) * 140,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${accent}33 3px, transparent 3px)`,
          backgroundSize: '60px 60px',
          backgroundPosition: `0 ${(frame * 0.8) % 60}px`,
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)',
        }}
      />
      {[
        [90, 1500, 70, 0],
        [940, 1380, 50, 2],
        [960, 120, 40, 4],
      ].map(([x, y, s, p], i) => (
        <div
          key={i}
          style={{
            position: 'absolute', left: x, top: y + Math.sin(t + p) * 20, width: s, height: s,
            borderRadius: i === 1 ? 12 : '50%', border: `6px solid ${accent}55`, transform: `rotate(${frame + i * 40}deg)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

export const InstagramIcon: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <defs>
      <radialGradient id="ig" cx="0.3" cy="1.07" r="1.3">
        <stop offset="0" stopColor="#FDD47A" />
        <stop offset="0.25" stopColor="#FA8D3E" />
        <stop offset="0.5" stopColor="#E1306C" />
        <stop offset="0.75" stopColor="#C13584" />
        <stop offset="1" stopColor="#5B51D8" />
      </radialGradient>
    </defs>
    <rect width={100} height={100} rx={26} fill="url(#ig)" />
    <rect x={22} y={22} width={56} height={56} rx={17} fill="none" stroke="#fff" strokeWidth={7} />
    <circle cx={50} cy={50} r={13} fill="none" stroke="#fff" strokeWidth={7} />
    <circle cx={67} cy={33} r={4.5} fill="#fff" />
  </svg>
);

// يوزر الانستغرام ثابت أسفل كل مشهد
export const HandleTag: React.FC = () => {
  const reveal = useReveal(10);
  return (
    <div style={{position: 'absolute', bottom: 70, left: 0, right: 0, display: 'flex', justifyContent: 'center', ...reveal}}>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '10px 26px 10px 14px', borderRadius: 999,
          background: 'rgba(255,255,255,0.85)', boxShadow: '0 8px 30px rgba(20,26,46,0.12)', direction: 'ltr',
        }}
      >
        <InstagramIcon size={44} />
        <span style={{fontFamily: latin, fontSize: 34, fontWeight: 700, color: INK}}>{INSTAGRAM}</span>
      </div>
    </div>
  );
};

// الخاتمة: تابعني على الانستغرام
export const InstaOutro: React.FC<{frames: number; line1: string; line2: string; accent: string; glow: string}> = ({frames, line1, line2, accent, glow}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const icon = spring({frame: frame - 4, fps, config: {damping: 10}});
  const pill = spring({frame: frame - 20, fps, config: {damping: 12}});
  const fadeOut = interpolate(frame, [frames - 18, frames], [0, 1], clamp);
  const pulse = 1 + Math.sin(frame / 6) * 0.03;
  return (
    <AbsoluteFill>
      <LightBg accent={accent} glow={glow} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', direction: 'rtl', textAlign: 'center'}}>
        <div style={{fontFamily, fontSize: 56, fontWeight: 700, color: INK, ...useReveal(30)}}>{line1}</div>
        <div style={{fontFamily, fontSize: 46, fontWeight: 600, color: accent, marginTop: 6, marginBottom: 60, ...useReveal(38)}}>{line2}</div>
        <div style={{transform: `scale(${icon * pulse}) rotate(${(1 - icon) * -20}deg)`, filter: 'drop-shadow(0 20px 40px rgba(225,48,108,0.35))'}}>
          <InstagramIcon size={230} />
        </div>
        <div style={{fontFamily, fontSize: 100, fontWeight: 900, color: INK, marginTop: 40, lineHeight: 1.2, ...useReveal(12, 16)}}>تابعني</div>
        <div
          style={{
            marginTop: 26, padding: '18px 46px', borderRadius: 999, direction: 'ltr',
            background: 'linear-gradient(90deg, #FA8D3E, #E1306C, #C13584, #5B51D8)',
            fontFamily: latin, fontSize: 58, fontWeight: 800, color: '#fff',
            opacity: pill, transform: `scale(${interpolate(pill, [0, 1], [0.6, 1])})`, boxShadow: '0 16px 40px rgba(193,53,132,0.35)',
          }}
        >
          {INSTAGRAM}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'white', opacity: fadeOut}} />
      <Sequence from={4} durationInFrames={FPS * 3}>
        <Audio src={staticFile('sfx/shimmer.wav')} volume={0.4} />
      </Sequence>
      <Sequence from={20} durationInFrames={FPS}>
        <Audio src={staticFile('sfx/pop.wav')} volume={0.35} />
      </Sequence>
    </AbsoluteFill>
  );
};
