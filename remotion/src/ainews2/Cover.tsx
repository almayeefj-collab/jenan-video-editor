import {AbsoluteFill, Img, staticFile} from 'remotion';
import {fontFamily} from '../reel/font';
import {Backdrop, Kinetic, Spark} from './Beats';
import {C, INSTAGRAM} from './types';

// غلاف الريل (1080x1920). كل شي مهم داخل المربع اللي بالنص (y من 420 لين 1500) —
// هذا اللي يبين في شبكة البروفايل (3:4 وقبلها 1:1) وما تغطيه أزرار الريل. برا المربع: خلفية بس.
export const SAFE = {top: 420, bottom: 1500};

export type CoverProps = {number: number; title: string; tools: string[]; tag?: string};

const ar = (n: number) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);

export const Cover: React.FC<CoverProps & {guides?: boolean}> = ({number, title, tools, tag, guides}) => (
  <AbsoluteFill style={{fontFamily, direction: 'rtl', color: 'white'}}>
    <Backdrop look="dark" />
    {/* زينة برا المنطقة الآمنة */}
    <div style={{position: 'absolute', top: -260, left: -200, width: 700, height: 700, borderRadius: '50%', background: 'rgba(232,115,90,0.18)'}} />
    <div style={{position: 'absolute', bottom: -300, right: -220, width: 760, height: 760, borderRadius: '50%', background: 'rgba(232,115,90,0.14)'}} />

    {/* السطر الأعلى: اسم السلسلة + رقم الحلقة */}
    <div style={{position: 'absolute', top: SAFE.top + 30, left: 70, right: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <div style={{fontSize: 40, fontWeight: 900, padding: '14px 30px', borderRadius: 999, background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.18)'}}>
        آخر أخبار أدوات الـ{' '}AI
      </div>
      <div style={{width: 150, height: 150, borderRadius: 34, background: C.coral, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 20px 50px rgba(232,115,90,0.45)', transform: 'rotate(-6deg)'}}>
        <div style={{fontSize: 30, fontWeight: 800, lineHeight: 1}}>الحلقة</div>
        <div style={{fontSize: 92, fontWeight: 1000, lineHeight: 1}}>{ar(number)}</div>
      </div>
    </div>

    {/* العنوان */}
    <div style={{position: 'absolute', top: SAFE.top + 190, left: 50, right: 50}}>
      {tag ? <div style={{textAlign: 'center', fontSize: 38, fontWeight: 800, color: C.coral, marginBottom: 6}}>{tag}</div> : null}
      <Kinetic text={title} look="dark" size={108} />
    </div>

    {/* الأدوات */}
    <div style={{position: 'absolute', top: SAFE.top + 545, left: 60, right: 60, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, direction: 'ltr'}}>
      {tools.map((t) => (
        <div key={t} style={{fontSize: 38, fontWeight: 900, padding: '10px 28px', borderRadius: 999, background: 'white', color: C.ink}}>{t}</div>
      ))}
    </div>

    {/* جنان — تخلص عند حد المنطقة الآمنة */}
    <div style={{position: 'absolute', top: SAFE.bottom - 470, left: 0, right: 0, height: 470, display: 'flex', justifyContent: 'center', overflow: 'hidden'}}>
      <div style={{position: 'absolute', top: 70, width: 440, height: 440, borderRadius: '50%', background: C.coral, boxShadow: '0 30px 70px rgba(232,115,90,0.4)'}} />
      <div style={{position: 'absolute', top: 40, right: 250}}><Spark size={70} color="white" /></div>
      <Img src={staticFile('ainews/brand/jenan.png')} style={{position: 'absolute', top: 0, height: 600}} />
      <div style={{position: 'absolute', bottom: 18, background: C.ink, color: 'white', fontSize: 40, fontWeight: 900, padding: '10px 36px', borderRadius: 999,
        direction: 'ltr', border: '2px solid rgba(255,255,255,0.25)'}}>{INSTAGRAM}</div>
    </div>

    {guides ? (
      <>
        <div style={{position: 'absolute', top: 240, left: 0, right: 0, height: 1440, border: '4px dashed #3CF'}} />
        <div style={{position: 'absolute', top: SAFE.top, left: 0, right: 0, height: SAFE.bottom - SAFE.top, border: '4px solid #3F6'}} />
      </>
    ) : null}
  </AbsoluteFill>
);

export const COVERS: Record<string, CoverProps> = {
  '01': {number: 1, title: '*GPT-6* وصل', tools: ['ChatGPT', 'Gemini 4']},
  '02': {number: 2, title: 'صوت ChatGPT *الجديد*', tools: ['ChatGPT', 'Claude', 'Manus', 'Meta']},
  '03': {number: 3, title: 'Shortcuts يذكّرك *بالبصمة*', tools: ['Shortcuts', 'تطبيق وزارة التربية'], tag: 'تذكير بصمة التواجد'},
  '04': {number: 4, title: 'ChatGPT يسوي *Slides*', tools: ['Kling 4.0', 'Grok', 'DeepSeek']},
  '05': {number: 5, title: 'Claude يحضّر *دروسك*', tools: ['Claude', 'Canva'], tag: 'شرح خطوة بخطوة'},
  '06': {number: 6, title: 'سويت *دفتر متابعة* لصفي', tools: ['Claude Code'], tag: 'مشروعي'},
  '07': {number: 7, title: 'Claude *Duet* وصل', tools: ['Claude', '1Password', 'Gemini', 'Kimi']},
};
