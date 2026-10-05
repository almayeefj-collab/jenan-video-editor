import {interpolate} from 'remotion';
import {FPS, timeline, totalFrames} from './config';

// مستوى الموسيقى: عالي في الانترو والأوترو، متوسط على لقطات الأجواء،
// ومنخفض تحت كلام المقابلات
const LOUD = 0.9;
const BROLL = 0.4;
const UNDER_SPEECH = 0.1;
const RAMP = 12;

const levels = () => {
  const tl = timeline();
  const firstSpeech = tl.findIndex((t) => t.shot.volume >= 1);
  return tl.map((t, i) => {
    const isIntro = i < firstSpeech;
    const isOutro = i === tl.length - 1;
    const level = isIntro || isOutro ? LOUD : t.shot.volume >= 1 ? UNDER_SPEECH : BROLL;
    return {start: t.start, level};
  });
};

const cached = levels();
const total = totalFrames();

export const musicVolume = (f: number) => {
  let idx = 0;
  for (let i = 0; i < cached.length; i++) if (cached[i].start <= f) idx = i;
  const cur = cached[idx];
  const prev = idx > 0 ? cached[idx - 1].level : cur.level;
  const v = interpolate(f, [cur.start, cur.start + RAMP], [prev, cur.level], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeIn = interpolate(f, [0, 6], [0, 1], {extrapolateRight: 'clamp'});
  const fadeOut = interpolate(f, [total - 1.6 * FPS, total], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return v * fadeIn * fadeOut;
};
