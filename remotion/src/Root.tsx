import {Composition} from 'remotion';
import {HelloJenan, helloJenanSchema} from './HelloJenan';
import {FPS, HEIGHT, totalFrames, WIDTH} from './reel/config';
import {Reel} from './reel/Reel';
import {FPS as T4_FPS, HEIGHT as T4_H, totalFrames as t4Frames, WIDTH as T4_W} from './teacher4/config';
import {Teacher4} from './teacher4/Teacher4';
import {AINews} from './ainews/AINews';
import {FPS as AI_FPS, HEIGHT as AI_H, totalFrames as aiFrames, WIDTH as AI_W} from './ainews/config';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ريل مستقبل التعليم بكلمة — جمعية المعلمين الكويتية */}
      <Composition id="TeachersReel" component={Reel} durationInFrames={totalFrames()} fps={FPS} width={WIDTH} height={HEIGHT} />
      {/* ورشة المعلم 4.0 — من الثورة الصناعية الأولى إلى المعلم 4.0 */}
      <Composition id="Teacher4" component={Teacher4} durationInFrames={t4Frames()} fps={T4_FPS} width={T4_W} height={T4_H} />
      {/* ريل أخبار الذكاء الاصطناعي — أكتوبر 2026 */}
      <Composition id="AINews" component={AINews} durationInFrames={aiFrames()} fps={AI_FPS} width={AI_W} height={AI_H} />
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
