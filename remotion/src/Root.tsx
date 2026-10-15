import {Composition} from 'remotion';
import {BadgeUnlock} from './badge/BadgeUnlock';
import {AINews} from './news/AINews';
import {FPS as NEWS_FPS, HEIGHT as NEWS_H, newsDefaults, NewsProps, totalFrames as newsFrames, WIDTH as NEWS_W} from './news/config';
import {badgeUnlockSchema, DURATION as BADGE_FRAMES, FPS as BADGE_FPS, HEIGHT as BADGE_H, WIDTH as BADGE_W} from './badge/config';
import {HelloJenan, helloJenanSchema} from './HelloJenan';
import {FPS, HEIGHT, totalFrames, WIDTH} from './reel/config';
import {Reel} from './reel/Reel';
import {FPS as T4_FPS, HEIGHT as T4_H, totalFrames as t4Frames, WIDTH as T4_W} from './teacher4/config';
import {Teacher4} from './teacher4/Teacher4';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ريل مستقبل التعليم بكلمة — جمعية المعلمين الكويتية */}
      <Composition id="TeachersReel" component={Reel} durationInFrames={totalFrames()} fps={FPS} width={WIDTH} height={HEIGHT} />
      {/* ورشة المعلم 4.0 — من الثورة الصناعية الأولى إلى المعلم 4.0 */}
      <Composition id="Teacher4" component={Teacher4} durationInFrames={t4Frames()} fps={T4_FPS} width={T4_W} height={T4_H} />
      {/* قالب آخر أخبار الذكاء الاصطناعي — المدة تتغير حسب عدد الأخبار */}
      <Composition
        id="AINews"
        component={AINews}
        durationInFrames={newsFrames(newsDefaults)}
        fps={NEWS_FPS}
        width={NEWS_W}
        height={NEWS_H}
        defaultProps={newsDefaults}
        calculateMetadata={({props}: {props: NewsProps}) => ({durationInFrames: newsFrames(props)})}
      />
      {/* شاشة فتح الشارة — سلسلة آخر أخبار الذكاء الاصطناعي */}
      <Composition
        id="BadgeUnlock"
        component={BadgeUnlock}
        durationInFrames={BADGE_FRAMES}
        fps={BADGE_FPS}
        width={BADGE_W}
        height={BADGE_H}
        defaultProps={badgeUnlockSchema}
      />
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
