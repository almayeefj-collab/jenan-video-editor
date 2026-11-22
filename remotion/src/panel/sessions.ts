// بيانات الجلسات الحوارية — كل جلسة: عنوانها، المحاورة، الضيوف (أسماءهم وصفاتهم كما على شاشة القاعة)
// وجهة كل واحد على المسرح (عشان اسمه يطلع بجهته)، ومجلد صورها في public/ (ما ترفع للمستودع).
export type Person = {
  name: string;
  role: string;      // تحت الاسم في الفيديو
  postRole: string;  // تحت الاسم في بوست انستغرام (يقبل \n)
  side: 'left' | 'right';
  pos: string;       // object-position لصورة الوجه في البوست
};

export type Session = {
  kicker: string;
  title: string;
  titleLines: [string, string]; // للبوست: سطر أبيض + سطر ذهبي
  event: string;
  dir: string;      // مجلد اللقطات والصور داخل public/
  postBg: string;   // خلفية البوستات
  host: string;
  guests: string[]; // بالترتيب من يمين البوست
  people: Record<string, Person>;
};

const EVENT = 'مؤتمر الكويت الدولي الأول للتدريب والتطوير';
const HOST: Person = {name: 'أ. إلهام دكسن', role: 'محاورة الجلسة', postRole: 'مهتمة في صحة الدماغ', side: 'right', pos: '35% 30%'};

export const SESSIONS = {
  // «الصحة النفسية بين الانهيار والتكيف» — 05.mp4
  mental: {
    kicker: 'الجلسة الحوارية',
    title: 'الصحة النفسية بين الانهيار والتكيف',
    titleLines: ['الصحة النفسية', 'بين الانهيار والتكيف'],
    event: EVENT,
    dir: 'footage/panel',
    postBg: 'footage/panel/bg05.jpg',
    host: 'host',
    guests: ['hakami', 'jaza'],
    people: {
      host: HOST,
      jaza: {name: 'د. أحمد جزا المطيري', role: 'رئيس جمعية علم النفس الكويتية', postRole: 'رئيس جمعية علم النفس\nالكويتية', side: 'left', pos: '50% 25%'},
      hakami: {name: 'د. إبراهيم الحكمي', role: 'رئيس جمعية علم النفس — الشرق الأوسط', postRole: 'رئيس جمعية علم النفس\nالشرق الأوسط', side: 'right', pos: '50% 25%'},
    },
  },
  // «التعافي بداية جديدة: من النجاة إلى العطاء»
  najah: {
    kicker: 'الجلسة الحوارية',
    title: 'التعافي بداية جديدة: من النجاة إلى العطاء',
    titleLines: ['التعافي بداية جديدة', 'من النجاة إلى العطاء'],
    event: EVENT,
    dir: 'footage/panel/najah',
    postBg: 'footage/panel/najah/bg02.jpg',
    host: 'host',
    guests: ['hessa', 'badr', 'afrah'],
    people: {
      host: HOST,
      hessa: {name: 'أ. حصة البرجس', role: 'متعافية', postRole: 'متعافية', side: 'right', pos: '50% 30%'},
      badr: {name: 'أ. بدر الفضلي', role: 'رئيس فريق الخطوة الأولى', postRole: 'رئيس فريق\nالخطوة الأولى', side: 'left', pos: '50% 25%'},
      afrah: {name: 'أ. أفراح الخراز', role: 'نائب رئيس فريق الخطوة الأولى', postRole: 'نائب رئيس فريق\nالخطوة الأولى', side: 'left', pos: '80% 35%'},
    },
  },
} satisfies Record<string, Session>;

export type SessionKey = keyof typeof SESSIONS;
export const getSession = (k: SessionKey = 'mental'): Session => SESSIONS[k];
