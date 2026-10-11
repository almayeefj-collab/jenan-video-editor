// إعدادات ريل «لقاءات ولقطات» — المؤتمر التربوي السادس والأربعون
// كل الأوقات بالثواني، والمسارات نسبة لمجلد public/ (نفس هوية ريل المعلمين ومكوّناته)
import {LOGO, type Shot} from './config';

const V = 1; // صوت المقابلات (منظّف بـ tools/clean_speech.sh)

const Q_TITLE = 'ورش المؤتمر';
const Q = 'شنو محاور ورشتك في المؤتمر التربوي السادس والأربعين؟';
const BAR = {label: Q_TITLE, text: Q, y: 1600} as const;
const LT_BOTTOM = 255; // اسم المتحدث تحت، والسؤال ينزل يفسح له المكان

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

  // ── ٢) د. خالد المخلف كامل، ولقطات الشباب فوق كلامه عن الوفود ──
  {src: 'footage/mukhlif.mp4', from: 0, to: 47, volume: V, enter: 'wipe',
    cutaways: [
      {src: 'footage/group-a.mp4', from: 3, at: 15, dur: 1.8},
      {src: 'footage/group-b.mp4', from: 2.4, at: 22.3, dur: 3},
      {src: 'footage/group-c.mp4', from: 2.8, at: 29, dur: 3.2},
    ],
    overlays: [
      {kind: 'lowerThird', name: 'د. خالد المخلف', role: 'رئيس لجنة الوفود الخارجية ومدير فرع الجهراء', at: 0.8, dur: 6.5, bottom: LT_BOTTOM},
    ]},

  // ── ٣) سؤال المحاضرين: د. منال العاصمي (أهم النقاط) ──
  {src: 'footage/ws-niqab.mp4', from: 0, to: 31.95, volume: V, enter: 'wipe',
    overlays: [
      {kind: 'question', ...BAR, mode: 'full', exitAt: 3.3},
      {kind: 'lowerThird', name: 'د. منال بنت حزان العاصمي', role: 'ورشة: التقويم التكويني التشاركي واستدامة أثر التدريب', at: 3.6, dur: 6.5, bottom: LT_BOTTOM},
      {kind: 'question', ...BAR, mode: 'inline', quiet: true, at: 10.4},
    ]},
  {src: 'footage/ws-niqab.mp4', from: 32, to: 64.2, volume: V, enter: 'cut', zoom: 1.1,
    overlays: [{kind: 'question', ...BAR, mode: 'docked'}]},
  {src: 'footage/ws-niqab.mp4', from: 173.3, to: 185.9, volume: V, enter: 'cut',
    overlays: [{kind: 'question', ...BAR, mode: 'docked', exitAt: 11.8}]},

  // ── ٤) بشرى البوسعيدي من سلطنة عُمان: المذيعة تعرّف فيها ثم كلامها ──
  {src: 'footage/ws-green.mp4', from: 25.5, to: 36.35, volume: V, enter: 'wipe',
    overlays: [{kind: 'question', ...BAR, mode: 'inline', quiet: true, at: 0.6}]},
  {src: 'footage/ws-green.mp4', from: 71.22, to: 90.75, volume: V, enter: 'cut',
    overlays: [
      {kind: 'question', ...BAR, mode: 'docked', hide: [2, 8.8], exitAt: 18.8},
      {kind: 'lowerThird', name: 'بشرى البوسعيدي', role: 'سلطنة عُمان', at: 2.2, dur: 6.3, bottom: LT_BOTTOM},
    ]},

  // ── ٥) د. موسى فتيل: البحث الإجرائي (أهم النقاط) ──
  {src: 'footage/ws-suit.mp4', from: 3.2, to: 20.95, volume: V, enter: 'wipe',
    overlays: [
      {kind: 'lowerThird', name: 'د. موسى فتيل', role: 'أستاذ الدراسات التربوية المساعد — جامعة البحرين', extra: 'ورشة: البحث الإجرائي مدخل لتطوير العملية التعليمية', at: 0.4, dur: 7, bottom: LT_BOTTOM},
      {kind: 'question', ...BAR, mode: 'inline', quiet: true, at: 7.8},
    ]},
  {src: 'footage/ws-suit.mp4', from: 21, to: 44.9, volume: V, enter: 'cut', zoom: 1.1,
    overlays: [{kind: 'question', ...BAR, mode: 'docked'}]},
  {src: 'footage/ws-suit.mp4', from: 60.2, to: 69.1, volume: V, enter: 'cut',
    overlays: [{kind: 'question', ...BAR, mode: 'docked'}]},
  {src: 'footage/ws-suit.mp4', from: 76.2, to: 94.15, volume: V, enter: 'cut', zoom: 1.1,
    overlays: [{kind: 'question', ...BAR, mode: 'docked', exitAt: 17.2}]},

  // ── ٦) الأوترو: لقطة الشباب بتدرج سينمائي والشعار في النص ──
  {src: 'footage/group-b.mp4', from: 0, to: 5.4, volume: 0, enter: 'wipe', grade: true,
    overlays: [{kind: 'outro', logo: LOGO}]},
];
