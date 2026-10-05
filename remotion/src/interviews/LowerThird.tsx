import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Brand} from './config';

// اسم المعلم ووظيفته أسفل يمين الشاشة
export const LowerThird: React.FC<{
  name: string;
  role?: string;
  brand: Brand;
  fontFamily: string;
  durationInFrames: number;
}> = ({name, role, brand, fontFamily, durationInFrames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const inP = spring({frame, fps, config: {damping: 200}, durationInFrames: 18});
  const outP = interpolate(frame, [durationInFrames - 15, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const p = inP * (1 - outP);

  return (
    <AbsoluteFill style={{direction: 'rtl', fontFamily}}>
      <div style={{position: 'absolute', right: 90, bottom: 110, display: 'flex', alignItems: 'stretch'}}>
        <div style={{width: 10, background: brand.accent, transform: `scaleY(${p})`}} />
        <div
          style={{
            background: brand.primary + 'e6',
            padding: '18px 36px',
            clipPath: `inset(0 0 0 ${(1 - p) * 100}%)`,
          }}
        >
          <div style={{color: brand.text, fontSize: 52, fontWeight: 800}}>{name}</div>
          {role ? <div style={{color: brand.accent, fontSize: 32, fontWeight: 600}}>{role}</div> : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};
