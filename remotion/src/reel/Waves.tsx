import {AbsoluteFill} from 'remotion';

// الخطوط المتموجة الخفيفة اللي في خلفيات بوستات الجمعية
export const Waves: React.FC<{opacity?: number}> = ({opacity = 0.12}) => {
  const lines = Array.from({length: 26}, (_, i) => {
    const y = 40 + i * 74;
    const a = 26 + (i % 5) * 6;
    return `M -50 ${y} C 250 ${y - a}, 500 ${y + a}, 760 ${y - a / 2} S 1100 ${y + a / 2}, 1150 ${y}`;
  });
  return (
    <AbsoluteFill style={{opacity}}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        {lines.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#9FBDE3" strokeWidth={1.4} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
