// فيديو ورشة «المعلم 4.0»: قصة الثورات الصناعية من 1.0 إلى 4.0، ثم تطور المعلم بنفس المراحل
// الصور مولّدة بالذكاء الاصطناعي ومحفوظة في public/teacher4

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const TRANSITION = 18;

export type Era = {
  kind: 'era';
  track: 'industry' | 'teacher';
  step: 1 | 2 | 3 | 4;
  img: string;
  label: string; // الثورة الصناعية الأولى / المعلم 1.0
  tag: string; // السنة أو الدور
  title: string;
  points: string[];
  // تدرج لوني يناسب الحقبة
  grade: string;
  accent: string;
  pan: 'left' | 'right';
};

export type Scene =
  | {kind: 'intro'; img: string; sec: number}
  | {kind: 'chapter'; kicker: string; title: string; sub?: string; accent: string; sec: number}
  | (Era & {sec: number})
  | {kind: 'outro'; img: string; sec: number};

export const GOLD = '#E9B864';
export const CYAN = '#5FD4F4';
export const INK = '#060B16';

const ERA_SEC = 10;

export const scenes: Scene[] = [
  {kind: 'intro', img: 'teacher4/intro.jpg', sec: 7.5},

  {kind: 'chapter', kicker: 'الفصل الأول', title: 'رحلة الصناعة', sub: 'أربع ثورات غيّرت شكل العالم', accent: GOLD, sec: 4},
  {
    kind: 'era', track: 'industry', step: 1, img: 'teacher4/ind1.jpg', sec: ERA_SEC,
    label: 'الثورة الصناعية الأولى', tag: '1784',
    title: 'البخار والميكنة',
    points: ['الآلة البخارية تشغّل المصانع', 'الأنوال الميكانيكية بدل العمل اليدوي', 'ولادة المصنع الحديث'],
    grade: 'sepia(0.35) contrast(1.08) saturate(1.05)', accent: GOLD, pan: 'left',
  },
  {
    kind: 'era', track: 'industry', step: 2, img: 'teacher4/ind2.jpg', sec: ERA_SEC,
    label: 'الثورة الصناعية الثانية', tag: '1870',
    title: 'الكهرباء والإنتاج الضخم',
    points: ['الطاقة الكهربائية تضيء المصانع', 'خطوط التجميع', 'إنتاج كميات ضخمة بسرعة أعلى'],
    grade: 'sepia(0.15) contrast(1.1) saturate(1.05)', accent: GOLD, pan: 'right',
  },
  {
    kind: 'era', track: 'industry', step: 3, img: 'teacher4/ind3.jpg', sec: ERA_SEC,
    label: 'الثورة الصناعية الثالثة', tag: '1969',
    title: 'الحاسوب والأتمتة',
    points: ['الإلكترونيات وتقنية المعلومات', 'الروبوتات تدخل خطوط الإنتاج', 'التحكم المبرمج بالآلات'],
    grade: 'contrast(1.1) saturate(1.12)', accent: CYAN, pan: 'left',
  },
  {
    kind: 'era', track: 'industry', step: 4, img: 'teacher4/ind4.jpg', sec: ERA_SEC,
    label: 'الثورة الصناعية الرابعة', tag: 'اليوم',
    title: 'الذكاء الاصطناعي',
    points: ['الذكاء الاصطناعي والبيانات الضخمة', 'إنترنت الأشياء والمصانع الذكية', 'تكامل العالم الرقمي والمادي'],
    grade: 'contrast(1.1) saturate(1.2)', accent: CYAN, pan: 'right',
  },

  {kind: 'chapter', kicker: 'ومثلما تطوّرت الصناعة…', title: 'تطوّر المعلم', sub: 'من ناقلٍ للمعرفة إلى صانعٍ للمستقبل', accent: CYAN, sec: 5},
  {
    kind: 'era', track: 'teacher', step: 1, img: 'teacher4/t1.jpg', sec: ERA_SEC,
    label: 'المعلم 1.0', tag: 'ناقل المعرفة',
    title: 'السبورة والطباشير',
    points: ['المعلم هو المصدر الوحيد للمعرفة', 'التلقين والحفظ', 'الطالب متلقٍّ في الصفوف'],
    grade: 'sepia(0.3) contrast(1.08)', accent: GOLD, pan: 'left',
  },
  {
    kind: 'era', track: 'teacher', step: 2, img: 'teacher4/t2.jpg', sec: ERA_SEC,
    label: 'المعلم 2.0', tag: 'مستخدم الوسائل',
    title: 'الوسائل التعليمية',
    points: ['جهاز العرض العلوي والشفافيات', 'الوسائل السمعية والبصرية', 'تنويع طرق عرض الدرس'],
    grade: 'sepia(0.12) contrast(1.1) saturate(1.05)', accent: GOLD, pan: 'right',
  },
  {
    kind: 'era', track: 'teacher', step: 3, img: 'teacher4/t3.jpg', sec: ERA_SEC,
    label: 'المعلم 3.0', tag: 'المعلم الرقمي',
    title: 'الحاسوب والإنترنت',
    points: ['السبورة التفاعلية', 'الحواسيب والأجهزة اللوحية', 'المنصات والتعلم الإلكتروني'],
    grade: 'contrast(1.08) saturate(1.1)', accent: CYAN, pan: 'left',
  },
  {
    kind: 'era', track: 'teacher', step: 4, img: 'teacher4/t4.jpg', sec: ERA_SEC + 1,
    label: 'المعلم 4.0', tag: 'الميسّر والمصمّم',
    title: 'التعلّم الذكي',
    points: ['يوظّف الذكاء الاصطناعي والواقع الافتراضي', 'تعلّم مخصّص لكل طالب', 'يبني التفكير والإبداع والتعاون'],
    grade: 'contrast(1.1) saturate(1.2)', accent: CYAN, pan: 'right',
  },

  {kind: 'outro', img: 'teacher4/outro.jpg', sec: 9},
];

export const sceneFrames = (s: Scene) => Math.round(s.sec * FPS);

// بداية كل مشهد بعد احتساب تداخل الانتقالات
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
