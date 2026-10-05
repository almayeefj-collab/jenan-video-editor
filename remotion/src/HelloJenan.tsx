import {loadFont} from '@remotion/fonts';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {AbsoluteFill, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

// الخط محفوظ محلياً في public/fonts عشان الرندر ما يعتمد على الإنترنت
const fontFamily = 'Cairo';
loadFont({family: fontFamily, url: staticFile('fonts/Cairo.ttf')});

export const helloJenanSchema = {
  title: 'جنان للمونتاج',
  subtitle: 'فيديوهات احترافية بالكود',
};

const Title: React.FC<{text: string; bg: string}> = ({text, bg}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scale = spring({frame, fps, config: {damping: 12}});
  const opacity = interpolate(frame, [0, 15], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill
      style={{
        background: bg,
        justifyContent: 'center',
        alignItems: 'center',
        direction: 'rtl',
      }}
    >
      <h1
        style={{
          fontFamily,
          fontSize: 120,
          fontWeight: 800,
          color: 'white',
          textAlign: 'center',
          transform: `scale(${scale})`,
          opacity,
          padding: 40,
        }}
      >
        {text}
      </h1>
    </AbsoluteFill>
  );
};

export const HelloJenan: React.FC<typeof helloJenanSchema> = ({title, subtitle}) => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={80}>
        <Title text={title} bg="linear-gradient(135deg, #0f2027, #2c5364)" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction: 'from-left'})} timing={linearTiming({durationInFrames: 15})} />
      <TransitionSeries.Sequence durationInFrames={85}>
        <Title text={subtitle} bg="linear-gradient(135deg, #42275a, #734b6d)" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
