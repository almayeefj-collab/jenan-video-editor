// واجهات توضيحية للأدوات (شكل تقريبي مو لقطة شاشة حقيقية): نافذة تطبيق + ماوس يضغط + محتوى يطلع خطوة خطوة.
// كل شاشة تمشي على p (من ٠ لين ١ على طول اللقطة) عشان تتمدد مع صوت جنان.
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily} from '../reel/font';
import {C} from './types';

export type UiScreen = 'classroomAssign' | 'classroomInsights' | 'geminiExport' | 'sitesShare' | 'oneNoteTeach' | 'teachUnitPlan' | 'factCheckLesson';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.45, 0, 0.2, 1);
const W = 940;
const H = 1000;

// نص إنجليزي داخل سطر عربي بدون ما ينقلب
const L: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{direction: 'ltr', unicodeBidi: 'isolate', display: 'inline-block'}}>{children}</span>;

const appear = (p: number, at: number, len = 0.06) => interpolate(p, [at, at + len], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

// الماوس: نقاط [p, x, y] ويضغط عند press
const Cursor: React.FC<{p: number; path: [number, number, number][]; clicks: number[]}> = ({p, path, clicks}) => {
  const ps = path.map((q) => q[0]);
  const x = interpolate(p, ps, path.map((q) => q[1]), {...clamp, easing: ease});
  const y = interpolate(p, ps, path.map((q) => q[2]), {...clamp, easing: ease});
  const press = Math.max(0, ...clicks.map((c) => interpolate(p, [c - 0.02, c, c + 0.04], [0, 1, 0], clamp)));
  return (
    <div style={{position: 'absolute', left: x, top: y, zIndex: 50, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: -34, top: -34, width: 68, height: 68, borderRadius: 34, border: `4px solid ${C.coral}`, opacity: press, transform: `scale(${0.6 + press * 0.6})`}} />
      <svg width="46" height="56" viewBox="0 0 23 28" style={{transform: `scale(${1 - press * 0.15})`, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))'}}>
        <path d="M2 2 L2 22 L7.5 17 L11 25 L14.5 23.5 L11 15.8 L18.5 15.8 Z" fill="#111" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

const Win: React.FC<{app: React.ReactNode; color: string; icon: React.ReactNode; right?: React.ReactNode; children: React.ReactNode; h?: number}> = ({app, color, icon, right, children, h = H}) => (
  <div style={{position: 'relative', width: W, height: h, borderRadius: 34, background: 'white', overflow: 'hidden', fontFamily, direction: 'rtl', color: '#1F1F1F',
    boxShadow: '0 40px 90px rgba(40,25,20,0.30), 0 0 0 2px rgba(0,0,0,0.05)'}}>
    <div style={{height: 92, display: 'flex', alignItems: 'center', gap: 18, padding: '0 30px', borderBottom: '2px solid #EEE', background: '#FAFAFA'}}>
      <div style={{width: 52, height: 52, borderRadius: 14, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 30, fontWeight: 900}}>{icon}</div>
      <div style={{fontSize: 34, fontWeight: 900, flex: 1}}>{app}</div>
      {right}
      <div style={{fontSize: 20, fontWeight: 800, color: '#999', background: '#EFEFEF', padding: '4px 12px', borderRadius: 999}}>شكل توضيحي</div>
    </div>
    <div style={{position: 'relative', height: h - 92}}>{children}</div>
  </div>
);

const Btn: React.FC<{children: React.ReactNode; on?: number; color?: string; style?: React.CSSProperties}> = ({children, on = 0, color = '#1A73E8', style}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 26px', borderRadius: 999, fontSize: 30, fontWeight: 900,
    background: on > 0.5 ? color : 'white', color: on > 0.5 ? 'white' : color, border: `3px solid ${color}`, ...style}}>{children}</div>
);

const Row: React.FC<{p: number; at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({p, at, children, style}) => {
  const a = appear(p, at);
  return <div style={{opacity: a, transform: `translateY(${(1 - a) * 30}px)`, ...style}}>{children}</div>;
};

const Spark4: React.FC<{size?: number}> = ({size = 34}) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0Z" fill="url(#gg)" />
    <defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4285F4" /><stop offset="0.5" stopColor="#9B72CB" /><stop offset="1" stopColor="#D96570" /></linearGradient></defs></svg>
);

// ───────── ١) Google Classroom: صفحة الواجب وتبويب Insights الجديد ─────────
const ClassroomAssign: React.FC<{p: number}> = ({p}) => {
  const tabOn = p > 0.72 ? 1 : 0;
  return (
    <Win app={<L>Google Classroom</L>} color="#1E8E3E" icon="▦" right={<div style={{fontSize: 26, color: '#666', fontWeight: 700}}>١٢ علمي · الدستور</div>}>
      <div style={{display: 'flex', gap: 40, padding: '26px 40px 0', borderBottom: '2px solid #EEE', fontSize: 30, fontWeight: 800, color: '#555'}}>
        <div style={{paddingBottom: 18}}>التعليمات</div>
        <div style={{paddingBottom: 18}}>أعمال الطلاب</div>
        <div style={{paddingBottom: 18, color: tabOn ? '#1E8E3E' : '#555', borderBottom: tabOn ? '5px solid #1E8E3E' : '5px solid transparent', display: 'flex', alignItems: 'center', gap: 8}}>
          <Spark4 size={28} /><L>Insights</L>
          <span style={{fontSize: 20, background: C.coral, color: 'white', borderRadius: 999, padding: '2px 10px'}}>جديد</span>
        </div>
      </div>
      <div style={{padding: 40}}>
        <Row p={p} at={0.05}><div style={{fontSize: 44, fontWeight: 900}}>واجب: السلطات الثلاث</div></Row>
        <Row p={p} at={0.12} style={{marginTop: 14, fontSize: 28, color: '#666'}}>اقرأوا وتناقشوا مع النوت بوك قبل الحصة</Row>
        <Row p={p} at={0.2} style={{marginTop: 34}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 22, border: '2px solid #DDD', borderRadius: 22, padding: 24}}>
            <div style={{width: 90, height: 90, borderRadius: 20, background: 'linear-gradient(135deg,#E8F0FE,#F3E8FD)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Spark4 size={50} /></div>
            <div><div style={{fontSize: 32, fontWeight: 900}}><L>Gemini Notebook</L></div><div style={{fontSize: 26, color: '#666'}}>السلطات الثلاث · ملف الدرس + الكتاب</div></div>
          </div>
        </Row>
        <Row p={p} at={0.32} style={{marginTop: 40, display: 'flex', gap: 24}}>
          {[['٢٥', 'تناقشوا مع النوت بوك'], ['٢٢', 'سلّموا الواجب']].map(([n, t]) => (
            <div key={t} style={{flex: 1, background: '#F1F8F3', borderRadius: 22, padding: 26}}>
              <div style={{fontSize: 64, fontWeight: 900, color: '#1E8E3E'}}>{n}</div><div style={{fontSize: 26, fontWeight: 700, color: '#555'}}>{t}</div>
            </div>
          ))}
        </Row>
      </div>
      <Cursor p={p} path={[[0, 400, 760], [0.45, 420, 600], [0.68, 250, 60], [1, 250, 60]]} clicks={[0.72]} />
    </Win>
  );
};

// ───────── ٢) ملخص Gemini لمحادثات الطلاب (أمثلة) ─────────
const ClassroomInsights: React.FC<{p: number}> = ({p}) => {
  const qs: [string, number][] = [['شنو الفرق بين السلطة التشريعية والتنفيذية؟', 12], ['مين يعيّن رئيس مجلس الوزراء؟', 8], ['يعني شنو فصل السلطات؟', 7]];
  return (
    <Win app={<span>ملخص <L>Gemini</L></span>} color="#1E8E3E" icon={<Spark4 size={34} />}>
      <div style={{padding: '30px 40px'}}>
        <Row p={p} at={0.03} style={{fontSize: 30, fontWeight: 900, color: '#1E8E3E'}}>أكثر الأسئلة</Row>
        {qs.map(([q, n], i) => (
          <Row key={q} p={p} at={0.1 + i * 0.09} style={{marginTop: 18, background: '#F7F7F7', borderRadius: 18, padding: '18px 22px'}}>
            <div style={{fontSize: 29, fontWeight: 800}}>{q}</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 10}}>
              <div style={{height: 14, borderRadius: 7, background: '#1E8E3E', width: interpolate(p, [0.12 + i * 0.09, 0.3 + i * 0.09], [0, n * 40], clamp)}} />
              <div style={{fontSize: 24, color: '#666', fontWeight: 700}}>{n} طالب</div>
            </div>
          </Row>
        ))}
        <Row p={p} at={0.45} style={{marginTop: 34, fontSize: 30, fontWeight: 900, color: C.coralDeep}}>يحتاجون دعم في</Row>
        <Row p={p} at={0.52} style={{marginTop: 16, display: 'flex', gap: 16}}>
          {['دور مجلس الأمة', 'الاستجواب'].map((t) => <div key={t} style={{fontSize: 28, fontWeight: 800, background: '#FDECE8', color: C.coralDeep, borderRadius: 999, padding: '10px 26px'}}>{t}</div>)}
        </Row>
        <Row p={p} at={0.64} style={{marginTop: 34, display: 'flex', alignItems: 'center', gap: 16, borderTop: '2px solid #EEE', paddingTop: 26}}>
          <div style={{display: 'flex'}}>{['#F4B400', '#4285F4', '#DB4437', '#0F9D58'].map((c, i) => <div key={c} style={{width: 54, height: 54, borderRadius: 27, background: c, marginLeft: -12, border: '3px solid white'}} />)}</div>
          <div style={{flex: 1, fontSize: 28, fontWeight: 800}}>المحادثات كاملة</div>
          <Btn on={p > 0.86 ? 1 : 0} color="#1E8E3E">عرض</Btn>
        </Row>
      </div>
      <Cursor p={p} path={[[0, 700, 400], [0.6, 600, 700], [0.82, 110, 830], [1, 110, 830]]} clicks={[0.86]} />
    </Win>
  );
};

// لعبة الأسئلة (تطلع في Gemini وبعدين في الموقع)
const Quiz: React.FC<{p: number; scale?: number}> = ({p, scale = 1}) => (
  <div style={{transform: `scale(${scale})`, transformOrigin: 'top center', background: 'linear-gradient(160deg,#FFF4EE,#FDE3DA)', borderRadius: 26, padding: 30, textAlign: 'center'}}>
    <div style={{fontSize: 40, fontWeight: 900}}>تحدي الدستور 🏆</div>
    <div style={{fontSize: 30, fontWeight: 800, marginTop: 18}}>متى صدر دستور الكويت؟</div>
    <div style={{display: 'flex', gap: 16, justifyContent: 'center', marginTop: 22}}>
      {['1961', '1962', '1963'].map((y) => (
        <div key={y} style={{fontSize: 30, fontWeight: 900, padding: '12px 28px', borderRadius: 16, background: y === '1962' && p > 0.2 ? '#1E8E3E' : 'white', color: y === '1962' && p > 0.2 ? 'white' : '#333'}}>{y}</div>
      ))}
    </div>
  </div>
);

// ───────── ٣) Gemini: Export ← Google Sites ─────────
const GeminiExport: React.FC<{p: number}> = ({p}) => {
  const menu = appear(p, 0.42, 0.05);
  return (
    <Win app={<L>Gemini</L>} color="white" icon={<Spark4 size={44} />}>
      <div style={{padding: 34}}>
        <Row p={p} at={0.02} style={{display: 'flex', justifyContent: 'flex-start'}}>
          <div style={{background: '#F0F4F9', borderRadius: '28px 28px 6px 28px', padding: '20px 28px', fontSize: 29, fontWeight: 700, maxWidth: 700}}>سوّ لي لعبة أسئلة عن الدستور الكويتي لطلابي</div>
        </Row>
        <Row p={p} at={0.1} style={{marginTop: 30, border: '2px solid #E3E3E3', borderRadius: 26, overflow: 'hidden'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', background: '#FAFAFA', borderBottom: '2px solid #EEE', direction: 'ltr'}}>
            <div style={{fontSize: 26, fontWeight: 800, flex: 1, textAlign: 'left'}}>Constitution Challenge</div>
            <Btn color="#444" style={{fontSize: 24, padding: '8px 20px'}}>Share</Btn>
            <Btn on={p > 0.4 ? 1 : 0} color="#1A73E8" style={{fontSize: 24, padding: '8px 20px'}}>Export ▾</Btn>
          </div>
          <div style={{padding: 26}}><Quiz p={p} /></div>
        </Row>
      </div>
      {/* قائمة Export */}
      <div style={{position: 'absolute', right: 40, top: 300, width: 380, background: 'white', borderRadius: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.25)', direction: 'ltr',
        opacity: menu, transform: `translateY(${(1 - menu) * -20}px)`, overflow: 'hidden'}}>
        {[['Google Sites', '#673AB7'], ['Copy link', '#666']].map(([t, c], i) => (
          <div key={t} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '22px 26px', fontSize: 30, fontWeight: 800,
            background: i === 0 && p > 0.78 ? '#EDE7F6' : 'white'}}>
            <div style={{width: 40, height: 40, borderRadius: 10, background: c}} />{t}
          </div>
        ))}
      </div>
      <Cursor p={p} path={[[0, 400, 700], [0.36, 840, 250], [0.55, 840, 250], [0.74, 760, 345], [1, 760, 345]]} clicks={[0.4, 0.78]} />
    </Win>
  );
};

