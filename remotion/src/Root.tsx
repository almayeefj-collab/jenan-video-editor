import {Composition} from 'remotion';
import {HelloJenan, helloJenanSchema} from './HelloJenan';
import {FPS, HEIGHT, totalFrames, WIDTH} from './reel/config';
import {CONFERENCE_INTRO, conferenceShots} from './reel/conference';
import {Reel} from './reel/Reel';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ريل مستقبل التعليم بكلمة — جمعية المعلمين الكويتية */}
      <Composition id="TeachersReel" component={Reel} durationInFrames={totalFrames()} fps={FPS} width={WIDTH} height={HEIGHT} />
      {/* ريل لقاءات ولقطات — المؤتمر التربوي السادس والأربعون */}
      <Composition
        id="ConferenceReel"
        component={Reel}
        durationInFrames={totalFrames(conferenceShots)}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{shots: conferenceShots, intro: CONFERENCE_INTRO, music: 'music/conference.mp3'}}
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
