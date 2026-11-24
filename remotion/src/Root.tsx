import {Composition, Still} from 'remotion';
import {HelloJenan, helloJenanSchema} from './HelloJenan';
import {FPS, HEIGHT, totalFrames, WIDTH} from './reel/config';
import {Reel} from './reel/Reel';
import {FPS as SD_FPS, HEIGHT as SD_H, SalwaDinner, totalFrames as sdFrames, WIDTH as SD_W} from './salwa/SalwaDinner';
import {ConferenceInterviews, FPS as CI_FPS, HEIGHT as CI_H, totalFrames as ciFrames, WIDTH as CI_W} from './interviews/ConferenceInterviews';
import {FPS as T4_FPS, HEIGHT as T4_H, totalFrames as t4Frames, WIDTH as T4_W} from './teacher4/config';
import {Teacher4} from './teacher4/Teacher4';
import {FPS as C46_FPS, HEIGHT as C46_H, totalFrames as c46Frames, WIDTH as C46_W} from './conference46/config';
import {Recommendations46} from './conference46/Recommendations';
import {FPS as C46B_FPS, HEIGHT as C46B_H, Recommendations46V2, totalFrames as c46bFrames, WIDTH as C46B_W} from './conference46/v2/Recommendations2';
import {Badge, FPS as PN_FPS, HEIGHT as PN_H, INTRO_FRAMES, LowerThird, OUTRO_FRAMES, PanelIntro, PanelOutro, QuestionCard, WIDTH as PN_W} from './panel/PanelSession';
import {POST_H, POST_W, PostPeople, PostTitle} from './panel/PanelPosts';
import {COVER_H, COVER_W, ReelCover} from './panel/ReelCover';
import {FPS as PR_FPS, HEIGHT as PR_H, PRTeam, totalFrames as prFrames, WIDTH as PR_W} from './pr/PRTeam';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* الجلسة الحوارية: الصحة النفسية بين الانهيار والتكيف — بطاقات الأجزاء والصور اللي تركب فوق الفيديو */}
      <Composition id="PanelIntro" component={PanelIntro} durationInFrames={INTRO_FRAMES} fps={PN_FPS} width={PN_W} height={PN_H} defaultProps={{part: 1, parts: 16, bg: 'footage/panel/bg01.jpg'}} />
      <Composition id="PanelOutro" component={PanelOutro} durationInFrames={OUTRO_FRAMES} fps={PN_FPS} width={PN_W} height={PN_H} defaultProps={{bg: 'footage/panel/bg01.jpg'}} />
      <Still id="PanelQuestion" component={QuestionCard} width={PN_W} height={PN_H} defaultProps={{text: 'كيف نفرّق بين الضغط الطبيعي والانهيار النفسي؟', to: 'jaza' as const}} />
      <Still id="PanelLowerThird" component={LowerThird} width={PN_W} height={PN_H} defaultProps={{who: 'jaza' as const}} />
      {/* بوستين انستغرام يمين ويسار الريلز */}
      <Still id="PostTitle" component={PostTitle} width={POST_W} height={POST_H} defaultProps={{logo: 'brand/kicd-2026-logo.png'}} />
      <Still id="PostPeople" component={PostPeople} width={POST_W} height={POST_H} defaultProps={{logo: 'brand/kicd-2026-logo.png'}} />
      <Still id="ReelCover" component={ReelCover} width={COVER_W} height={COVER_H} defaultProps={{session: 'zawaya_law' as const, who: 'salwa', photo: 'footage/panel/zawaya/cover-law.jpg', accent: '#0D1A3A', layout: 'band' as const}} />
      <Still id="PanelBadge" component={Badge} width={PN_W} height={PN_H} defaultProps={{part: 1, parts: 16}} />
      {/* فريق العلاقات العامة — فاطمة الهاشمية، نسخة رسمية */}
      <Composition id="PRTeam" component={PRTeam} durationInFrames={prFrames()} fps={PR_FPS} width={PR_W} height={PR_H} />
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
      {/* أبرز لقاءات مؤتمر الكويت الدولي الأول للتدريب والتطوير — أفقي، جزئين */}
      <Composition id="ConferenceInterviews1" component={ConferenceInterviews} durationInFrames={ciFrames(1)} fps={CI_FPS} width={CI_W} height={CI_H} defaultProps={{part: 1 as const}} />
      <Composition id="ConferenceInterviews2" component={ConferenceInterviews} durationInFrames={ciFrames(2)} fps={CI_FPS} width={CI_W} height={CI_H} defaultProps={{part: 2 as const}} />
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
