// ريل «وش الجديد في الذكاء الاصطناعي» — أكتوبر 2026
// موشن جرافيك خالص (بدون صور)، عمودي 9:16
// المصادر: صفحات الإصدارات الرسمية + تغطيات تقنية (انظر رسالة الكومت)

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const TRANSITION = 14;
export const INK = '#05070F';

export type News = {
  kind: 'news';
  brand: string; // اسم الشركة/المنتج بالإنجليزي
  tag: string; // التاريخ أو التصنيف
  title: string;
  points: string[];
  accent: string;
  glow: string;
  sec: number;
};

export type Scene =
  | {kind: 'intro'; sec: number}
  | News
  | {kind: 'outro'; sec: number};

const S = 7.5;

export const scenes: Scene[] = [
  {kind: 'intro', sec: 4},
  {
    kind: 'news', brand: 'ChatGPT', tag: '7 أكتوبر', sec: S,
    title: 'GPT-6 صار للكل',
    points: ['متاح لكل المستخدمين حتى المجاني', 'رسومات وأدوات تفاعلية داخل الرد', 'ارفع تسجيل صوتي ← تفريغ وملخص'],
    accent: '#3EE8B5', glow: '#0E6B55',
  },
  {
    kind: 'news', brand: 'Claude', tag: 'عائلة 5.5', sec: S,
    title: 'ثلاث موديلات جديدة',
    points: ['Opus 5.5 بمستوى Fable 5.1 وأرخص 40%', 'Sonnet 5.5 أسرع وأوفر', 'Haiku 5.5 أرخص وأسرع موديل صغير'],
    accent: '#F08A5D', glow: '#7A3418',
  },
  {
    kind: 'news', brand: 'Claude Motion', tag: 'لصنّاع المحتوى', sec: S,
    title: 'موشن جرافيك من نص',
    points: ['اكتب الفكرة ← فيديو MP4 متحرك', 'عدّل كلمة أو رقم بدون ما تعيد الشغل', 'بيتا لخطط Team و Enterprise'],
    accent: '#FFB86B', glow: '#7A4A12',
  },
  {
    kind: 'news', brand: 'Claude Design', tag: 'مجاناً', sec: S,
    title: 'تصميم وعروض ومستندات',
    points: ['Design و Slides و Docs داخل أي محادثة', 'متاحة لكل الخطط حتى المجانية', 'Dashboards: لوحات بيانات حيّة (بيتا)'],
    accent: '#C7A6FF', glow: '#4A2F86',
  },
  {
    kind: 'news', brand: 'Gemini', tag: 'Google', sec: S,
    title: 'Nano Banana 2.1',
    points: ['صور أوضح وكتابة نصوص أدق', 'النسخة المجانية صارت على Flash-Lite بس', 'إشاعات عن Gemini 4 قريب'],
    accent: '#6FA8FF', glow: '#1B3F86',
  },
  {
    kind: 'news', brand: 'Kling 4.0', tag: 'فيديو AI', sec: S,
    title: '30 ثانية بلقطة وحدة',
    points: ['دقة لين 4K و 10 كي فريمز', 'نسخة Flash بتجربة محدودة الحين', 'الإطلاق الكامل موعود هالشهر'],
    accent: '#FF6B9A', glow: '#7A1838',
  },
  {kind: 'outro', sec: 4.5},
];

export const newsCount = scenes.filter((s) => s.kind === 'news').length;

export const sceneFrames = (s: Scene) => Math.round(s.sec * FPS);

export const timeline = () => {
  let t = 0;
  return scenes.map((s, i) => {
    if (i > 0) t -= TRANSITION;
    const start = t;
    t += sceneFrames(s);
    return {scene: s, start, frames: sceneFrames(s)};
  });
};

export const totalFrames = () => {
  const tl = timeline();
  const last = tl[tl.length - 1];
  return last.start + last.frames;
};
