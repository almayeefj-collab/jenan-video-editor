import type {TransitionPresentation, TransitionPresentationComponentProps} from '@remotion/transitions';
import {AbsoluteFill, Easing, Img, interpolate, staticFile} from 'remotion';
import {type Brand, LOGO} from './config';
import {Waves} from './Waves';

type Props = {brand: Brand};

// انتقال رسمي: شريط ذهبي يتبعه لوح كحلي بالشعار يمسح الشاشة من اليمين لليسار
// ويغطي القطع بين المشهدين.
const BrandWipe: React.FC<TransitionPresentationComponentProps<Props>> = ({
  children,
  presentationDirection,
  presentationProgress,
  passedProps: {brand},
}) => {
  if (presentationDirection === 'exiting') {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }
  const ease = Easing.bezier(0.65, 0, 0.35, 1);
  const p = presentationProgress;
  const cover = ease(Math.min(1, p * 2));
  const reveal = ease(Math.max(0, p * 2 - 1));
  const pos = (delay: number) => {
    const c = interpolate(cover, [delay, 1], [0, 1], {extrapolateLeft: 'clamp'});
    const r = interpolate(reveal, [0, 1 - delay], [0, 1], {extrapolateRight: 'clamp'});
    return 100 - c * 100 - r * 100;
  };
  const logo = interpolate(p, [0.3, 0.5, 0.7], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: p < 0.5 ? 0 : 1}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{background: brand.bar, transform: `translateX(${pos(0)}%)`}} />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${brand.navy}, ${brand.navyDark})`,
          transform: `translateX(${pos(0.22)}%)`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Waves />
        <Img src={staticFile(LOGO)} style={{width: 220, opacity: logo, transform: `scale(${0.9 + 0.1 * logo})`}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const brandWipe = (props: Props): TransitionPresentation<Props> => ({
  component: BrandWipe,
  props,
});
