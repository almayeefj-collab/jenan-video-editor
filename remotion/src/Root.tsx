import {Composition} from 'remotion';
import {HelloJenan, helloJenanSchema} from './HelloJenan';
import {FPS, HEIGHT, totalFrames, WIDTH} from './reel/config';
import {Reel} from './reel/Reel';
import {FPS as T4_FPS, HEIGHT as T4_H, totalFrames as t4Frames, WIDTH as T4_W} from './teacher4/config';
import {Teacher4} from './teacher4/Teacher4';
import {AiNews} from './ainews/AiNews';
import {episodes} from './ainews/episodes';
import {AiNews2, episode2Frames} from './ainews2/AiNews2';
import {ep01v2} from './ainews2/episodes/ep01';
import {ep02v2} from './ainews2/episodes/ep02';
import {ep04v2} from './ainews2/episodes/ep04';
import {ep05} from './ainews2/episodes/ep05';
import {Tutorial, tutorialFrames} from './ainews2/Tutorial';
import {episodeFrames, FPS as AN_FPS, HEIGHT as AN_H, WIDTH as AN_W} from './ainews/types';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* أخبار أدوات الذكاء الاصطناعي — حلقة يومية: AiNews01 بالفويس أوفر، AiNews01Music موسيقى بس */}
      {/* الإصدار الثاني — ستايل الموشن جرافيك */}
      <Composition id="AiNews05v2" component={Tutorial} durationInFrames={tutorialFrames(ep05, true)} fps={30} width={1080} height={1920} defaultProps={{ep: ep05, voice: true}} />
      <Composition id="AiNews05v2Music" component={Tutorial} durationInFrames={tutorialFrames(ep05, false)} fps={30} width={1080} height={1920} defaultProps={{ep: ep05, voice: false}} />
      <Composition id="AiNews04v2" component={AiNews2} durationInFrames={episode2Frames(ep04v2, true)} fps={30} width={1080} height={1920} defaultProps={{ep: ep04v2, voice: true}} />
      <Composition id="AiNews04v2Music" component={AiNews2} durationInFrames={episode2Frames(ep04v2, false)} fps={30} width={1080} height={1920} defaultProps={{ep: ep04v2, voice: false}} />
      <Composition id="AiNews01v2" component={AiNews2} durationInFrames={episode2Frames(ep01v2, true)} fps={30} width={1080} height={1920} defaultProps={{ep: ep01v2, voice: true}} />
      <Composition id="AiNews02v2" component={AiNews2} durationInFrames={episode2Frames(ep02v2, true)} fps={30} width={1080} height={1920} defaultProps={{ep: ep02v2, voice: true}} />
      <Composition id="AiNews02v2Music" component={AiNews2} durationInFrames={episode2Frames(ep02v2, false)} fps={30} width={1080} height={1920} defaultProps={{ep: ep02v2, voice: false}} />
      {episodes.flatMap((ep) => {
        const id = String(ep.number).padStart(2, '0');
        const common = {component: AiNews, durationInFrames: episodeFrames(ep), fps: AN_FPS, width: AN_W, height: AN_H};
        return [
          <Composition key={`v${id}`} id={`AiNews${id}`} {...common} defaultProps={{ep, voice: true}} />,
          <Composition key={`m${id}`} id={`AiNews${id}Music`} {...common} defaultProps={{ep, voice: false}} />,
        ];
      })}
      {/* ريل مستقبل التعليم بكلمة — جمعية المعلمين الكويتية */}
      <Composition id="TeachersReel" component={Reel} durationInFrames={totalFrames()} fps={FPS} width={WIDTH} height={HEIGHT} />
      {/* ورشة المعلم 4.0 — من الثورة الصناعية الأولى إلى المعلم 4.0 */}
      <Composition id="Teacher4" component={Teacher4} durationInFrames={t4Frames()} fps={T4_FPS} width={T4_W} height={T4_H} />
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
