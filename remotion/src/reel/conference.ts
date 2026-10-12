// إعدادات ريل «لقاءات ولقطات» — المؤتمر التربوي السادس والأربعون (نسخة دقيقة ونص: أهم النقاط بس)
// كل الأوقات بالثواني، والمسارات نسبة لمجلد public/ (نفس هوية ريل المعلمين ومكوّناته)
import {LOGO, type Shot} from './config';

const V = 1; // صوت المقابلات (منظّف بـ tools/clean_speech.sh)

const Q_TITLE = 'ورش المؤتمر';
const Q = 'شنو محاور ورشتك في المؤتمر التربوي السادس والأربعين؟';
const BAR = {label: Q_TITLE, text: Q, y: 1600} as const;
const LT_BOTTOM = 255; // اسم المتحدث تحت

// الانترو: لقطة وحدة للمبنى من برا والعنوان ينكتب فوقها
export const CONFERENCE_INTRO = {
  kind: 'typewriter' as const,
  title: 'لقاءات',
  sub: 'من المؤتمر التربوي السادس والأربعين',
  seconds: 5.9,
};

export const conferenceShots: Shot[] = [
  // ── ١) الانترو: لقطة وحدة ──
  {src: 'footage/exterior.mp4', from: 0.2, to: 6.2, volume: 0},

  // ── ٢) د. خالد المخلف: أهم كلامه عن الوفود، ولقطات الشباب فوق صوته ──
  {src: 'footage/mukhlif.mp4', from: 14.5, to: 25.5, volume: V, enter: 'wipe',
    cutaways: [{src: 'footage/group-a.mp4', from: 2.6, at: 7.6, dur: 2.2}],
    overlays: [
      {kind: 'lowerThird', name: 'د. خالد المخلف', role: 'رئيس لجنة الوفود الخارجية ومدير فرع الجهراء', at: 0.5, dur: 6, bottom: LT_BOTTOM},
    ]},
  {src: 'footage/mukhlif.mp4', from: 37, to: 46.75, volume: V, enter: 'cut', zoom: 1.1,
    cutaways: [{src: 'footage/group-c.mp4', from: 2.8, at: 3, dur: 3.2}]},

  // ── ٣) سؤال المحاضرين، ثم د. منال القحطاني: التقويم التكويني التشاركي ومن يشارك فيه ──
  {src: 'footage/ws-niqab.mp4', from: 32, to: 61.5, volume: V, enter: 'wipe',
    overlays: [
      {kind: 'question', ...BAR, mode: 'full', exitAt: 3.3},
      {kind: 'lowerThird', name: 'د. منال حزام القحطاني', role: 'وكيلة مدرسة — وزارة التعليم السعودية', at: 3.6, dur: 6, bottom: LT_BOTTOM},
    ]},

  // ── ٤) أ. بشرى البوسعيدية: المذيعة تسألها عن موضوعها، ثم كلامها لين «بالمشاركة»
  //    ويكمل من المقطع الثاني «لمناقشة ورقة بحث علمية…» لين نتيجة الدراسة ──
  {src: 'footage/ws-green.mp4', from: 63.6, to: 87.9, volume: V, enter: 'wipe', audioOut: 4,
    overlays: [
      {kind: 'lowerThird', name: 'أ. بشرى بنت حمود البوسعيدية', role: 'رئيسة قسم العلوم الاجتماعية — كلية البيان', extra: 'وزارة التعليم — سلطنة عُمان', at: 8.2, dur: 6.5, bottom: LT_BOTTOM},
    ]},
  // المقطع الثاني يندمج بتلاشي ناعم، ومكبّر ومزاح عشان تطابق مكانها في المقطع الأول
  {src: 'footage/bushra2.mp4', from: 0, to: 14.7, volume: V, enter: 'fade', zoom: 1.13, shift: [-70, -110]},

  // ── ٥) أ. محمد البراك: ورشة الشخصية القيادية ──
  {src: 'footage/barrak.mp4', from: 0, to: 13.75, volume: V, enter: 'wipe',
    overlays: [
      {kind: 'lowerThird', name: 'أ. محمد البراك', role: 'رئيس شعبة المواد الفلسفية — ثانوية أحمد العدواني', at: 0.4, dur: 6, bottom: LT_BOTTOM},
    ]},

  // ── ٦) الأوترو: خلفية الهوية الكحلية والشعار في النص (لقطة الشباب الثلاثة تطلع مرة وحدة بس في الانترو) ──
  {from: 0, to: 5.4, volume: 0, enter: 'wipe',
    overlays: [{kind: 'outro', logo: LOGO}]},
];
