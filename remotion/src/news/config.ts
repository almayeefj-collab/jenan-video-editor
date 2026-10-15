// قالب «آخر أخبار الذكاء الاصطناعي» — اكتب الأخبار هنا أو مررها بـ --props
// الصور اختيارية: حطها في public/news/ واكتب المسار مثل 'news/1.jpg'

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const INTRO = 75; // 2.5 ثانية
export const OUTRO = 75;
export const TRANSITION = 14; // تداخل الانتقال بين المشاهد
export const DEFAULT_ITEM_SECONDS = 5.5;

export type NewsItem = {
  tag: string; // تصنيف قصير يطلع في كبسولة: أدوات، شركات، أبحاث...
  headline: string;
  detail?: string;
  source?: string;
  image?: string; // مسار داخل public — إذا ما فيه صورة يطلع رسم متحرك بداله
  seconds?: number; // مدة الخبر (افتراضي 5.5 ثانية)
};

export type NewsProps = {
  seriesTitle: string;
  seriesSub: string;
  date: string;
  handle: string;
  outroText: string;
  accent: string; // اللون الأساسي
  accent2: string; // اللون الثاني في التدرجات
  music: boolean;
  items: NewsItem[];
};

export const newsDefaults: NewsProps = {
  seriesTitle: 'آخر أخبار الذكاء الاصطناعي',
  seriesSub: 'أهم ما صار هالأسبوع',
  date: '15 أكتوبر 2026',
  handle: '@your_account',
  outroText: 'تابعنا عشان يوصلك كل جديد',
  accent: '#22D3EE',
  accent2: '#8B5CF6',
  music: true,
  items: [
    {
      tag: 'نماذج',
      headline: 'هنا عنوان الخبر الأول مختصر وواضح في سطرين',
      detail: 'هنا تفاصيل الخبر في جملتين: وش اللي صار، وليش يهم المتابع.',
      source: 'اسم المصدر',
    },
    {
      tag: 'أدوات',
      headline: 'عنوان الخبر الثاني: أداة جديدة تسهّل شغلك اليومي',
      detail: 'اشرح وش تسوي الأداة ولمين مفيدة، وهل هي مجانية أو مدفوعة.',
      source: 'اسم المصدر',
    },
    {
      tag: 'شركات',
      headline: 'عنوان الخبر الثالث عن صفقة أو إعلان من شركة كبيرة',
      detail: 'تفاصيل مختصرة عن الإعلان وأثره على السوق والمستخدمين.',
      source: 'اسم المصدر',
    },
  ],
};

export const itemFrames = (it: NewsItem) => Math.round((it.seconds ?? DEFAULT_ITEM_SECONDS) * FPS);

// المدة الكلية: انترو + الأخبار + أوترو ناقص التداخلات
export const totalFrames = (p: NewsProps) => {
  const scenes = [INTRO, ...p.items.map(itemFrames), OUTRO];
  return scenes.reduce((a, b) => a + b, 0) - TRANSITION * (scenes.length - 1);
};

// بداية كل مشهد على الخط الزمني (للصوت والشريط العلوي)
export const sceneStarts = (p: NewsProps) => {
  const scenes = [INTRO, ...p.items.map(itemFrames), OUTRO];
  const starts: number[] = [];
  let t = 0;
  for (const s of scenes) {
    starts.push(t);
    t += s - TRANSITION;
  }
  return starts;
};