// ───────── ٤) Google Sites: نشر ← نسخ الرابط للطلاب ─────────
const SitesShare: React.FC<{p: number}> = ({p}) => {
  const dlg = appear(p, 0.4, 0.06);
  return (
    <Win app={<L>Google Sites</L>} color="#673AB7" icon="▤" right={<Btn on={p > 0.34 ? 1 : 0} color="#1A73E8" style={{fontSize: 26, padding: '8px 24px'}}><L>Publish</L></Btn>}>
      <div style={{padding: 34}}>
        <Row p={p} at={0.02} style={{height: 150, borderRadius: 24, background: 'linear-gradient(120deg,#5E35B1,#E8735A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 48, fontWeight: 900}}>تحدي الدستور</Row>
        <Row p={p} at={0.1} style={{marginTop: 26}}><Quiz p={p} /></Row>
      </div>
      {/* نافذة النشر */}
      <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.35 * dlg})`}} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 260, background: 'white', borderRadius: 28, padding: 34, opacity: dlg, transform: `scale(${0.9 + 0.1 * dlg})`,
        boxShadow: '0 30px 70px rgba(0,0,0,0.35)'}}>
        <div style={{fontSize: 36, fontWeight: 900}}>✓ انتشر الموقع</div>
        <div style={{marginTop: 22, direction: 'ltr', fontSize: 27, fontWeight: 700, background: '#F1F3F4', borderRadius: 16, padding: '18px 22px', color: '#1A73E8', textAlign: 'left'}}>sites.google.com/view/dostor-challenge</div>
        <div style={{display: 'flex', gap: 16, marginTop: 26, alignItems: 'center'}}>
          <Btn on={p > 0.78 ? 1 : 0} color="#1A73E8">{p > 0.8 ? 'تم النسخ ✓' : 'نسخ الرابط'}</Btn>
          <div style={{fontSize: 27, fontWeight: 700, color: '#555'}}>وشاركه مع طلابك</div>
        </div>
      </div>
      <Cursor p={p} path={[[0, 500, 700], [0.3, 90, -50], [0.5, 90, -50], [0.74, 760, 520], [1, 760, 520]]} clicks={[0.34, 0.78]} />
    </Win>
  );
};

// ───────── ٥) OneNote Class Notebook: زر Copilot Teaching Tools يفتح Teach على جنب ─────────
const CopilotIcon: React.FC<{size?: number}> = ({size = 36}) => (
  <div style={{width: size, height: size, borderRadius: size / 3.2, background: 'conic-gradient(from 200deg,#0F6CBD,#7B3FE4,#E3008C,#F7630C,#0F6CBD)'}} />
);

const OneNoteTeach: React.FC<{p: number}> = ({p}) => {
  const side = appear(p, 0.36, 0.1);
  const opts: [string, string][] = [['Unit Plans', 'خطة وحدة'], ['Curriculum planning', 'تخطيط المنهج'], ['Learning Activities', 'أنشطة تعليمية'], ['Modify content', 'تعديل المحتوى']];
  return (
    <Win app={<span><L>OneNote</L> · <L>Class Notebook</L></span>} color="#7719AA" icon="N">
      <div style={{display: 'flex', gap: 14, padding: '18px 30px', borderBottom: '2px solid #EEE', alignItems: 'center'}}>
        {['الصفحة الرئيسية', 'إدراج'].map((t) => <div key={t} style={{fontSize: 26, color: '#666', fontWeight: 700}}>{t}</div>)}
        <div style={{flex: 1}} />
        <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderRadius: 16, background: p > 0.32 ? '#EFE6F7' : '#F6F6F6', border: '2px solid #DCC7EC', direction: 'ltr'}}>
          <CopilotIcon size={34} /><span style={{fontSize: 25, fontWeight: 900}}>Copilot Teaching Tools</span>
        </div>
      </div>
      <div style={{display: 'flex', height: H - 92 - 90}}>
        <div style={{width: 230, background: '#F7F2FA', padding: 24, fontSize: 26, fontWeight: 800, color: '#7719AA', display: 'flex', flexDirection: 'column', gap: 22}}>
          <div>مكتبة المحتوى</div><div style={{background: 'white', borderRadius: 12, padding: '6px 12px'}}>الدروس</div><div>الواجبات</div>
        </div>
        <div style={{flex: 1, padding: 34}}>
          <div style={{fontSize: 40, fontWeight: 900}}>الوحدة ٢: السلطات الثلاث</div>
          {[0, 1, 2, 3].map((i) => <div key={i} style={{height: 18, borderRadius: 9, background: '#EEE', marginTop: 24, width: `${90 - i * 12}%`}} />)}
        </div>
      </div>
      {/* لوحة Teach على جنب */}
      <div style={{position: 'absolute', top: 182, bottom: 0, left: 0, width: 470, background: 'white', borderRight: '2px solid #E6E6E6', boxShadow: '20px 0 50px rgba(0,0,0,0.12)',
        transform: `translateX(${(1 - side) * -480}px)`, padding: 28}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, direction: 'ltr'}}><CopilotIcon size={40} /><span style={{fontSize: 36, fontWeight: 900}}>Teach</span></div>
        {opts.map(([en, ar], i) => (
          <Row key={en} p={p} at={0.46 + i * 0.06} style={{marginTop: 20, borderRadius: 18, padding: '16px 20px', border: '2px solid #EEE',
            background: i === 0 && p > 0.84 ? '#EFE6F7' : 'white', borderColor: i === 0 && p > 0.84 ? '#7719AA' : '#EEE'}}>
            <div style={{fontSize: 28, fontWeight: 900, direction: 'ltr', textAlign: 'left'}}>{en}{i === 0 ? <span style={{fontSize: 18, background: C.coral, color: 'white', borderRadius: 999, padding: '2px 10px', marginLeft: 10}}>NEW</span> : null}</div>
            <div style={{fontSize: 24, color: '#666', fontWeight: 700}}>{ar}</div>
          </Row>
        ))}
      </div>
      <Cursor p={p} path={[[0, 500, 600], [0.28, 360, 40], [0.5, 360, 40], [0.8, 260, 290], [1, 260, 290]]} clicks={[0.32, 0.84]} />
    </Win>
  );
};

// ───────── ٦) Teach: خطة وحدة كاملة (مثال) ─────────
const TeachUnitPlan: React.FC<{p: number}> = ({p}) => {
  const typed = (s: string, a: number, b: number) => s.slice(0, Math.floor(interpolate(p, [a, b], [0, s.length], clamp)));
  const weeks: [string, string][] = [['الأسبوع ١', 'مفهوم السلطات ومبدأ الفصل بينها'], ['الأسبوع ٢', 'السلطة التشريعية ومجلس الأمة'], ['الأسبوع ٣', 'التنفيذية والقضائية + مشروع ختامي']];
  return (
    <Win app={<span><L>Teach</L> · <L>Unit Plans</L></span>} color="white" icon={<CopilotIcon size={46} />}>
      <div style={{padding: 34}}>
        {[['الموضوع', 'السلطات الثلاث في دستور الكويت', 0.02, 0.14], ['الصف', '١٢', 0.14, 0.17], ['المدة', '٣ أسابيع', 0.17, 0.22]].map(([k, v, a, b]) => (
          <div key={k as string} style={{display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14}}>
            <div style={{width: 120, fontSize: 26, color: '#777', fontWeight: 800}}>{k}</div>
            <div style={{flex: 1, fontSize: 29, fontWeight: 800, background: '#F6F6F6', borderRadius: 14, padding: '12px 18px', minHeight: 44}}>{typed(v as string, a as number, b as number)}</div>
          </div>
        ))}
        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 8}}><Btn on={p > 0.27 ? 1 : 0} color="#7719AA">✨ أنشئ الخطة</Btn></div>
        <div style={{marginTop: 22, borderTop: '2px solid #EEE', paddingTop: 22}}>
          {weeks.map(([w, t], i) => (
            <Row key={w} p={p} at={0.36 + i * 0.12} style={{display: 'flex', gap: 18, alignItems: 'center', marginBottom: 16, background: '#F7F2FA', borderRadius: 18, padding: '16px 20px'}}>
              <div style={{fontSize: 26, fontWeight: 900, color: '#7719AA', width: 150}}>{w}</div>
              <div style={{fontSize: 28, fontWeight: 800}}>{t}</div>
            </Row>
          ))}
          <Row p={p} at={0.74} style={{display: 'flex', gap: 14, marginTop: 10}}>
            {['أهداف', 'أنشطة', 'تقييم', 'واجبات'].map((t) => <div key={t} style={{fontSize: 26, fontWeight: 800, background: '#EFE6F7', color: '#7719AA', borderRadius: 999, padding: '8px 22px'}}>{t} ✓</div>)}
          </Row>
        </div>
      </div>
      <Cursor p={p} path={[[0, 600, 700], [0.22, 140, 300], [1, 140, 300]]} clicks={[0.27]} />
    </Win>
  );
};

// ───────── ٧) درس للطلاب: كيف تتأكد من الخبر (مثال) ─────────
const FactCheckLesson: React.FC<{p: number}> = ({p}) => {
  const steps = ['مين نشر الخبر؟', 'دوّر عليه في مصدر رسمي', 'اسأل الشات بوت: وش مصدرك؟', 'قارن التاريخ والتفاصيل'];
  const st = interpolate(p, [0.8, 0.87], [0, 1], {...clamp, easing: Easing.out(Easing.back(2.2))});
  return (
    <Win app={<span><L>AI Classroom Toolkit</L></span>} color="#0F6CBD" icon="✓" right={<div style={{fontSize: 24, color: '#666', fontWeight: 800}}>١٣–١٥ سنة</div>}>
      <div style={{padding: 34}}>
        <Row p={p} at={0.02} style={{fontSize: 38, fontWeight: 900}}>الدرس: أصدّق هذا الخبر؟</Row>
        <Row p={p} at={0.08} style={{marginTop: 22, border: '2px solid #E6E6E6', borderRadius: 24, padding: 24, position: 'relative'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <div style={{width: 54, height: 54, borderRadius: 27, background: '#CCC'}} />
            <div><div style={{fontSize: 26, fontWeight: 900}}>حساب مجهول</div><div style={{fontSize: 22, color: '#888'}}>قبل ساعة · ٢٠ ألف مشاركة</div></div>
          </div>
          <div style={{fontSize: 34, fontWeight: 900, marginTop: 16}}>🚨 عاجل: إلغاء الاختبارات النهائية هالسنة!</div>
          <div style={{position: 'absolute', left: 30, top: 40, border: `6px solid ${C.coralDeep}`, color: C.coralDeep, borderRadius: 18, padding: '8px 22px', fontSize: 34, fontWeight: 1000,
            transform: `rotate(-10deg) scale(${0.5 + 0.5 * st})`, opacity: st, background: 'rgba(255,255,255,0.9)'}}>غير مؤكد ✗</div>
        </Row>
        <div style={{marginTop: 26}}>
          {steps.map((s, i) => {
            const on = p > 0.3 + i * 0.12;
            return (
              <Row key={s} p={p} at={0.22 + i * 0.12} style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16, background: on ? '#E8F1FB' : '#F6F6F6', borderRadius: 18, padding: '16px 20px'}}>
                <div style={{width: 50, height: 50, borderRadius: 25, background: on ? '#0F6CBD' : '#CCC', color: 'white', fontSize: 28, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{on ? '✓' : '١٢٣٤'[i]}</div>
                <div style={{fontSize: 30, fontWeight: 800}}>{s}</div>
              </Row>
            );
          })}
        </div>
      </div>
    </Win>
  );
};

export const UiMock: React.FC<{screen: UiScreen; frames: number}> = ({screen, frames}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = interpolate(f, [6, Math.max(7, frames - 6)], [0, 1], clamp);
  const pop = spring({frame: f, fps, config: {damping: 14, stiffness: 120}});
  const body = {
    classroomAssign: <ClassroomAssign p={p} />,
    classroomInsights: <ClassroomInsights p={p} />,
    geminiExport: <GeminiExport p={p} />,
    sitesShare: <SitesShare p={p} />,
    oneNoteTeach: <OneNoteTeach p={p} />,
    teachUnitPlan: <TeachUnitPlan p={p} />,
    factCheckLesson: <FactCheckLesson p={p} />,
  }[screen];
  return <div style={{transform: `scale(${0.92 + 0.08 * pop})`, marginTop: 40}}>{body}</div>;
};
