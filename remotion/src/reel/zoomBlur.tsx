import type {TransitionPresentation, TransitionPresentationComponentProps} from '@remotion/transitions';
import {AbsoluteFill, Easing, interpolate} from 'remotion';

// انتقال zoom + blur نظيف بدون خلفيات: المشهد الأول يكبر ويضبب ويختفي،
// والثاني يدخل من zoom خفيف ويتوضح
const ZoomBlur: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({
  children,
  presentationDirection,
  presentationProgress,
}) => {
  const p = Easing.bezier(0.65, 0, 0.35, 1)(presentationProgress);
  const exiting = presentationDirection === 'exiting';
  const scale = exiting ? interpolate(p, [0, 1], [1, 1.25]) : interpolate(p, [0, 1], [1.2, 1]);
  const blur = exiting ? interpolate(p, [0, 1], [0, 28]) : interpolate(p, [0, 1], [28, 0]);
  const opacity = exiting ? 1 : interpolate(p, [0, 0.5], [0, 1], {extrapolateRight: 'clamp'});
  const flash = interpolate(p, [0.35, 0.5, 0.65], [0, 0.35, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity}}>
      <AbsoluteFill style={{transform: `scale(${scale})`, filter: `blur(${blur}px)`}}>{children}</AbsoluteFill>
      {exiting ? null : <AbsoluteFill style={{background: 'white', opacity: flash}} />}
    </AbsoluteFill>
  );
};

export const zoomBlur = (): TransitionPresentation<Record<string, never>> => ({
  component: ZoomBlur,
  props: {},
});
