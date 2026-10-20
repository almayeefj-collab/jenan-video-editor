// فيديو تذكير «بصمة التواجد» — فتح تطبيق وزارة التربية بالأمر الصوتي (سيري)
// المدة الكلية ١٧ ثانية. الأوقات بالفريمات على ٣٠ فريم/ثانية

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const INK = '#041230';
export const GOLD = '#E9C893';
export const GOLD_DEEP = '#E0A851';
export const SKY = '#9CCBFF';
export const GREEN = '#3DDC97';

// شاشة الجوال مفرّغة من خلفيتها ومسطّحة (tools/track_phone_screen.py) — 600x1300 مع الصوت المنظّف
export const SCREEN = 'footage/attendance-screen.mp4';
export const VOICE = 'footage/attendance-voice.wav';
export const FOOTAGE_FROM = 2.8; // ثانية بداية القص من المقطع الأصلي
export const FOOTAGE_TO = 14.5; // قبل الشاشة السودا في آخر المقطع

export const PHONE_IN = 62; // الجوال يطلع من تحت ويبدأ المقطع
export const CLIP = Math.round((FOOTAGE_TO - FOOTAGE_FROM) * FPS);
export const OUTRO_START = PHONE_IN + CLIP; // الجوال ينزل ويطلع الأوترو
export const totalFrames = () => 510; // ١٧ ثانية

// لحظات داخل المقطع (ثواني من المقطع الأصلي) محوّلة لفريم على الخط الزمني
export const atSource = (sec: number) => PHONE_IN + Math.round((sec - FOOTAGE_FROM) * FPS);
export const SPEECH = [atSource(3.75), atSource(9.15)] as const; // الأمر الصوتي
export const SIRI = atSource(9.3); // توهج سيري على الشاشة
export const APP_OPEN = atSource(10.6); // يفتح تطبيق وزارة التربية
