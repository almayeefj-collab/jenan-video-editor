import type {TransitionPresentation, TransitionPresentationComponentProps} from '@remotion/transitions';
import {AbsoluteFill, Easing, interpolate} from 'remotion';

type Props = TransitionPresentationComponentProps<Record<string, never>>;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// whip pan: المشهد الأول ينسحب يسار بسرعة مع ضبابية حركة، والثاني يدخل من اليمين
const Whip: React.FC<Props> = ({children, presentationDirection, presentationProgress}) => {
  const p = Easing.bezier(0.7, 0, 0.3, 1)(presentationProgress);
  const exiting = presentationDirection === 'exiting';
  const x = exiting ? interpolate(p, [0, 1], [0, -100]) : interpolate(p, [0, 1], [100, 0]);
  const blur = interpolate(Math.sin(p * Math.PI), [0, 1], [0, 26]);
  return (
    <AbsoluteFill style={{transform: `translateX(${x}%) scale(${1 + 0.08 * Math.sin(p * Math.PI)})`, filter: `blur(${blur}px)`}}>
      {children}
    </AbsoluteFill>
  );
};

// فلاش أبيض مثل فلاش الكاميرا: المشهد الأول يكبر وينور، والثاني يطلع من الفلاش
const Flash: React.FC<Props> = ({children, presentationDirection, presentationProgress}) => {
  const p = presentationProgress;
  const exiting = presentationDirection === 'exiting';
  const scale = exiting ? interpolate(p, [0, 1], [1, 1.08]) : interpolate(p, [0, 1], [1.08, 1]);
  const bright = exiting ? interpolate(p, [0, 0.5], [1, 2.2], clamp) : interpolate(p, [0.5, 1], [2.2, 1], clamp);
  const white = interpolate(p, [0.2, 0.5, 0.9], [0, 0.95, 0], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${scale})`, filter: `brightness(${bright})`, opacity: exiting || p >= 0.5 ? 1 : 0}}>
        {children}
      </AbsoluteFill>
      {exiting ? null : <AbsoluteFill style={{background: 'white', opacity: white}} />}
    </AbsoluteFill>
  );
};

export const whip = (): TransitionPresentation<Record<string, never>> => ({component: Whip, props: {}});
export const flash = (): TransitionPresentation<Record<string, never>> => ({component: Flash, props: {}});
