import type {TransitionPresentation, TransitionPresentationComponentProps} from '@remotion/transitions';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import type {Brand} from './config';

type Props = {brand: Brand};

// انتقال رسمي: شريطين بألوان الهوية يمسحون الشاشة من اليمين لليسار
// ويغطون القطع بين المشهدين.
const BrandWipe: React.FC<TransitionPresentationComponentProps<Props>> = ({
  children,
  presentationDirection,
  presentationProgress,
  passedProps: {brand},
}) => {
  const ease = Easing.bezier(0.65, 0, 0.35, 1);
  if (presentationDirection === 'exiting') {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }
  const p = presentationProgress;
  // المرحلة الأولى: الشرائط تدخل وتغطي، الثانية: تطلع وتكشف المشهد الجديد
  const cover = ease(Math.min(1, p * 2));
  const reveal = ease(Math.max(0, p * 2 - 1));
  const stripe = (color: string, delay: number) => {
    const c = interpolate(cover, [delay, 1], [0, 1], {extrapolateLeft: 'clamp'});
    const r = interpolate(reveal, [0, 1 - delay], [0, 1], {extrapolateRight: 'clamp'});
    const left = 100 - c * 100 - r * 100; // من اليمين لليسار
    return (
      <AbsoluteFill style={{background: color, transform: `translateX(${left}%)`}} />
    );
  };
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: p < 0.5 ? 0 : 1}}>{children}</AbsoluteFill>
      {stripe(brand.accent, 0)}
      {stripe(brand.primary, 0.25)}
    </AbsoluteFill>
  );
};

export const brandWipe = (props: Props): TransitionPresentation<Props> => ({
  component: BrandWipe,
  props,
});
