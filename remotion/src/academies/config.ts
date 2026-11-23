// بيانات فيديو أكاديميات جمعية المعلمين الكويتية
// اللقطات من مجلد الدرايف «فيديوهات الاكاديميات للعمل الاعلامي»، محولة لـ 1080p/30 داخل public/footage/academies (ما ترفع للمستودع)
export const CLIP_DIR = 'footage/academies/';

// مدة كل لقطة بالفريمات داخل المقتطفات: بار كامل (69) أو نص بار (35/34) عشان القصات تجي على الإيقاع
export const PATTERN = [69, 69, 35, 34, 69, 69, 35, 34, 69, 69];

// [ملف، بداية اللقطة بالثواني]
export type Clip = [string, number];
export type Academy = {name: string; kicker: string; titleSize?: number; clips: Clip[]};

export const ACADEMIES: Academy[] = [
  {name: 'أكاديمية تكنو الرقمية', kicker: 'الأكاديمية الأولى', 
    clips: [['techno_C7011.mp4', 0.3], ['techno_C7027.mp4', 0.5], ['techno_C7142.mp4', 0.5], ['techno_C7139.mp4', 0.2], ['techno_C7143.mp4', 1.2],
      ['techno_C7582.mp4', 2], ['techno_C7133.mp4', 0.5], ['techno_C7141.mp4', 0.5], ['techno_C7591.mp4', 3], ['techno_C7592.mp4', 2]]},
  {name: 'أكاديمية التنمية والابتكار', kicker: 'الأكاديمية الثانية', 
    clips: [['dev_C7698.mp4', 0.5], ['dev_C7394.mp4', 1], ['dev_C7698.mp4', 5], ['dev_C7699.mp4', 1], ['dev_C7395.mp4', 2],
      ['dev_C7703.mp4', 0.5], ['dev_C7700.mp4', 0.2], ['dev_C7701.mp4', 1], ['dev_C7542.mp4', 2], ['dev_C7400.mp4', 0.5]]},
  {name: 'أكاديمية إعداد القادة', kicker: 'الأكاديمية الثالثة', 
    clips: [['lead_C7148.mp4', 0.5], ['lead_C7151.mp4', 1], ['lead_C7153.mp4', 6], ['lead_C7531.mp4', 0.5], ['lead_C7232.mp4', 3],
      ['lead_C7538.mp4', 3], ['lead_C7528.mp4', 0.5], ['lead_C7535.mp4', 0.3], ['lead_C7540.mp4', 10.5], ['lead_C7202.mp4', 1.5]]},
];
