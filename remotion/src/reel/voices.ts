// ريل «أصوات المؤتمر» — ثلاث مقابلات من المؤتمر التربوي السادس والأربعين
// نفس هوية ريل جمعية المعلمين (الشعار، الأسئلة، الأسماء، الموسيقى والانتقالات)
import {LOGO, type Overlay, type ReelSpec} from './config';

const V = 1; // صوت المقابلات (منظّف بـ tools/clean_speech.sh)
const LT_BOTTOM = 255; // اسم المتحدث تحت الأيادي وفوق منطقة كابشن إنستغرام

// الأسماء والمناصب — عدّلها هنا
const SPEAKERS = {
  pink: {name: 'أ. أحمد عبدالعزيز خالد', role: 'مدير الشؤون التعليمية في منطقة حولي التعليمية'},
  teacher: {name: 'أ. سهام مساعد الخالدي', role: 'مسؤولة بروتوكول التعاون المشترك بين جمعية المعلمين الكويتية ووزارة التربية'},
  ghutra: {name: 'أ. هادي بن حيدر', role: 'مراقب توجيه التربية الموسيقية بالتكليف في منطقة الجهراء التعليمية'},
};

const nameAt = (s: {name: string; role: string}): Overlay => ({kind: 'lowerThird', ...s, at: 1, dur: 6, bottom: LT_BOTTOM});

export const voicesReel: ReelSpec = {
  intro: {kind: 'title', sub: 'لقطات ولقاءات من', text: 'المؤتمر التربوي السادس والأربعين', seconds: 7},
  shots: [
    // ── الانترو: بنر المؤتمر مضبب تحت العنوان والعداد ──
    {src: 'footage/s2-teacher.mp4', from: 0, to: 7, volume: 0, blur: 14},

    // ── المقابلات بطولها الكامل ──
    {src: 'footage/s1-pink.mp4', from: 0, to: 29.3, volume: V, enter: 'wipe', overlays: [nameAt(SPEAKERS.pink)]},
    {src: 'footage/s2-teacher.mp4', from: 0, to: 14.9, volume: V, enter: 'wipe', overlays: [nameAt(SPEAKERS.teacher)]},
    {src: 'footage/s3-ghutra.mp4', from: 0, to: 23.9, volume: V, enter: 'wipe', overlays: [nameAt(SPEAKERS.ghutra)]},

    // ── الأوترو: البهو مضبب والشعار في النص ──
    {src: 'footage/s3-ghutra.mp4', from: 0, to: 6.5, volume: 0, enter: 'wipe', blur: 10, grade: true,
      overlays: [{kind: 'outro', logo: LOGO}]},
  ],
};
