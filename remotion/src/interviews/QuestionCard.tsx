import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Brand} from './config';

// السؤال يطلع بموشن وسط الشاشة فوق الفيديو، بعدين يصغر ويستقر كعنوان فوق
export const QuestionCard: React.FC<{
  question: string;
  index: number;
  brand: Brand;
  fontFamily: string;
}> = ({question, index, brand, fontFamily}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const holdEnd = Math.round(3.2 * fps); // مدة ظهور السؤال كبير

  const enter = spring({frame, fps, config: {damping: 200}, durationInFrames: 20});
  const dock = interpolate(frame, [holdEnd, holdEnd + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });
  const line = interpolate(frame, [8, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const words = question.split(' ');

  // من وسط الشاشة لأعلى اليمين
  const scale = interpolate(dock, [0, 1], [1, 0.5]);
  const y = interpolate(dock, [0, 1], [0, -390]);
  const x = interpolate(dock, [0, 1], [0, 440]);

  return (
    <AbsoluteFill style={{direction: 'rtl', fontFamily}}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${brand.primary}cc, ${brand.primary}99)`,
          opacity: (1 - dock) * enter,
        }}
      />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div
          style={{
            transform: `translate(${x}px, ${y}px) scale(${scale})`,
            background: dock > 0 ? `rgba(11,42,74,${0.85 * dock})` : 'transparent',
            backgroundColor: dock > 0 ? brand.primary + Math.round(0xd9 * dock).toString(16).padStart(2, '0') : 'transparent',
            borderRight: `${10 * dock}px solid ${brand.accent}`,
            padding: '30px 60px',
            borderRadius: 12,
            maxWidth: 1500,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              color: brand.accent,
              fontSize: 40,
              fontWeight: 700,
              opacity: enter,
              marginBottom: 10,
              letterSpacing: 2,
            }}
          >
            السؤال {index + 1}
          </div>
          <div style={{color: brand.text, fontSize: 84, fontWeight: 800, lineHeight: 1.35}}>
            {words.map((w, i) => {
              const s = spring({frame: frame - 6 - i * 3, fps, config: {damping: 200}, durationInFrames: 15});
              return (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    opacity: s,
                    transform: `translateY(${(1 - s) * 30}px)`,
                    marginLeft: 18,
                  }}
                >
                  {w}
                </span>
              );
            })}
          </div>
          <div
            style={{
              height: 6,
              background: brand.accent,
              margin: '24px auto 0',
              width: `${line * 40}%`,
              borderRadius: 3,
              opacity: 1 - dock,
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
