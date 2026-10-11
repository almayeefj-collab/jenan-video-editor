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
  title: 'لقاءات ولقطات',
  sub: 'في المؤتمر التربوي السادس والأربعين',
  seconds: 6.8,
};

export const conferenceShots: Shot[] = [
  // ── ١) الانترو ──
  {src: 'footage/group-b.mp4', from: 0, to: 2.3, volume: 0},
  {src: 'footage/group-c.mp4', from: 0.3, to: 2.6, volume: 0, enter: 'cut'},
  {src: 'footage/group-a.mp4', from: 0.3, to: 3, volume: 0, enter: 'cut'},

  // ── ٢) د. خالد المخلف: أهم كلامه عن الوفود، ولقطات الشباب فوق صوته ──
  {src: 'footage/mukhlif.mp4', from: 14.5, to: 25.5, volume: V, enter: 'wipe',
    cutaways: [{src: 'footage/group-a.mp4', from: 3, at: 7.8, dur: 1.8}],
    overlays: [
      {kind: 'lowerThird', name: 'د. خالد المخلف', role: 'رئيس لجنة الوفود الخارجية ومدير فرع الجهراء', at: 0.5, dur: 6, bottom: LT_BOTTOM},
    ]},
  {src: 'footage/mukhlif.mp4', from: 37, to: 46.75, volume: V, enter: 'cut', zoom: 1.1,
    cutaways: [
      {src: 'footage/group-b.mp4', from: 2.4, at: 1.6, dur: 3},
      {src: 'footage/group-c.mp4', from: 2.8, at: 5.8, dur: 3.2},
    ]},

  // ── ٣) سؤال المحاضرين، ثم د. منال القحطاني: المفهوم، أول آلية، والخلاصة ──
  {src: 'footage/ws-niqab.mp4', from: 32, to: 41.4, volume: V, enter: 'wipe',
    overlays: [
      {kind: 'question', ...BAR, mode: 'full', exitAt: 3.3},
      {kind: 'lowerThird', name: 'د. منال حزام القحطاني', role: 'وكيلة مدرسة — وزارة التعليم السعودية', at: 3.6, dur: 5.6, bottom: LT_BOTTOM},
    ]},
  {src: 'footage/ws-niqab.mp4', from: 103.3, to: 109.15, volume: V, enter: 'cut', zoom: 1.1},
  {src: 'footage/ws-niqab.mp4', from: 173.3, to: 180.5, volume: V, enter: 'cut'},

  // ── ٤) أ. بشرى البوسعيدية من سلطنة عُمان ──
  {src: 'footage/ws-green.mp4', from: 71.22, to: 78.2, volume: V, enter: 'wipe',
    overlays: [
      {kind: 'lowerThird', name: 'أ. بشرى بنت حمود البوسعيدية', role: 'رئيسة قسم العلوم الاجتماعية — كلية البيان', extra: 'وزارة التعليم — سلطنة عُمان', at: 1, dur: 5.8, bottom: LT_BOTTOM},
    ]},
  {src: 'footage/ws-green.mp4', from: 84.6, to: 90.75, volume: V, enter: 'cut', zoom: 1.1},

  // ── ٥) د. موسى جعفر يوسف: البحث الإجرائي ──
  {src: 'footage/ws-suit.mp4', from: 15, to: 20.95, volume: V, enter: 'wipe',
    overlays: [
      {kind: 'lowerThird', name: 'د. موسى جعفر يوسف', role: 'أستاذ الدراسات التربوية المساعد', at: 0.3, dur: 5.5, bottom: LT_BOTTOM},
    ]},
  {src: 'footage/ws-suit.mp4', from: 24.3, to: 36.15, volume: V, enter: 'cut', zoom: 1.1},
  {src: 'footage/ws-suit.mp4', from: 87.5, to: 94.35, volume: V, enter: 'cut'},

  // ── ٦) الأوترو: لقطة الشباب بتدرج سينمائي والشعار في النص ──
  {src: 'footage/group-b.mp4', from: 0, to: 5.4, volume: 0, enter: 'wipe', grade: true,
    overlays: [{kind: 'outro', logo: LOGO}]},
];
