// سلسلة «ChatGPT بسهولة» — حلقات قصيرة عمودية تعلّم ChatGPT خطوة بخطوة
// كل حلقة: افتتاحية ← خطوات (كل خطوة فيها محادثة حيّة) ← الخلاصة ← تابعني
// لإضافة حلقة جديدة: انسخ أي حلقة وعدّل النصوص، وتنضاف تلقائياً كـ ChatGPTEp<رقم>

import type {Art} from '../ainews/Illustrations';

export type Step = {
  title: string; // عنوان الخطوة
  prompt: string; // اللي تكتبه لـ ChatGPT
  reply: string; // رد مختصر يبيّن النتيجة
  tip: string; // نصيحة تحت المحادثة
};

export type Episode = {
  n: number;
  title: string; // عنوان الحلقة
  hook: string; // جملة الافتتاحية
  art: Art;
  steps: Step[];
  recap: string; // معادلة/خلاصة الحلقة
  next: string; // عنوان الحلقة الجاية
};

export const GREEN = '#10A37F';
export const GREEN_SOFT = '#C9F5E6';

export const episodes: Episode[] = [
  {
    n: 1,
    title: 'اكتب طلبك صح',
    hook: 'ليش ردود ChatGPT عندك عادية؟',
    art: 'chat',
    steps: [
      {
        title: 'حدد له دور',
        prompt: 'تخيّل إنك خبير تسويق بالسوشيال ميديا',
        reply: 'أكيد! أنا جاهز أساعدك كخبير تسويق.',
        tip: 'الدور يخلي الرد أذكى وأدق',
      },
      {
        title: 'اشرح المهمة بوضوح',
        prompt: 'اكتب لي 5 أفكار ريلز عن القهوة المختصة',
        reply: '1. يوم كامل مع باريستا  2. الفرق بين الحبوب…',
        tip: 'كل ما كنت أوضح، كان الرد أحسن',
      },
      {
        title: 'حدد شكل الرد',
        prompt: 'بنقاط قصيرة، وباللهجة الكويتية',
        reply: '• شلون تسوي V60 بالبيت؟  • قهوة الصبح غير…',
        tip: 'قوله الشكل اللي تبيه بالضبط',
      },
      {
        title: 'عدّل لين يضبط',
        prompt: 'حلو! بس خلها أقصر وأقوى',
        reply: 'تم! هذي نسخة أقصر وأقوى…',
        tip: 'كمّل المحادثة معاه، مو مرة وحدة',
      },
    ],
    recap: 'دور + مهمة + شكل = رد ممتاز',
    next: 'ارفع صورة واسأل عنها',
  },
  {
    n: 2,
    title: 'ارفع صورة واسأل',
    hook: 'ChatGPT يشوف الصور بعد!',
    art: 'image',
    steps: [
      {
        title: 'اضغط + وارفع صورة',
        prompt: '[صورة نبتة] وش اسم هالنبتة؟',
        reply: 'هذي نبتة البوتس، تحب الضوء غير المباشر.',
        tip: 'من الكاميرا أو من الاستوديو',
      },
      {
        title: 'طلّع النص من الصورة',
        prompt: '[صورة ورقة] اكتب لي النص مرتب',
        reply: 'هذا النص مرتب ومقسم لفقرات…',
        tip: 'ينفع للملاحظات والفواتير والسبورة',
      },
      {
        title: 'خلها فكرة محتوى',
        prompt: '[صورة] اكتب لي كابشن انستغرام',
        reply: 'لحظات بسيطة… بس تسوى الدنيا كلها',
        tip: 'جرّب تطلب أكثر من خيار',
      },
    ],
    recap: 'صورة + سؤال = جواب فوري',
    next: 'تكلم معاه بصوتك',
  },
  {
    n: 3,
    title: 'تكلم معاه بصوتك',
    hook: 'لا تكتب… تكلم!',
    art: 'voice',
    steps: [
      {
        title: 'اضغط أيقونة الصوت',
        prompt: '(تتكلم) هلا! أبي أتعلم إنجليزي',
        reply: 'هلا والله! نبدأ بجمل المطار؟',
        tip: 'تلقاها جنب خانة الكتابة',
      },
      {
        title: 'تكلم عادي باللهجة',
        prompt: '(تتكلم) شلون أقول أبي أغير مقعدي؟',
        reply: 'Can I change my seat, please?',
        tip: 'يفهم اللهجة ويرد عليك بصوت',
      },
      {
        title: 'تدرّب معاه',
        prompt: '(تتكلم) خلنا نتدرب على مقابلة شغل',
        reply: 'تمام! أول سؤال: عرّفني عن نفسك',
        tip: 'تقدر تقاطعه وقت ما تبي',
      },
    ],
    recap: 'تكلم معاه كأنه صديق',
    next: 'خلّه يسوي لك جدولك',
  },
];

export const FPS = 30;
export const STEP_SEC = 7.5;
export const INTRO_SEC = 4;
export const RECAP_SEC = 4;
export const OUTRO_SEC = 4.5;

export const episodeFrames = (e: Episode, transition: number) => {
  const parts = [INTRO_SEC, ...e.steps.map(() => STEP_SEC), RECAP_SEC, OUTRO_SEC].map((s) => Math.round(s * FPS));
  return parts.reduce((a, b) => a + b, 0) - transition * (parts.length - 1);
};
