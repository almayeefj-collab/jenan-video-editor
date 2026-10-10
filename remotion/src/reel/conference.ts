// ريل «من وراء الكواليس» — المؤتمر التربوي السادس والأربعون
// مقاطع مختصرة من كل لقاء، وقبل كل مجموعة كرت سؤال يناسب أجوبتهم.
// كل الأوقات بالثواني داخل الملف الأصلي (بعد تنظيف الصوت بـ tools/clean_speech.sh)
import {FPS, type Overlay, type Shot} from './config';

const V = 1;
const LT_BOTTOM = 255;
// كرت السؤال الكبير في نص الشاشة فوق خلفية مضببة، ويطلع قبل نهاية اللقطة
const SLATE = 3.3;
const ask = (label: string, text: string): Overlay => ({kind: 'question', label, text, mode: 'full', y: 1600, exitAt: SLATE - 0.45});
const name = (n: string, role?: string): Overlay => ({kind: 'lowerThird', name: n, role, at: 0.4, dur: 5, bottom: LT_BOTTOM});
// القطع داخل نفس اللقاء: تقريب خفيف عشان يبين مقصود
const JUMP = 1.1;

const F = {
  presenter: 'footage/presenter-escalator.mp4',
  nafea: 'footage/ghutra-banner.mp4',
  hisham: 'footage/ghutra-windows.mp4',
  mashael: 'footage/niqab-banner.mp4',
  rashed: 'footage/lanyard-banner.mp4',
  nadia: 'footage/red-blazer.mp4',
  ahmad: 'footage/suit-seated.mp4', // أفقي 848×480 — يتقص من النص عشان يعبي الشاشة
  haila: 'footage/white-abaya.mp4',
};

export const conferenceShots: Shot[] = [
  // ── ١) الانترو: لقطات من المؤتمر غامقة تحت «المؤتمر التربوي» والعداد لين 46 والشعار ──
  {src: F.hisham, from: 0, to: 1.5, volume: 0, fx: 'dim'},
  {src: F.mashael, from: 20, to: 21.4, volume: 0, fx: 'dim', enter: 'cut'},
  {src: F.haila, from: 30, to: 31.4, volume: 0, fx: 'dim', enter: 'cut'},
  {src: F.rashed, from: 3, to: 4.4, volume: 0, fx: 'dim', enter: 'cut'},
  {src: F.nadia, from: 20, to: 21.4, volume: 0, fx: 'dim', enter: 'cut'},
  {src: F.nafea, from: 72, to: 73.6, volume: 0, fx: 'dim', enter: 'cut'},

  // ── ٢) التحضير والتنظيم ──
  {src: F.nafea, from: 20, to: 20 + SLATE, volume: 0, fx: 'slate', enter: 'wipe',
    overlays: [ask('التحضير والتنظيم', 'شلون كانت التحضيرات للمؤتمر من ورا الكواليس؟')]},
  {src: F.nafea, from: 59.4, to: 69.7, volume: V, enter: 'wipe',
    overlays: [name('أ. نافع الطوالة', 'رئيس اللجنة التحضيرية العليا للمؤتمر')]},
  {src: F.hisham, from: 20.6, to: 28.6, volume: V,
    overlays: [name('أ. هشام ملك', 'عضو مجلس إدارة جمعية المعلمين الكويتية')]},
  {src: F.rashed, from: 19.8, to: 30.3, volume: V,
    overlays: [name('أ. محمد الراشد', 'اللجنة المنظمة للمؤتمر')]},
  {src: F.mashael, from: 44.0, to: 53.95, volume: V,
    overlays: [name('أ. مشاعل العنزي', 'اللجنة المنظمة للمؤتمر')]},

  // ── ٣) الورش ──
  {src: F.nadia, from: 0, to: SLATE, volume: 0, fx: 'slate', enter: 'wipe',
    overlays: [ask('الورش', 'شلون اخترتوا الورش؟ وشنو قدّمت للمعلم؟')]},
  {src: F.nadia, from: 29.8, to: 43.3, volume: V, enter: 'wipe',
    overlays: [name('د. نادية الرياحي', 'اللجنة الفنية — كلية التربية، جامعة الكويت')]},
  {src: F.nadia, from: 49.3, to: 53.4, volume: V, zoom: JUMP},
  {src: F.ahmad, from: 5.0, to: 15.5, volume: V,
    overlays: [name('أ. أحمد غلاييني', 'مدير ثانوية عمر بن الخطاب — المقاصد، لبنان')]},

  // ── ٤) الانطباع ──
  {src: F.haila, from: 0, to: SLATE, volume: 0, fx: 'slate', enter: 'wipe',
    overlays: [ask('انطباع', 'شنو انطباعك عن المؤتمر هالسنة؟')]},
  {src: F.haila, from: 45.4, to: 55.1, volume: V, enter: 'wipe',
    overlays: [name('أ. هيلاء التنيب')]},
  {src: F.haila, from: 81.0, to: 97.42, volume: V, zoom: JUMP},

  // ── ٥) الأوترو: المذيعة تختم، بعدين الشعار على خلفية الهوية ──
  {src: F.presenter, from: 1.9, to: 15.0, volume: V, enter: 'wipe'},
  {from: 0, to: 5, volume: 0, enter: 'fade', overlays: [{kind: 'outro', logo: 'brand/kts-logo.png', at: 0.5}]},
];

export const CONFERENCE_LOCKUP = {
  title: 'المؤتمر التربوي',
  to: 46,
  sub: 'رؤى ابتكارية لمستقبل تعليمي مستدام في الكويت',
  frames: Math.round(8.7 * FPS),
};
