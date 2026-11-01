import type {Episode2} from '../types';

// الحلقة ٨ — ١ نوفمبر ٢٠٢٦ — «سين جيم»: لعبة تفاعلية سوتها جنان بـ Claude (تبويب Code) ولعبتها مع طالباتها
// المادة: فيديوهات جنان من الفصل (public/ainews/ep08/raw/class1/2.mp4 — مو في المستودع)، والنسخ المستخدمة *-blur.mp4:
// شريط أسماء الفريقين مغبّش (tools/blur_screen_band.py) وسطر «تجاوب: <الاسم>» في بطاقة السؤال (tools/track_blur.py). البرومبت المعروض: SEEN_JEEM_PROMPT في UiMocks.tsx
// السكربت: public/ainews/ep08/script.txt

const C1 = 'ainews/ep08/raw/class1-blur.mp4';
const C2 = 'ainews/ep08/raw/class2-blur.mp4';

export const ep08v2: Episode2 = {
  number: 8,
  date: '١ نوفمبر ٢٠٢٦',
  music: 'ainews/ep08/music.mp3',
  intro: {tag: 'intro', beats: [
    {type: 'brand', look: 'dark', dur: 2.6, name: 'آخر أخبار أدوات الـ AI', chip: 'مع جنان المعييف'},
    {type: 'chips', look: 'coral', dur: 3.0, head: 'سويت لعبة *سين جيم*', chips: ['Claude', 'لطالباتي'], foot: 'الحلقة *٨*'},
  ]},
  stories: [
    {tag: 'Claude', beats: [
      {type: 'ui', look: 'light', dur: 9.0, head: 'من خانة *Code*', screen: 'claudeCodePrompt'},
    ]},
    {tag: 'Class', beats: [
      {type: 'clip', dur: 4.5, head: 'لوحة *٦ فئات*', src: C1, from: 1},
      {type: 'clip', dur: 3.5, head: 'تختار *النقاط*', src: C1, from: 9},
      {type: 'clip', dur: 4.5, head: 'السؤال مع *المؤقت*', src: C1, from: 22.5},
      {type: 'clip', dur: 3.9, head: 'وتظهر *الإجابة*', src: C2, from: 9.6, foot: 'وأختار *منو جاوب*'},
    ]},
    {tag: 'Helps', beats: [
      {type: 'chips', look: 'dark', dur: 4.0, head: 'وسائل *مساعدة*', chips: ['الحفرة', 'جاوبي جوابين', 'استعانة بزميلة']},
    ]},
  ],
  outro: {dur: 7, word: 'لعبة'},
};
