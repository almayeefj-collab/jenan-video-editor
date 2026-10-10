import {Composition} from 'remotion';
import {HelloJenan, helloJenanSchema} from './HelloJenan';
import {FPS, HEIGHT, teachersReel, totalFrames, WIDTH} from './reel/config';
import {Reel} from './reel/Reel';
import {voicesReel} from './reel/voices';

const TeachersReel: React.FC = () => <Reel spec={teachersReel} />;
const VoicesReel: React.FC = () => <Reel spec={voicesReel} />;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ريل مستقبل التعليم بكلمة — جمعية المعلمين الكويتية */}
      <Composition id="TeachersReel" component={TeachersReel} durationInFrames={totalFrames(teachersReel.shots)} fps={FPS} width={WIDTH} height={HEIGHT} />
      {/* ريل أصوات المؤتمر — ثلاث مقابلات */}
      <Composition id="VoicesReel" component={VoicesReel} durationInFrames={totalFrames(voicesReel.shots)} fps={FPS} width={WIDTH} height={HEIGHT} />
      {/* أفقي 16:9 */}
      <Composition
        id="HelloJenan"
        component={HelloJenan}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={helloJenanSchema}
      />
      {/* عمودي 9:16 للريلز وتيك توك */}
      <Composition
        id="HelloJenanVertical"
        component={HelloJenan}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={helloJenanSchema}
      />
    </>
  );
};
