import {Composition} from 'remotion';
import {HelloJenan, helloJenanSchema} from './HelloJenan';
import {FPS, HEIGHT, totalFrames, WIDTH} from './reel/config';
import {Reel} from './reel/Reel';
import {FPS as SD_FPS, HEIGHT as SD_H, SalwaDinner, totalFrames as sdFrames, WIDTH as SD_W} from './salwa/SalwaDinner';
import {FPS as T4_FPS, HEIGHT as T4_H, totalFrames as t4Frames, WIDTH as T4_W} from './teacher4/config';
import {Teacher4} from './teacher4/Teacher4';
import {FPS as C46_FPS, HEIGHT as C46_H, totalFrames as c46Frames, WIDTH as C46_W} from './conference46/config';
import {Recommendations46} from './conference46/Recommendations';
import {FPS as NB_FPS, HEIGHT as NB_H, NotebookPromo, totalFrames as nbFrames, WIDTH as NB_W} from './notebook/Notebook';
import {FPS as C46B_FPS, HEIGHT as C46B_H, Recommendations46V2, totalFrames as c46bFrames, WIDTH as C46B_W} from './conference46/v2/Recommendations2';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* دفتر متابعة ١٢ علمي ٨ — المعلمة جنان المعييف (مصمم بـ Claude Code) */}
      <Composition id="NotebookPromo" component={NotebookPromo} durationInFrames={nbFrames()} fps={NB_FPS} width={NB_W} height={NB_H} />
      {/* ريل مستقبل التعليم بكلمة — جمعية المعلمين الكويتية */}
      <Composition id="TeachersReel" component={Reel} durationInFrames={totalFrames()} fps={FPS} width={WIDTH} height={HEIGHT} />
      {/* أبرز 15 توصية للمؤتمر التربوي السادس والأربعين — موشن جرافيك عمودي */}
      <Composition id="Recommendations46" component={Recommendations46} durationInFrames={c46Frames()} fps={C46_FPS} width={C46_W} height={C46_H} />
      {/* النسخة الثانية: تعليق صوتي + موسيقى رسمية + رسمة متحركة لكل توصية */}
      <Composition id="Recommendations46V2" component={Recommendations46V2} durationInFrames={c46bFrames()} fps={C46B_FPS} width={C46B_W} height={C46B_H} />
      {/* ورشة المعلم 4.0 — من الثورة الصناعية الأولى إلى المعلم 4.0 */}
      <Composition id="Teacher4" component={Teacher4} durationInFrames={t4Frames()} fps={T4_FPS} width={T4_W} height={T4_H} />
      {/* حفل عشاء نجاح مؤتمر الكويت الدولي الأول للتدريب والتطوير — أ. سلوى الطراروة */}
      <Composition id="SalwaDinner" component={SalwaDinner} durationInFrames={sdFrames()} fps={SD_FPS} width={SD_W} height={SD_H} />
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
