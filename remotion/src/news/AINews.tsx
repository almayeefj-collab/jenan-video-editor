import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily, numberFamily} from '../reel/font';
import {INTRO, itemFrames, NewsItem, NewsProps, OUTRO, sceneStarts, totalFrames, TRANSITION} from './config';
import {AIVisual, Background, clamp, easeOut, Tag, Words} from './parts';

const pad = (n: number) => String(n).padStart(2, '0');

// الانترو: اسم السلسلة يطلع مع خط ضوئي والتاريخ
const Intro: React.FC<NewsProps> = ({seriesTitle, seriesSub, date, accent, accent2}) => {
  const f = useCurrentFrame();
  const line = interpolate(f, [4, 30], [0, 1], {...clamp, easing: easeOut});
  const chip = interpolate(f, [2, 18], [0, 1], {...clamp, easing: easeOut});
  const sub = interpolate(f, [26, 42], [0, 1], {...clamp, easing: easeOut});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily, direction: 'rtl', padding: 70}}>
      <div style={{opacity: chip, transform: `translateY(${(1 - chip) * 20}px)`, marginBottom: 40}}>
        <div
          style={{
            padding: '10px 34px 12px',
            borderRadius: 999,
            border: `2px solid ${accent}88`,
            color: accent,
            fontSize: 34,
            fontWeight: 700,
            background: `${accent}14`,
          }}
        >
          {date}
        </div>
      </div>
      <Words
        text={seriesTitle}
        start={6}
        stagger={4}
        style={{fontSize: 112, fontWeight: 900, color: '#FFFFFF', textAlign: 'center', lineHeight: 1.3, textShadow: `0 0 60px ${accent}66`}}
      />
      <div style={{width: 640 * line, height: 6, borderRadius: 3, marginTop: 40, background: `linear-gradient(90deg, ${accent}, ${accent2})`, boxShadow: `0 0 30px ${accent}`}} />
      <div style={{marginTop: 36, fontSize: 46, fontWeight: 600, color: '#B9C3DC', opacity: sub, transform: `translateY(${(1 - sub) * 20}px)`}}>{seriesSub}</div>
    </AbsoluteFill>
  );
};

