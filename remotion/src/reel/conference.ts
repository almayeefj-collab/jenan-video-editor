// إعدادات ريل «لقاءات ولقطات» — المؤتمر التربوي السادس والأربعون (نسخة دقيقة ونص: أهم النقاط بس)
// كل الأوقات بالثواني، والمسارات نسبة لمجلد public/ (نفس هوية ريل المعلمين ومكوّناته)
import {LOGO, type Shot} from './config';

const V = 1; // صوت المقابلات (منظّف بـ tools/clean_speech.sh)

const Q_TITLE = 'ورش المؤتمر';
const Q = 'شنو محاور ورشتك في المؤتمر التربوي السادس والأربعين؟';
const BAR = {label: Q_TITLE, text: Q, y: 1600} as const;
const LT_BOTTOM = 255; // اسم المتحدث تحت

// الانترو: لقطات الشباب الواقفين والعنوان ينكتب فوقها
export const CONFERENCE_INTRO = {
  kind: 'typewriter' as const,
  title: 'لقاءات',
  sub: 'من المؤتمر التربوي السادس والأربعين',
  seconds: 6.8,
};

export const conferenceShots: Shot[] = [
  // ── ١) الانترو ──
  {src: 'footage/group-b.mp4', from: 0, to: 2.3, volume: 0},
  {src: 'footage/group-c.mp4', from: 0.3, to: 2.6, volume: 0, enter: 'cut'},
  {src: 'footage/group-a.mp4', from: 0.3, to: 2.6, volume: 0, enter: 'cut'},

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

  // ── ٤) أ. بشرى البوسعيدية: المذيعة تسألها عن موضوعها (المشكلات المتعددة) وكلامها كامل
  //    لين آخر كلمة في التصوير («لنبرز أبرز…» — المقطع الأصلي ينتهي هنا) ──
  {src: 'footage/ws-green.mp4', from: 63.6, to: 93.75, volume: V, enter: 'wipe',
    overlays: [
      {kind: 'lowerThird', name: 'أ. بشرى بنت حمود البوسعيدية', role: 'رئيسة قسم العلوم الاجتماعية — كلية البيان', extra: 'وزارة التعليم — سلطنة عُمان', at: 8.2, dur: 6.5, bottom: LT_BOTTOM},
    ]},

  // ── ٥) أ. محمد البراك: ورشة الشخصية القيادية ──
  {src: 'footage/barrak.mp4', from: 0, to: 13.75, volume: V, enter: 'wipe',
    overlays: [
      {kind: 'lowerThird', name: 'أ. محمد البراك', role: 'رئيس شعبة المواد الفلسفية — ثانوية أحمد العدواني', at: 0.4, dur: 6, bottom: LT_BOTTOM},
    ]},

  // ── ٦) الأوترو: خلفية الهوية الكحلية والشعار في النص (لقطة الشباب الثلاثة تطلع مرة وحدة بس في الانترو) ──
  {from: 0, to: 5.4, volume: 0, enter: 'wipe',
    overlays: [{kind: 'outro', logo: LOGO}]},
];
