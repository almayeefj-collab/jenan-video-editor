import type {Episode2} from '../types';

// الحلقة ٨ — ١ نوفمبر ٢٠٢٦ — «سين جيم»: لعبة تفاعلية سوتها جنان بـ Claude (تبويب Code) ولعبتها مع طالباتها
// المادة: فيديوهات جنان من الفصل (public/ainews/ep08/raw/class1/2.mp4 — مو في المستودع)، والنسخ المستخدمة *-blur.mp4:
// شريط أسماء الفريقين مغبّش (tools/blur_screen_band.py) وسطر «تجاوب: <الاسم>» في بطاقة السؤال (tools/track_blur.py). البرومبت المعروض: SEEN_JEEM_PROMPT في UiMocks.tsx
// السكربت: public/ainews/ep08/script.txt

// شاشة اللعبة مقصوصة ومعدّلة من التصوير (tools/rectify_screen.py) وتنعرض داخل لابتوب
const C1 = 'ainews/ep08/raw/class1-screen.mp4';
const C2 = 'ainews/ep08/raw/class2-screen.mp4';

export const ep08v2: Episode2 = {
  number: 8,
  date: '١ نوفمبر ٢٠٢٦',
  music: 'ainews/ep08/music-voice.mp3',
  intro: {tag: 'intro', voice: 'ainews/ep08/v0.mp3', voiceDur: 8.14, beats: [
    {type: 'brand', look: 'dark', dur: 2.6, name: 'آخر أخبار أدوات الـ AI', chip: 'مع جنان المعييف'},
    {type: 'chips', look: 'coral', dur: 3.0, head: 'سويت لعبة *سين جيم*', chips: ['Claude', 'لطالباتي'], foot: 'الحلقة *٨*'},
  ]},
  stories: [
    {tag: 'Claude', voice: 'ainews/ep08/v1.mp3', voiceDur: 16.78, beats: [
      {type: 'ui', look: 'light', dur: 9.0, head: 'من خانة *Code*', screen: 'claudeCodePrompt'},
    ]},
    // كل لقطة على جملتها: «وهذي أنا ألعبها» · «نختار الفئة والنقاط» · «السؤال مع المؤقت» · «تظهر الإجابة وأختار منو»
    {tag: 'Class', voice: 'ainews/ep08/v2.mp3', voiceDur: 11.66, beats: [
      {type: 'clip', laptop: true, dur: 2.85, head: 'لوحة *٦ فئات*', src: C1, from: 1},
      {type: 'clip', laptop: true, dur: 2.1, head: 'تختار *النقاط*', src: C1, from: 9},
      {type: 'clip', laptop: true, dur: 2.1, head: 'السؤال مع *المؤقت*', src: C1, from: 22.5},
      {type: 'clip', laptop: true, dur: 4.81, head: 'وتظهر *الإجابة*', src: C2, from: 9.6, rate: 0.8, foot: 'أختار *منو جاوب صح*'},
    ]},
    {tag: 'Helps', voice: 'ainews/ep08/v3.mp3', voiceDur: 5.78, beats: [
      {type: 'chips', look: 'dark', dur: 4.0, head: 'وسائل *مساعدة*', chips: ['الحفرة', 'جاوبي جوابين', 'استعانة بزميلة']},
    ]},
  ],
  outro: {voice: 'ainews/ep08/v4.mp3', dur: 10.4, word: 'لعبة'},
};
