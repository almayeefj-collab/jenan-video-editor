// فيديو تذكير «بصمة التواجد» — فتح تطبيق وزارة التربية بالأمر الصوتي (سيري)
// المدة الكلية ١٧ ثانية. الأوقات بالفريمات على ٣٠ فريم/ثانية

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const TRANSITION = 16; // zoomBlur بين المشاهد

export const NAVY = '#0B2A55';
export const INK = '#06142C';
export const GOLD = '#E9C893';
export const GOLD_DEEP = '#E0A851';
export const SKY = '#7FB6F0';
export const GREEN = '#3DDC97';

// المقطع المصوّر: شاشة الجوال من فوق (538x760)، محوّل لـ ٣٠ فريم مع تنظيف الصوت
export const FOOTAGE = 'footage/attendance-siri.mp4';
export const FOOTAGE_FROM = 2.8; // ثانية بداية القص من المقطع الأصلي
export const FOOTAGE_TO = 14.5; // قبل الشاشة السودا في آخر المقطع

// مدد المشاهد قبل احتساب تداخل الانتقالات
export const INTRO = 84;
export const CLIP = Math.round((FOOTAGE_TO - FOOTAGE_FROM) * FPS);
export const OUTRO = 107;

export const CLIP_START = INTRO - TRANSITION;
export const OUTRO_START = CLIP_START + CLIP - TRANSITION;
export const totalFrames = () => OUTRO_START + OUTRO; // = 510 (١٧ ثانية)

// لحظات داخل المقطع (ثواني من المقطع الأصلي) محوّلة لفريم على الخط الزمني
export const atSource = (sec: number) => CLIP_START + Math.round((sec - FOOTAGE_FROM) * FPS);
export const SPEECH = [atSource(3.75), atSource(9.15)] as const; // الأمر الصوتي
export const SIRI = atSource(9.3); // توهج سيري على الشاشة
export const APP_OPEN = atSource(10.6); // يفتح تطبيق وزارة التربية
