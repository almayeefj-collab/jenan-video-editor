// شاشة فتح الشارة — سلسلة آخر أخبار الذكاء الاصطناعي
// كل الأوقات بالفريمات (30 فريم بالثانية)

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION = 240; // 8 ثواني

export const badgeUnlockSchema = {
  title: 'أخبار الذكاء الاصطناعي',
  subtitle: 'آخر المستجدات أولاً بأول',
  showCursor: true,
};
export type BadgeUnlockProps = typeof badgeUnlockSchema;

// التوقيت
export const T = {
  enter: 10, // الشارة تبدأ تطلع من العمق
  enterDur: 52,
  unlock: 62, // لحظة الفتح: وميض + موجة + جزيئات ذهب
  cursorIn: 84, // المؤشر يدخل والشارة تبدأ تميل له
  title: 74,
  subtitle: 96,
  sweep2: 176, // لمعة ثانية على وجه الشارة
};

// مكان الشارة وحجمها
export const BADGE = {
  cx: WIDTH / 2,
  cy: 800,
  size: 600,
  thickness: 40, // سماكة العملة بالبكسل
  maxTilt: 17, // أقصى ميلان بالدرجات
};

// الألوان الذهبية
export const GOLD = {
  hi: '#FFF6D8',
  light: '#F7DC92',
  mid: '#E2B451',
  deep: '#A8731F',
  dark: '#5E3A0C',
  glow: 'rgba(255, 200, 90, 1)',
};
