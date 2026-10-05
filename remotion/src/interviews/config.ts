import {z} from 'zod';

// كل الإعدادات اللي تتغير من فيديو لفيديو هنا: الألوان، المقاطع، الأسئلة، الشعار.
// المسارات نسبة لمجلد public/
export const brandSchema = z.object({
  primary: z.string(), // اللون الأساسي (خلفيات الكروت والانتقالات)
  secondary: z.string(), // لون ثانوي
  accent: z.string(), // لون التمييز (الخطوط والتفاصيل)
  text: z.string(),
  fontFile: z.string(),
});

export const segmentSchema = z.object({
  question: z.string(),
  teacher: z.string(),
  role: z.string().optional(), // مثلاً: معلمة رياضيات - مدرسة ...
  clip: z.string(),
  trimStart: z.number().optional(), // بالثواني
  trimEnd: z.number().optional(), // بالثواني (من بداية المقطع)
});

export const interviewSchema = z.object({
  brand: brandSchema,
  intro: z.object({
    drone: z.string(),
    lobby: z.string(),
    title: z.string(),
    subtitle: z.string(),
  }),
  segments: z.array(segmentSchema),
  outro: z.object({
    logo: z.string(),
    text: z.string(),
    handle: z.string(),
    seconds: z.number(),
  }),
  music: z.string().optional(),
  musicVolume: z.number(),
  // تُحسب تلقائياً من المقاطع، لا تعدلها
  durations: z.record(z.string(), z.number()).optional(),
});

export type InterviewProps = z.infer<typeof interviewSchema>;
export type Brand = z.infer<typeof brandSchema>;

export const FPS = 30;
export const TRANSITION_FRAMES = 24;

// ⚠️ ألوان مؤقتة — تتبدل بألوان الهوية البصرية لجمعية المعلمين الكويتية
export const defaultInterviewProps: InterviewProps = {
  brand: {
    primary: '#0B2A4A',
    secondary: '#123E6B',
    accent: '#C9A227',
    text: '#FFFFFF',
    fontFile: 'fonts/Cairo.ttf',
  },
  intro: {
    drone: 'footage/drone.mp4',
    lobby: 'footage/lobby.mp4',
    title: 'جمعية المعلمين الكويتية',
    subtitle: 'مركز عبدالله السالم الثقافي',
  },
  segments: [
    {
      question: 'ما الذي ألهمك لاختيار مهنة التعليم؟',
      teacher: 'أ. اسم المعلم',
      role: 'معلم - مدرسة ...',
      clip: 'footage/teacher1.mp4',
    },
    {
      question: 'ما رسالتك للمعلمين الجدد؟',
      teacher: 'أ. اسم المعلمة',
      role: 'معلمة - مدرسة ...',
      clip: 'footage/teacher2.mp4',
    },
  ],
  outro: {
    logo: 'brand/logo-placeholder.svg',
    text: 'شكراً لكل معلم ومعلمة',
    handle: '@kuwait_teachers',
    seconds: 5,
  },
  musicVolume: 0.12,
};
