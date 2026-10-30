// الإصدار الثاني من «آخر أخبار أدوات الـ AI» — ستايل موشن جرافيك (كريمي/مرجاني/فحمي)
// بدون صور: كل خبر = كم «لقطة» (beat) فيها عنوان متحرك فوق وشكل ثلاثي الأبعاد بالنص.
// العنوان: الكلمة اللي بين *نجمتين* تطلع بالمرجاني.

import type {UiScreen} from './UiMocks';

export type Look = 'light' | 'dark' | 'coral';

type Base = {dur: number; look?: Look; head?: string; foot?: string};

export type Beat = Base &
  (
    | {type: 'brand'; name: string; accent?: string; chip?: string} // اسم كبير على خلفية غامقة بنجوم
    | {type: 'calendar'; day: string; month: string} // ورقة تقويم
    | {type: 'cube'; color?: 'coral' | 'dark' | 'white'; label?: string} // مكعب ثلاثي الأبعاد
    | {type: 'bars'; items: {label: string; value: number; display: string}[]} // مقارنة أعمدة
    | {type: 'stat'; value: string; unit?: string} // رقم كبير
    | {type: 'doc'; title: string; rows: string[]} // ورقة فيها صحّات تنصح وحدة وحدة
    | {type: 'phone'; bubbles?: string[]; wave?: boolean} // جوال: فقاعات أو موجة صوت
    | {type: 'chips'; chips: string[]} // كبسولات
    | {type: 'ui'; screen: UiScreen} // واجهة توضيحية للأداة مع ماوس (UiMocks.tsx)
  );

export type Story = {
  tag: string; // اسم الأداة (للسجلات والكابشن)
  voice?: string; // مقطع صوت جنان لهالخبر
  voiceDur?: number; // طوله بالثواني — اللقطات تتمدد/تنضغط عليه (+0.2)
  beats: Beat[];
};

export type Episode2 = {
  number: number;
  date: string;
  music: string;
  intro: Story;
  stories: Story[];
  outro: {voice?: string; dur: number; word?: string}; // word: «علّق بكلمة ...»
};

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const INSTAGRAM = '@t.jenanalmayeef4';

export const C = {
  cream: '#EEEBE4',
  creamEdge: '#D9D5CB',
  paper: '#FAF8F3',
  coral: '#E8735A',
  coralDeep: '#D2593F',
  coralSoft: '#F3A390',
  ink: '#231C1A',
  inkSoft: '#3A302D',
  grey: '#8E8680',
};

// طول اللقطة الفعلي: إذا فيه صوت، اللقطات تتمدد/تنضغط عشان تطابق طول المقطع
export const storyFrames = (s: Story, voice: boolean) => {
  const base = s.beats.reduce((a, b) => a + b.dur, 0);
  const k = voice && s.voiceDur ? (s.voiceDur + 0.2) / base : 1;
  return s.beats.map((b) => Math.round(b.dur * k * FPS));
};

export const episodeLayout = (ep: Episode2, voice: boolean) => {
  let t = 0;
  const stories = [ep.intro, ...ep.stories].map((s) => {
    const beats = storyFrames(s, voice);
    const start = t;
    t += beats.reduce((a, b) => a + b, 0);
    return {story: s, start, beats};
  });
  const outroStart = t;
  return {stories, outroStart, total: t + Math.round(ep.outro.dur * FPS)};
};
