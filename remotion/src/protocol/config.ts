// بيانات فيديو «بروتوكول التعاون المشترك بين جمعية المعلمين الكويتية ووزارة التربية»
// اللقطات من مجلد الدرايف «فيديوهات بروتوكول التعاون مع وزارة التربية» (3 و5 و12 و19 نوفمبر) بالترتيب الزمني،
// كل لقطة من أثبت جزء بالمقطع (tools/shake_profile.py + tools/academies_shots.py)، محولة لـ 1080p/30 داخل public/footage/protocol
import type {Academy, Shot} from '../academies/config';

export const CLIP_DIR = 'footage/protocol/';
export const TITLE_1 = 'بروتوكول التعاون المشترك';
export const TITLE_2 = 'بين جمعية المعلمين الكويتية ووزارة التربية';
export const SUBTITLE = 'مقتطفات من الدورات التدريبية';
export const OUTRO_TAG = 'بروتوكول التعاون المشترك مع وزارة التربية';

// لقطات متتالية من نفس المقطع مدموجة بلقطة وحدة متصلة (بدون قص بنفس المشهد)
const SHOTS: Shot[] = [
  ['proto_C7214.mp4', 0.17, 69],
  ['proto_C7214.mp4', 4.8, 207],
  ['proto_C7215.mp4', 0.13, 138],
  ['proto_C7215.mp4', 5.77, 138],
  ['proto_C7216.mp4', 0.1, 69],
  ['proto_C7217.mp4', 0.53, 69],
  ['proto_C7219.mp4', 0.33, 138],
  ['proto_C7220.mp4', 0.53, 69],
  ['proto_C7221.mp4', 0.2, 138],
  ['proto_C7221.mp4', 9.83, 69],
  ['proto_C7222.mp4', 0.1, 69],
  ['proto_C7242.mp4', 0.77, 69],
  ['proto_C7243.mp4', 0.23, 69],
  ['proto_C7244.mp4', 1.23, 69],
  ['proto_C7245.mp4', 0.27, 207],
  ['proto_C7246.mp4', 0.53, 69],
  ['proto_C7246.mp4', 3.5, 69],
  ['proto_C7247.mp4', 1.0, 69],
  ['proto_C7248.mp4', 1.0, 69],
  ['proto_C7249.mp4', 0.17, 35],
  ['proto_C7251.mp4', 0.2, 69],
  ['proto_C7252.mp4', 0.17, 69],
  ['proto_C7253.mp4', 0.23, 69],
  ['proto_C7254.mp4', 0.4, 69],
  ['proto_C7507.mp4', 0.77, 69],
  ['proto_C7509.mp4', 0.2, 276],
  ['proto_C7510.mp4', 0.33, 138],
  ['proto_C7511.mp4', 0.43, 138],
  ['proto_C7512.mp4', 1.0, 69],
  ['proto_C7513.mp4', 0.2, 69],
  ['proto_C7514.mp4', 0.33, 138],
  ['proto_C7515.mp4', 0.2, 69],
  ['proto_C7516.mp4', 0.2, 138],
  ['proto_C7517.mp4', 0.33, 138],
  ['proto_C7518.mp4', 0.9, 69],
  ['proto_C7519.mp4', 0.63, 69],
  ['proto_C7519.mp4', 3.8, 69],
  ['proto_C7520.mp4', 0.77, 69],
  ['proto_C7709.mp4', 0.67, 69],
  ['proto_C7709.mp4', 3.87, 69],
  ['proto_C7710.mp4', 0.23, 276],
  ['proto_C7710.mp4', 10.07, 69],
  ['proto_C7711.mp4', 0.67, 69],
  ['proto_C7713.mp4', 1.0, 69],
  ['proto_C7714.mp4', 0.37, 34],
  ['proto_C7716.mp4', 0.23, 276],
  ['proto_C7716.mp4', 10.07, 69],
];

// موضوع واحد = قسم واحد (اسمه يطلع بالكبسولة جنب الشعار)
export const ACADEMIES: Academy[] = [{name: 'بروتوكول التعاون المشترك', kicker: '', shots: SHOTS}];
