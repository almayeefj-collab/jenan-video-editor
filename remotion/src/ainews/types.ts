// حلقة يومية من «أخبار أدوات الذكاء الاصطناعي» — كل الأوقات بالثواني، والمسارات نسبة لـ public/
export type NewsScene = {
  kind: 'hook' | 'news';
  image: string; // صورة مولّدة من Higgsfield (9:16)
  voice?: string; // فويس أوفر المشهد (اختياري — بدونه الموسيقى بس)
  dur: number; // طول المشهد
  tag?: string; // اسم الأداة: ChatGPT، Gemini...
  title: string; // العنوان الكبير
  sub?: string; // سطر شرح قصير
};

export type Episode = {
  number: number;
  date: string; // يطلع فوق: مثلاً «١٥ أكتوبر ٢٠٢٦»
  music: string;
  scenes: NewsScene[];
  outro: {image: string; voice?: string; dur: number};
};

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const INSTAGRAM = '@t.jenanalmayeef4';

export const theme = {
  bg: '#07070D',
  red: '#FF2D55',
  cyan: '#22D3EE',
  violet: '#8B5CF6',
  text: '#FFFFFF',
  dim: 'rgba(255,255,255,0.78)',
};

export const sceneStarts = (ep: Episode) => {
  let t = 0;
  const starts = ep.scenes.map((s) => {
    const at = t;
    t += Math.round(s.dur * FPS);
    return at;
  });
  return {starts, outroStart: t};
};

export const episodeFrames = (ep: Episode) => sceneStarts(ep).outroStart + Math.round(ep.outro.dur * FPS);
