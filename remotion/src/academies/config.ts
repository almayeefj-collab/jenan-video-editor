// بيانات فيديو أكاديميات جمعية المعلمين الكويتية
// اللقطات من مجلد الدرايف «فيديوهات الاكاديميات للعمل الاعلامي»، محولة لـ 1080p/30 داخل public/footage/academies (ما ترفع للمستودع)
export const CLIP_DIR = 'footage/academies/';

// مدة كل لقطة بالفريمات داخل المقتطفات: بار كامل (69) أو نص بار (35/34) عشان القصات تجي على الإيقاع
export const PATTERN = [69, 69, 35, 34, 69, 69, 35, 34, 69, 69];

// [ملف، بداية اللقطة بالثواني]
export type Clip = [string, number];
export type Academy = {name: string; kicker: string; titleSize?: number; clips: Clip[]};

export const ACADEMIES: Academy[] = [
  {name: 'أكاديمية تكنو الرقمية', kicker: 'الأكاديمية الأولى', clips: []},
  {name: 'أكاديمية التنمية والابتكار', kicker: 'الأكاديمية الثانية', clips: []},
  {name: 'أكاديمية إعداد القادة', kicker: 'الأكاديمية الثالثة', clips: []},
];