// مشهد خبر واحد
const NewsScene: React.FC<{item: NewsItem; index: number; accent: string; accent2: string}> = ({item, index, accent, accent2}) => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const card = interpolate(f, [0, 22], [0, 1], {...clamp, easing: easeOut});
  const tag = interpolate(f, [12, 26], [0, 1], {...clamp, easing: easeOut});
  const num = interpolate(f, [6, 26], [0, 1], {...clamp, easing: easeOut});
  const bar = interpolate(f, [30, 52], [0, 1], {...clamp, easing: easeOut});
  const src = interpolate(f, [48, 62], [0, 1], {...clamp, easing: easeOut});
  const zoom = interpolate(f, [0, durationInFrames], [1.08, 1.18]);
  const detailStart = 20 + item.headline.split(' ').length * 2.2;

  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl'}}>
      {/* بطاقة الصورة */}
      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 60,
          top: 250,
          height: 720,
          borderRadius: 44,
          overflow: 'hidden',
          opacity: card,
          transform: `translateY(${(1 - card) * 60}px) scale(${0.94 + 0.06 * card})`,
          border: `2px solid ${accent}44`,
          boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 60px ${accent2}33`,
          background: '#0A0F1E',
        }}
      >
        {item.image ? (
          <Img src={staticFile(item.image)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`}} />
        ) : (
          <AIVisual accent={accent} accent2={accent2} seed={index * 1.7} />
        )}
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,6,12,0) 55%, rgba(5,6,12,0.85) 100%)'}} />
        {/* رقم الخبر */}
        <div
          style={{
            position: 'absolute',
            left: 40,
            top: 26,
            fontFamily: numberFamily,
            fontWeight: 900,
            fontSize: 150,
            lineHeight: 1,
            color: 'transparent',
            WebkitTextStroke: `3px ${accent}`,
            opacity: num,
            transform: `translateX(${(1 - num) * -40}px)`,
            textShadow: `0 0 40px ${accent}55`,
          }}
        >
          {pad(index + 1)}
        </div>
      </div>

      {/* التصنيف فوق حافة البطاقة */}
      <div style={{position: 'absolute', right: 100, top: 935}}>
        <Tag text={item.tag} accent={accent} accent2={accent2} p={tag} />
      </div>

      {/* العنوان والتفاصيل */}
      <div style={{position: 'absolute', left: 70, right: 70, top: 1060}}>
        <Words text={item.headline} start={18} style={{fontSize: 74, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.35}} />
        <div style={{width: 160 * bar, height: 6, borderRadius: 3, margin: '34px 0 30px', background: `linear-gradient(90deg, ${accent2}, ${accent})`, marginRight: 0}} />
        {item.detail ? (
          <Words text={item.detail} start={detailStart} stagger={1.2} style={{fontSize: 44, fontWeight: 500, color: '#B9C3DC', lineHeight: 1.55}} />
        ) : null}
      </div>

      {item.source ? (
        <div
          style={{
            position: 'absolute',
            right: 70,
            bottom: 150,
            fontSize: 32,
            fontWeight: 600,
            color: '#7F8AA8',
            opacity: src,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <span style={{width: 10, height: 10, borderRadius: '50%', background: accent, boxShadow: `0 0 12px ${accent}`}} />
          المصدر: {item.source}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// الأوترو
const Outro: React.FC<NewsProps> = ({outroText, handle, seriesTitle, accent, accent2}) => {
  const f = useCurrentFrame();
  const h = interpolate(f, [22, 40], [0, 1], {...clamp, easing: easeOut});
  const ring = interpolate(f, [0, 30], [0, 1], {...clamp, easing: easeOut});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily, direction: 'rtl', padding: 70}}>
      <div
        style={{
          width: 220,
          height: 220,
          borderRadius: '50%',
          marginBottom: 60,
          border: `4px solid ${accent}`,
          boxShadow: `0 0 60px ${accent}88, inset 0 0 40px ${accent2}88`,
          transform: `scale(${0.6 + 0.4 * ring}) rotate(${(1 - ring) * -90}deg)`,
          opacity: ring,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: numberFamily,
          fontWeight: 900,
          fontSize: 96,
          color: '#FFFFFF',
        }}
      >
        AI
      </div>
      <Words text={outroText} start={8} stagger={3} style={{fontSize: 80, fontWeight: 800, color: '#FFFFFF', textAlign: 'center', lineHeight: 1.35}} />
      <div style={{marginTop: 30, fontSize: 40, color: '#B9C3DC', fontWeight: 600, opacity: h}}>{seriesTitle}</div>
      <div
        style={{
          marginTop: 40,
          padding: '14px 40px 16px',
          borderRadius: 999,
          background: `linear-gradient(90deg, ${accent2}, ${accent})`,
          color: '#04060C',
          fontSize: 44,
          fontWeight: 800,
          direction: 'ltr',
          opacity: h,
          transform: `translateY(${(1 - h) * 20}px)`,
        }}
      >
        {handle}
      </div>
    </AbsoluteFill>
  );
};

// الهيدر الثابت فوق: اسم السلسلة + التاريخ + شريط تقدم مثل الستوري
const Header: React.FC<NewsProps> = (p) => {
  const f = useCurrentFrame();
  const starts = sceneStarts(p);
  const n = p.items.length;
  const firstItem = starts[1];
  const outroStart = starts[n + 1];
  const vis = interpolate(f, [firstItem, firstItem + 14, outroStart, outroStart + 12], [0, 1, 1, 0], clamp);
  if (vis <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 70, opacity: vis, fontFamily, direction: 'rtl'}}>
      <div style={{display: 'flex', gap: 12}}>
        {p.items.map((it, i) => {
          const s = starts[i + 1];
          const prog = interpolate(f, [s, s + itemFrames(it) - TRANSITION], [0, 1], clamp);
          return (
            <div key={i} style={{flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.15)', overflow: 'hidden'}}>
              <div style={{width: `${prog * 100}%`, height: '100%', marginRight: 0, background: `linear-gradient(270deg, ${p.accent}, ${p.accent2})`}} />
            </div>
          );
        })}
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28}}>
        <div style={{fontSize: 38, fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 16}}>
          <span style={{width: 16, height: 16, borderRadius: '50%', background: p.accent, boxShadow: `0 0 16px ${p.accent}`}} />
          {p.seriesTitle}
        </div>
        <div style={{fontSize: 30, fontWeight: 600, color: '#8C97B5'}}>{p.date}</div>
      </div>
    </div>
  );
};

export const AINews: React.FC<NewsProps> = (p) => {
  const starts = sceneStarts(p);
  const total = totalFrames(p);
  return (
    <AbsoluteFill>
      <Background accent={p.accent} accent2={p.accent2} />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={INTRO}>
          <Intro {...p} />
        </TransitionSeries.Sequence>
        {p.items.flatMap((item, i) => [
          <TransitionSeries.Transition
            key={`t${i}`}
            presentation={i === 0 ? fade() : slide({direction: 'from-left'})}
            timing={linearTiming({durationInFrames: TRANSITION})}
          />,
          <TransitionSeries.Sequence key={`s${i}`} durationInFrames={itemFrames(item)}>
            <NewsScene item={item} index={i} accent={p.accent} accent2={p.accent2} />
          </TransitionSeries.Sequence>,
        ])}
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: TRANSITION})} />
        <TransitionSeries.Sequence durationInFrames={OUTRO}>
          <Outro {...p} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Header {...p} />

      {/* الصوت */}
      {p.music ? (
        <Audio
          src={staticFile('music/background.wav')}
          volume={(f) => 0.35 * interpolate(f, [0, 10, total - 45, total], [0, 1, 1, 0], clamp)}
        />
      ) : null}
      <Sequence from={0} durationInFrames={60}>
        <Audio src={staticFile('sfx/riser.wav')} volume={0.3} />
      </Sequence>
      {starts.slice(1).map((s, i) => (
        <Sequence key={i} from={Math.max(0, s - 6)} durationInFrames={30}>
          <Audio src={staticFile('sfx/whoosh.wav')} volume={0.4} />
        </Sequence>
      ))}
      {starts.slice(1, -1).map((s, i) => (
        <Sequence key={`p${i}`} from={s + 12} durationInFrames={15}>
          <Audio src={staticFile('sfx/pop.wav')} volume={0.25} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
