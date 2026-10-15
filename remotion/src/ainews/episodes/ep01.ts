import type {Episode} from '../types';

// الحلقة ١ — ١٥ أكتوبر ٢٠٢٦
// المصادر: ChatGPT release notes (help.openai.com)، TechCrunch و MacRumors (٧ أكتوبر)،
// Gemini release notes (gemini.google) و HPCwire (١٤ أكتوبر)
const D = 'ainews/ep01';

export const ep01: Episode = {
  number: 1,
  date: '١٥ أكتوبر ٢٠٢٦',
  music: `${D}/music.mp3`,
  scenes: [
    {kind: 'hook', image: `${D}/s0.jpg`, voice: `${D}/v0.mp3`, dur: 5.3,
      title: 'آخر أخبار أدوات الذكاء الاصطناعي', sub: 'مع جنان المعييف'},
    {kind: 'news', image: `${D}/s1.jpg`, voice: `${D}/v1.mp3`, dur: 11.9, tag: 'ChatGPT',
      title: 'GPT-6 وصل', sub: 'إجابات مرئية وتفاعلية، ويبدأ يجاوبك وهو للحين يفكر'},
    {kind: 'news', image: `${D}/s2.jpg`, voice: `${D}/v2.mp3`, dur: 10.1, tag: 'ChatGPT',
      title: 'ارفع تسجيل صوتي', sub: 'تفريغ + ملخص، واسأله عن أي شي في الاجتماع أو المحاضرة'},
    {kind: 'news', image: `${D}/s3.jpg`, voice: `${D}/v3.mp3`, dur: 6.5, tag: 'ChatGPT',
      title: 'زر Try on', sub: 'ارفع سيلفي وشوف الملابس عليك قبل لا تشتري'},
    {kind: 'news', image: `${D}/s4.jpg`, voice: `${D}/v4.mp3`, dur: 5.9, tag: 'Gemini',
      title: 'Gemini 4 Argon', sub: 'متوفر الحين لمشتركي Google AI Pro و Ultra'},
  ],
  outro: {image: `${D}/s0.jpg`, voice: `${D}/v5.mp3`, dur: 7},
};
