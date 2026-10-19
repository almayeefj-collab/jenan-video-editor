// حلقة شرح بشكل «تسجيل شاشة»: لابتوب ينفتح، تطلع واجهة Claude، والماوس يمشي على الخطوات
// بالضبط مثل إنفوجرافيك جنان (public/ainews/ep05/ref/). الشاشة مرسومة بإحداثيات افتراضية 1600×1000.
import {AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily} from '../reel/font';
import {Outro} from './AiNews2';
import {Backdrop, BeatView, Kinetic, Spark} from './Beats';
import {C, type Beat, FPS, INSTAGRAM} from './types';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.45, 0, 0.2, 1);
const VW = 1600;
const VH = 1000;

// ───────── أنواع ─────────
type ScreenId =
  | 'welcome' | 'app' | 'userMenu' | 'settings' | 'connectors' | 'canvaLogin' | 'connected'
  | 'canvaHome' | 'canvaProjects' | 'canvaFile' | 'canvaShare'
  | 'chat' | 'attach' | 'uploaded' | 'prompt'
  | 'scheduled' | 'newTask' | 'repeat' | 'details' | 'review';

export type Shot = {
  screen: ScreenId;
  dur: number;
  caption: string; // سطر الشرح تحت (من الإنفوجرافيك)
  to?: [number, number]; // وين يروح الماوس
  click?: boolean; // يضغط في آخر الحركة
  zoom?: [number, number, number]; // [x, y, scale] الكاميرا داخل الشاشة
  type?: string; // نص ينكتب في هالشوت
  open?: boolean; // اللابتوب ينفتح في بداية هالشوت
};

export type TutStep = {head: string; voice?: string; voiceDur?: number; shots: Shot[]};

export type TutorialEp = {
  number: number;
  date: string;
  music: string;
  intro: {beats: Beat[]; voice?: string; voiceDur?: number};
  steps: TutStep[];
  // مشهد أخير: جوال ينزل فيه الإشعار الحقيقي (صورة من جوال جنان)
  final?: {image: string; head: string; dur: number; voice?: string; voiceDur?: number; dropAt?: number}; // dropAt: ثانية نزول الإشعار (لما تقول «يوصلك الإشعار»)
  outro: {voice?: string; dur: number; word?: string};
};

// ───────── قطع الواجهة ─────────
const ui = {bg: '#FAF9F5', side: '#F1EFE7', line: '#E3DFD5', text: '#1F1B18', mute: '#7A736C', blue: '#3B82F6', coral: '#D97757'};
const box = (x: number, y: number, w: number, h: number, extra: React.CSSProperties = {}): React.CSSProperties => ({
  position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box', ...extra,
});
const Row: React.FC<{x: number; y: number; w: number; icon?: string; label: string; active?: boolean; sub?: string}> = ({x, y, w, icon, label, active, sub}) => (
  <div style={{...box(x, y - 30, w, 60), display: 'flex', alignItems: 'center', gap: 18, padding: '0 20px', borderRadius: 14, fontSize: 30, fontWeight: 600,
    color: ui.text, background: active ? '#FFFFFF' : 'transparent', border: active ? `3px solid ${C.coral}` : '3px solid transparent', direction: 'ltr'}}>
    {icon ? <span style={{width: 34, textAlign: 'center', fontSize: 28}}>{icon}</span> : null}
    <span style={{flex: 1}}>{label}</span>
    {sub ? <span style={{fontSize: 22, color: '#16A34A', fontWeight: 700}}>● {sub}</span> : null}
  </div>
);
const ClaudeLogo: React.FC<{size?: number}> = ({size = 40}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12, direction: 'ltr'}}>
    <Spark size={size} color={ui.coral} />
    <span style={{fontFamily: 'Georgia, serif', fontSize: size * 1.05, color: ui.text}}>Claude</span>
  </div>
);
const CanvaLogo: React.FC<{size?: number; color?: string}> = ({size = 44, color}) => (
  <span style={{fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700, fontSize: size, direction: 'ltr',
    ...(color ? {color} : {background: 'linear-gradient(90deg,#00C4CC,#7D2AE8)', WebkitBackgroundClip: 'text', color: 'transparent'})}}>Canva</span>
);
const CanvaBadge: React.FC<{size: number}> = ({size}) => (
  <div style={{width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,#00C4CC,#7D2AE8)', display: 'flex', alignItems: 'center',
    justifyContent: 'center'}}><CanvaLogo size={size * 0.32} color="white" /></div>
);
const Btn: React.FC<{x: number; y: number; w: number; h?: number; label: string; color?: string; light?: boolean}> = ({x, y, w, h = 64, label, color = ui.blue, light}) => (
  <div style={{...box(x, y, w, h), borderRadius: 14, background: light ? '#fff' : color, color: light ? ui.text : '#fff', border: light ? `2px solid ${ui.line}` : 'none',
    fontSize: 28, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, direction: 'ltr'}}>{label}</div>
);

const ClaudeSidebar: React.FC<{active?: string}> = ({active}) => (
  <div style={{...box(0, 0, 330, VH), background: ui.side, borderRight: `2px solid ${ui.line}`}}>
    <div style={{position: 'absolute', left: 36, top: 40}}><ClaudeLogo /></div>
    {[['＋', 'New chat', 170], ['⌂', 'Home', 240], ['▢', 'Projects', 300], ['✎', 'Artifacts', 360], ['◷', 'Scheduled', 420], ['⚙', 'Settings', 480]].map(([i, l, y]) => (
      <Row key={l as string} x={16} y={y as number} w={298} icon={i as string} label={l as string} active={active === l} />
    ))}
    <div style={{...box(16, 900, 298, 70), display: 'flex', alignItems: 'center', gap: 16, padding: '0 18px', fontSize: 30, fontWeight: 600, direction: 'ltr'}}>
      <div style={{width: 46, height: 46, borderRadius: 23, background: ui.text, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24}}>J</div>
      Jenan
    </div>
  </div>
);

const CanvaShell: React.FC<{children?: React.ReactNode; active?: string}> = ({children, active}) => (
  <>
    <div style={{...box(0, 0, VW, 100), background: 'linear-gradient(90deg,#00C4CC,#6E3BE8 60%,#7D2AE8)', display: 'flex', alignItems: 'center', padding: '0 40px', gap: 40}}>
      <CanvaLogo size={50} color="white" />
      <div style={{width: 640, height: 58, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 22px', fontSize: 26, color: ui.mute,
        direction: 'ltr'}}>🔍 Search your content</div>
    </div>
    <div style={{...box(0, 100, 290, VH - 100), background: '#fff', borderRight: `2px solid ${ui.line}`}}>
      {[['⌂', 'Home', 90], ['▣', 'Projects', 160], ['▤', 'Templates', 230], ['◈', 'Brand', 300], ['⊞', 'Apps', 370]].map(([i, l, y]) => (
        <Row key={l as string} x={14} y={y as number} w={262} icon={i as string} label={l as string} active={active === l} />
      ))}
    </div>
    <div style={{...box(290, 100, VW - 290, VH - 100), background: '#F7F7FA'}}>{children}</div>
  </>
);

const Modal: React.FC<{x: number; y: number; w: number; h: number; children: React.ReactNode}> = ({x, y, w, h, children}) => (
  <>
    <div style={{...box(0, 0, VW, VH), background: 'rgba(20,16,14,0.35)'}} />
    <div style={{...box(x, y, w, h), background: '#fff', borderRadius: 24, boxShadow: '0 30px 80px rgba(0,0,0,0.3)'}}>{children}</div>
  </>
);

const ChatInput: React.FC<{text?: string; files?: boolean}> = ({text, files}) => (
  <div style={{...box(420, files ? 600 : 780, 1100, files ? 340 : 160), background: '#fff', borderRadius: 28, border: `2px solid ${ui.line}`,
    boxShadow: '0 10px 30px rgba(0,0,0,0.06)'}}>
    {files ? (
      <div style={{...box(24, 20, 1050, 150)}}>
        <div style={{fontSize: 24, color: ui.mute, marginBottom: 10, direction: 'ltr'}}>Uploaded files</div>
        <div style={{display: 'flex', gap: 20}}>
          {[['خطة توزيع المنهج.pdf', '2.4 MB'], ['الكتاب.pdf', '5.1 MB']].map(([n, s]) => (
            <div key={n} style={{flex: 1, height: 96, borderRadius: 16, border: `2px solid ${ui.line}`, display: 'flex', alignItems: 'center', gap: 16, padding: '0 18px'}}>
              <div style={{width: 56, height: 66, borderRadius: 8, background: '#E5383B', color: '#fff', fontSize: 18, fontWeight: 900, display: 'flex', alignItems: 'center',
                justifyContent: 'center'}}>PDF</div>
              <div style={{flex: 1, direction: 'rtl', textAlign: 'right'}}>
                <div style={{fontSize: 26, fontWeight: 700}}>{n}</div>
                <div style={{fontSize: 22, color: ui.mute}}>{s}</div>
              </div>
              <div style={{width: 40, height: 40, borderRadius: 20, background: '#22C55E', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26}}>✓</div>
            </div>
          ))}
        </div>
      </div>
    ) : null}
    <div style={{position: 'absolute', left: 30, right: 120, bottom: 30, top: files ? 190 : 30, fontSize: 28, lineHeight: 1.45, direction: 'rtl', textAlign: 'right',
      color: text ? ui.text : ui.mute, overflow: 'hidden'}}>{text || 'اكتب تعليماتك هنا ...'}</div>
    <div style={{position: 'absolute', left: 24, bottom: 24, fontSize: 40}}>📎</div>
    <div style={{position: 'absolute', right: 24, bottom: 24, width: 70, height: 70, borderRadius: 35, background: ui.blue, color: '#fff', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontSize: 36}}>→</div>
  </div>
);

const PROMPT = 'اعتمد على خطة المنهج والكتاب المرفوعين لتحديد تسلسل دروس مادة الدستور. عند طلبي لأي درس، ابحث عن العرض المناسب في ملف Canva المحفوظ وأصدره لي بصيغة PDF.';
const TASK = 'كل يوم أحد جهز لي تحضير حصة الأربعاء للصف الثاني عشر علمي 8 في مادة الدستور وحقوق الإنسان. ابحث عن العرض المناسب في ملف Canva، وأرسل لي العرض بصيغة PDF.';

const Screen: React.FC<{id: ScreenId; typed: string; f: number}> = ({id, typed}) => {
  switch (id) {
    case 'welcome':
      return (
        <div style={{...box(0, 0, VW, VH), background: '#F3F0E8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40}}>
          <Spark size={110} color={ui.coral} />
          <div style={{fontFamily: 'Georgia, serif', fontSize: 96, color: ui.text}}>Claude</div>
          <div style={{fontSize: 40, color: ui.text, direction: 'ltr'}}>Welcome to Claude</div>
          <div style={{background: ui.text, color: '#fff', fontSize: 30, padding: '20px 50px', borderRadius: 14, direction: 'ltr'}}>Continue with your account</div>
        </div>
      );
    case 'app':
    case 'userMenu':
    case 'scheduled':
      return (
        <>
          <ClaudeSidebar active={id === 'scheduled' ? 'Scheduled' : undefined} />
          <div style={{...box(330, 0, VW - 330, VH), background: ui.bg}}>
            {id === 'scheduled' ? (
              <div style={{...box(0, 260, VW - 330, 400), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, direction: 'ltr'}}>
                <div style={{fontSize: 64, fontWeight: 800}}>◷ Scheduled</div>
                <div style={{fontSize: 32, color: ui.mute}}>Automate your work with scheduled tasks</div>
                <div style={{marginTop: 30, background: ui.blue, color: '#fff', fontSize: 34, fontWeight: 700, padding: '20px 60px', borderRadius: 16}}>＋ New task</div>
              </div>
            ) : (
              <div style={{...box(0, 360, VW - 330, 200), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
                <ClaudeLogo size={60} />
                <div style={{fontSize: 34, color: ui.mute, direction: 'ltr'}}>How can I help you today?</div>
              </div>
            )}
          </div>
          {id === 'userMenu' ? (
            <div style={{...box(20, 560, 380, 330), background: '#fff', borderRadius: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.18)', border: `2px solid ${ui.line}`}}>
              {[['👤', 'Profile', 60], ['⚙', 'Settings', 140], ['ⓘ', 'Help', 210], ['↪', 'Log out', 280]].map(([i, l, y]) => (
                <Row key={l as string} x={10} y={y as number} w={360} icon={i as string} label={l as string} active={l === 'Settings'} />
              ))}
            </div>
          ) : null}
        </>
      );
    case 'settings':
      return (
        <>
          <ClaudeSidebar active="Settings" />
          <div style={{...box(330, 0, VW - 330, VH), background: ui.bg}}>
            <div style={{...box(60, 60, 600, 80), fontSize: 56, fontWeight: 800, direction: 'ltr'}}>Settings</div>
            {[['⚙', 'General', 220], ['👤', 'Account', 290], ['🔒', 'Privacy', 360], ['💳', 'Billing', 430], ['🔗', 'Connectors', 500], ['⌘', 'Claude Code', 570]].map(([i, l, y]) => (
              <Row key={l as string} x={50} y={y as number} w={400} icon={i as string} label={l as string} active={l === 'Connectors'} />
            ))}
          </div>
        </>
      );
    case 'connectors':
    case 'canvaLogin':
      return (
        <>
          <ClaudeSidebar active="Settings" />
          <div style={{...box(330, 0, VW - 330, VH), background: ui.bg}}>
            <div style={{...box(80, 60, 700, 80), fontSize: 56, fontWeight: 800, direction: 'ltr'}}>Connectors</div>
            <div style={{...box(80, 170, 820, 80), borderRadius: 16, border: `2px solid ${ui.line}`, background: '#fff', fontSize: 32, display: 'flex', alignItems: 'center',
              padding: '0 26px', direction: 'ltr', gap: 16}}>🔍 <span>{typed}</span><span style={{opacity: typed.length < 5 ? 1 : 0}}>|</span></div>
            {typed.length >= 5 ? (
              <div style={{...box(80, 290, 820, 220), borderRadius: 20, background: '#fff', border: `2px solid ${ui.line}`, display: 'flex', alignItems: 'center', gap: 28,
                padding: '0 30px', direction: 'ltr'}}>
                <CanvaBadge size={120} />
                <div style={{flex: 1}}>
                  <div style={{fontSize: 40, fontWeight: 800}}>Canva</div>
                  <div style={{fontSize: 26, color: ui.mute}}>Design and create content with Canva</div>
                </div>
                <div style={{background: ui.blue, color: '#fff', fontSize: 32, fontWeight: 700, padding: '16px 44px', borderRadius: 14}}>Connect</div>
              </div>
            ) : null}
          </div>
          {id === 'canvaLogin' ? (
            <Modal x={500} y={150} w={600} h={700}>
              <div style={{textAlign: 'center', marginTop: 60}}><CanvaLogo size={84} /></div>
              <div style={{textAlign: 'center', fontSize: 34, marginTop: 20, direction: 'ltr'}}>Log in or sign up to continue</div>
              <Btn x={70} y={300} w={460} label="G  Continue with Google" light />
              <Btn x={70} y={390} w={460} label="⊞  Continue with Microsoft" light />
              <Btn x={70} y={480} w={460} label="✉  Continue with email" light />
            </Modal>
          ) : null}
        </>
      );
    case 'connected':
      return (
        <>
          <ClaudeSidebar active="Settings" />
          <div style={{...box(330, 0, VW - 330, VH), background: ui.bg}}>
            <div style={{...box(80, 60, 700, 80), fontSize: 56, fontWeight: 800, direction: 'ltr'}}>Connectors</div>
            {[['△', 'Google Drive', 240], ['✉', 'Gmail', 340], ['C', 'Canva', 440]].map(([i, l, y]) => (
              <div key={l as string} style={{...box(80, (y as number) - 40, 820, 84), borderRadius: 16, background: '#fff', display: 'flex', alignItems: 'center', gap: 22,
                padding: '0 24px', direction: 'ltr', border: l === 'Canva' ? `4px solid ${C.coral}` : `2px solid ${ui.line}`}}>
                {l === 'Canva' ? <CanvaBadge size={56} /> : <span style={{fontSize: 40, width: 56, textAlign: 'center'}}>{i}</span>}
                <span style={{flex: 1, fontSize: 34, fontWeight: 700}}>{l}</span>
                <span style={{fontSize: 26, color: '#16A34A', fontWeight: 700}}>● Connected</span>
              </div>
            ))}
          </div>
        </>
      );
    case 'canvaHome':
      return <CanvaShell />;
    case 'canvaProjects':
    case 'canvaFile':
    case 'canvaShare':
      return (
        <CanvaShell active="Projects">
          <div style={{...box(50, 30, 1200, 70), fontSize: 46, fontWeight: 800, direction: 'ltr'}}>Projects</div>
          <div style={{...box(50, 100, 1200, 50), fontSize: 26, color: ui.mute, direction: 'ltr'}}>
            All projects {id !== 'canvaProjects' ? <span style={{color: ui.text, fontWeight: 700}}>›  تحضير مادة الدستور – الكورس الأول</span> : null}
          </div>
          {id === 'canvaProjects' ? (
            <div style={{...box(50, 180, 560, 520), background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.08)'}}>
              <Img src={staticFile('ainews/ep05/canva-project.jpg')} style={{width: '100%', height: 380, objectFit: 'cover'}} />
              <div style={{padding: '18px 24px', direction: 'rtl', textAlign: 'right'}}>
                <div style={{fontSize: 30, fontWeight: 800}}>تحضير مادة الدستور – الكورس الأول</div>
                <div style={{fontSize: 24, color: ui.mute, direction: 'ltr', textAlign: 'right'}}>Presentation • 30 designs</div>
              </div>
            </div>
          ) : (
            <div style={{...box(50, 200, 1220, 300), borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.08)'}}>
              <Img src={staticFile('ainews/ep05/canva-thumbs.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
          )}
          {id !== 'canvaProjects' ? (
            <div style={{...box(1080, -80, 200, 60), background: '#7D2AE8', color: '#fff', borderRadius: 12, fontSize: 28, fontWeight: 700, display: 'flex',
              alignItems: 'center', justifyContent: 'center', direction: 'ltr'}}>⇪ Share</div>
          ) : null}
          {id === 'canvaShare' ? (
            <div style={{...box(860, 0, 420, 200), background: '#fff', borderRadius: 18, boxShadow: '0 20px 50px rgba(0,0,0,0.2)', direction: 'ltr'}}>
              <div style={{...box(30, 30, 360, 50), fontSize: 28, color: ui.mute}}>⊕ Share this project</div>
              <div style={{...box(16, 100, 388, 76), borderRadius: 14, border: `3px solid ${C.coral}`, fontSize: 32, fontWeight: 700, display: 'flex', alignItems: 'center',
                padding: '0 20px'}}>🔗 Copy link</div>
            </div>
          ) : null}
        </CanvaShell>
      );
    case 'chat':
    case 'attach':
    case 'uploaded':
    case 'prompt':
      return (
        <>
          <ClaudeSidebar />
          <div style={{...box(330, 0, VW - 330, VH), background: ui.bg}} />
          <div style={{...box(330, 0, VW - 330, VH)}}>
            <div style={{position: 'absolute', left: 0, right: 0, top: 240, display: 'flex', justifyContent: 'center'}}><ClaudeLogo size={60} /></div>
          </div>
          <div style={{position: 'absolute', left: 0, top: 0}}>
            <ChatInput text={id === 'prompt' ? typed : ''} files={id === 'uploaded' || id === 'prompt'} />
          </div>
          {id === 'attach' ? (
            <div style={{...box(420, 430, 560, 330), background: '#fff', borderRadius: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.18)', border: `2px solid ${ui.line}`}}>
              {[['⇪', 'Upload files', 60], ['△', 'Add from Google Drive', 135], ['☁', 'Add from Microsoft OneDrive', 210], ['⬡', 'Add from Dropbox', 285]].map(([i, l, y]) => (
                <Row key={l as string} x={10} y={y as number} w={540} icon={i as string} label={l as string} active={l === 'Upload files'} />
              ))}
            </div>
          ) : null}
        </>
      );
    case 'newTask':
    case 'repeat':
    case 'details':
    case 'review':
      return (
        <>
          <ClaudeSidebar active="Scheduled" />
          <div style={{...box(330, 0, VW - 330, VH), background: ui.bg}} />
          <Modal x={430} y={90} w={900} h={820}>
            <div style={{...box(50, 40, 800, 70), fontSize: 44, fontWeight: 800, direction: 'ltr'}}>
              {id === 'newTask' ? 'Create a scheduled task' : id === 'review' ? 'Review and save' : id === 'details' ? 'Task details' : 'Schedule'}
            </div>
            {id === 'newTask' ? (
              <>
                {[['✦', 'Create with Claude', 'Describe what you want and Claude will set it up', 170], ['⚙', 'Set up manually', 'Choose time, frequency and settings', 400]].map(([i, t, d, y]) => (
                  <div key={t as string} style={{...box(50, y as number, 800, 190), borderRadius: 20, border: t === 'Create with Claude' ? `4px solid ${C.coral}` : `2px solid ${ui.line}`,
                    padding: '30px 34px', direction: 'ltr', display: 'flex', gap: 26}}>
                    <span style={{fontSize: 50, color: ui.blue}}>{i}</span>
                    <div><div style={{fontSize: 36, fontWeight: 800}}>{t}</div><div style={{fontSize: 28, color: ui.mute, marginTop: 8}}>{d}</div></div>
                  </div>
                ))}
              </>
            ) : null}
            {id === 'repeat' ? (
              <div style={{...box(50, 150, 800, 600), direction: 'ltr'}}>
                <div style={{fontSize: 28, color: ui.mute}}>Repeat</div>
                <div style={{marginTop: 10, height: 76, borderRadius: 14, border: `2px solid ${ui.line}`, fontSize: 34, display: 'flex', alignItems: 'center', padding: '0 24px'}}>Weekly ⌄</div>
                <div style={{fontSize: 28, color: ui.mute, marginTop: 40}}>Day of week</div>
                <div style={{display: 'flex', gap: 12, marginTop: 12}}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <div key={d} style={{width: 98, height: 70, borderRadius: 12, fontSize: 28, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: d === 'Sun' ? ui.blue : '#F2F2F2', color: d === 'Sun' ? '#fff' : ui.text}}>{d}</div>
                  ))}
                </div>
                <div style={{fontSize: 28, color: ui.mute, marginTop: 40}}>Time</div>
                <div style={{marginTop: 10, height: 76, borderRadius: 14, border: `2px solid ${ui.line}`, fontSize: 34, display: 'flex', alignItems: 'center', padding: '0 24px'}}>7:00 AM ◷</div>
              </div>
            ) : null}
            {id === 'details' ? (
              <div style={{...box(50, 140, 800, 640)}}>
                <div style={{fontSize: 26, color: ui.mute, direction: 'ltr'}}>Task name</div>
                <div style={{marginTop: 8, height: 70, borderRadius: 14, border: `2px solid ${ui.line}`, fontSize: 30, display: 'flex', alignItems: 'center', padding: '0 22px',
                  direction: 'rtl'}}>التحضير الأسبوعي لحصة الأربعاء</div>
                <div style={{fontSize: 26, color: ui.mute, marginTop: 30, direction: 'ltr'}}>Instructions for Claude</div>
                <div style={{marginTop: 8, height: 380, borderRadius: 14, border: `2px solid ${ui.line}`, fontSize: 30, lineHeight: 1.5, padding: '18px 22px', direction: 'rtl',
                  textAlign: 'right'}}>{typed}</div>
              </div>
            ) : null}
            {id === 'review' ? (
              <div style={{...box(50, 150, 800, 620), direction: 'ltr'}}>
                {[['📅', 'التحضير الأسبوعي لحصة الأربعاء'], ['↻', 'Repeat: Weekly'], ['📅', 'Day: Sunday'], ['◷', 'Time: 7:00 AM'], ['📄', 'Using: Create with Claude']].map(([i, t], k) => (
                  <div key={k} style={{height: 80, display: 'flex', alignItems: 'center', gap: 22, fontSize: 32, borderBottom: `2px solid ${ui.line}`}}><span>{i}</span>{t}</div>
                ))}
                <div style={{position: 'absolute', left: 0, right: 0, bottom: 20, height: 90, borderRadius: 16, background: ui.blue, color: '#fff', fontSize: 38, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Save task</div>
              </div>
            ) : null}
          </Modal>
        </>
      );
  }
};

// ───────── اللابتوب + الكاميرا + الماوس ─────────
const Cursor: React.FC<{x: number; y: number; press: number}> = ({x, y, press}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `scale(${1 - press * 0.15})`, transformOrigin: 'top left'}}>
    {press > 0.02 ? <div style={{position: 'absolute', left: -50 * press - 10, top: -50 * press - 10, width: 20 + 100 * press, height: 20 + 100 * press,
      borderRadius: '50%', border: `5px solid ${C.coral}`, opacity: 1 - press * 0.6}} /> : null}
    <svg width="58" height="74" viewBox="0 0 24 31"><path d="M2 2 L2 25 L8 19.5 L12.5 29 L16.5 27 L12 18 L20 18 Z" fill="#111" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" /></svg>
  </div>
);

type Laid = {shot: Shot; start: number; frames: number; step: number};

const Laptop: React.FC<{laid: Laid[]; f: number}> = ({laid, f}) => {
  const i = Math.max(0, laid.findIndex((l) => f >= l.start && f < l.start + l.frames));
  const cur = laid[i];
  const lf = f - cur.start;
  const p = lf / cur.frames;
  // الماوس: من مكانه في الشوت اللي قبل لمكان هالشوت
  const prevTo = (k: number): [number, number] => {
    for (let j = k - 1; j >= 0; j--) if (laid[j].shot.to) return laid[j].shot.to!;
    return [VW / 2, VH * 0.8];
  };
  const from = prevTo(i);
  const to = cur.shot.to ?? from;
  const mv = interpolate(p, [0.08, 0.55], [0, 1], {...clamp, easing: ease});
  const cx = from[0] + (to[0] - from[0]) * mv;
  const cy = from[1] + (to[1] - from[1]) * mv;
  const press = cur.shot.click ? interpolate(p, [0.62, 0.7, 0.86], [0, 1, 0], clamp) : 0;
  // الكاميرا
  const zPrev = i > 0 ? laid[i - 1].shot.zoom ?? [VW / 2, VH / 2, 1] : [VW / 2, VH / 2, 1];
  const zCur = cur.shot.zoom ?? [VW / 2, VH / 2, 1];
  const zt = interpolate(lf, [0, 16], [0, 1], {...clamp, easing: ease});
  const zx = zPrev[0] + (zCur[0] - zPrev[0]) * zt;
  const zy = zPrev[1] + (zCur[1] - zPrev[1]) * zt;
  const zs = zPrev[2] + (zCur[2] - zPrev[2]) * zt;
  // نص ينكتب
  const typed = cur.shot.type ? cur.shot.type.slice(0, Math.floor(interpolate(p, [0.05, 0.75], [0, cur.shot.type.length], clamp))) : '';
  // فتح اللابتوب
  const firstOpen = laid.findIndex((l) => l.shot.open);
  const openP = firstOpen >= 0 ? interpolate(f, [laid[firstOpen].start + 4, laid[firstOpen].start + 34], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)}) : 1;
  const SCR_W = 980;
  const k = SCR_W / VW;
  const SCR_H = VH * k;
  // الكاميرا تقرب داخل الشاشة نفسها (مثل تسجيل الشاشة) واللابتوب ثابت
  const ox = Math.min(0, Math.max(VW - VW * zs, VW / 2 - zx * zs));
  const oy = Math.min(0, Math.max(VH - VH * zs, VH / 2 - zy * zs));
  return (
    <div style={{position: 'absolute', left: (1080 - SCR_W - 40) / 2, top: 600, width: SCR_W + 40}}>
      <div style={{perspective: 2400}}>
        <div style={{width: SCR_W + 40, height: SCR_H + 40, borderRadius: 30, background: '#1B1B1D', padding: 20, boxSizing: 'border-box',
          transform: `rotateX(${(1 - openP) * -88}deg)`, transformOrigin: 'bottom center', boxShadow: '0 30px 60px rgba(40,25,20,0.3)'}}>
          <div style={{width: SCR_W, height: SCR_H, borderRadius: 10, overflow: 'hidden', position: 'relative', background: '#000'}}>
            <div style={{width: VW, height: VH, transform: `scale(${k})`, transformOrigin: 'top left', position: 'relative', fontFamily, color: ui.text,
              opacity: interpolate(openP, [0.6, 1], [0, 1], clamp)}}>
              <div style={{position: 'absolute', left: 0, top: 0, width: VW, height: VH, overflow: 'hidden'}}>
                <div style={{position: 'absolute', left: 0, top: 0, width: VW, height: VH, transform: `translate(${ox}px, ${oy}px) scale(${zs})`, transformOrigin: 'top left'}}>
                  <Screen id={cur.shot.screen} typed={typed} f={lf} />
                  <Cursor x={cx} y={cy} press={press} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* قاعدة اللابتوب */}
      <div style={{width: SCR_W + 200, height: 34, marginLeft: -80, borderRadius: '0 0 30px 30px', background: 'linear-gradient(180deg,#D8D6D2,#A9A6A1)',
        boxShadow: '0 20px 40px rgba(40,25,20,0.25)'}} />
    </div>
  );
};

// ───────── مشهد الإشعار ─────────
const NotifyScene: React.FC<{image: string; head: string; drop: number}> = ({image, head, drop: dropF}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ph = spring({frame: f, fps, config: {damping: 14, stiffness: 100}});
  const drop = spring({frame: f - dropF, fps, config: {damping: 11, stiffness: 140}});
  const glow = 0.5 + 0.5 * Math.sin(f / 8);
  return (
    <AbsoluteFill>
      <Backdrop look="dark" />
      <div style={{position: 'absolute', top: 210, left: 40, right: 40}}><Kinetic text={head} look="dark" size={90} /></div>
      <div style={{position: 'absolute', left: 140, top: 520, width: 800, height: 1220, borderRadius: 100, background: '#0E0C0B', padding: 22, boxSizing: 'border-box',
        boxShadow: `0 40px 90px rgba(0,0,0,0.6), 0 0 ${60 * glow}px rgba(232,115,90,0.35)`, transform: `translateY(${(1 - ph) * 900}px)`}}>
        <div style={{width: '100%', height: '100%', borderRadius: 80, overflow: 'hidden', position: 'relative',
          background: 'linear-gradient(160deg,#3B2A6E 0%,#1C1630 45%,#2A1E18 100%)'}}>
          <div style={{position: 'absolute', top: 24, left: '50%', width: 220, height: 60, marginLeft: -110, borderRadius: 30, background: '#000'}} />
          <div style={{position: 'absolute', top: 140, width: '100%', textAlign: 'center', color: 'white', fontFamily: 'Cairo', fontSize: 150, fontWeight: 300}}>7:00</div>
          <div style={{position: 'absolute', top: 340, width: '100%', textAlign: 'center', color: 'rgba(255,255,255,0.8)', fontFamily, fontSize: 40, fontWeight: 700}}>الأحد</div>
          <Img src={staticFile(image)} style={{position: 'absolute', left: 20, top: 460, width: 716, borderRadius: 30,
            transform: `translateY(${(1 - drop) * -500}px) scale(${0.9 + 0.1 * drop})`, opacity: Math.min(1, drop * 1.6),
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ───────── الحلقة ─────────
export const layoutTutorial = (ep: TutorialEp, voice: boolean) => {
  const introBase = ep.intro.beats.reduce((a, b) => a + b.dur, 0);
  const ik = voice && ep.intro.voiceDur ? (ep.intro.voiceDur + 0.2) / introBase : 1;
  const introBeats = ep.intro.beats.map((b) => Math.round(b.dur * ik * FPS));
  let t = introBeats.reduce((a, b) => a + b, 0);
  const laid: Laid[] = [];
  const stepStarts: number[] = [];
  ep.steps.forEach((s, si) => {
    stepStarts.push(t);
    const base = s.shots.reduce((a, b) => a + b.dur, 0);
    const kk = voice && s.voiceDur ? (s.voiceDur + 0.2) / base : 1;
    s.shots.forEach((sh) => {
      const frames = Math.round(sh.dur * kk * FPS);
      laid.push({shot: sh, start: t, frames, step: si});
      t += frames;
    });
  });
  const finalStart = t;
  if (ep.final) t += Math.round((voice && ep.final.voiceDur ? Math.max(ep.final.dur, ep.final.voiceDur + 0.4) : ep.final.dur) * FPS);
  const outroStart = t;
  return {introBeats, laid, stepStarts, finalStart, outroStart, total: t + Math.round(ep.outro.dur * FPS)};
};

export const tutorialFrames = (ep: TutorialEp, voice: boolean) => layoutTutorial(ep, voice).total;

const StepScene: React.FC<{ep: TutorialEp; laid: Laid[]; stepStarts: number[]}> = ({ep, laid, stepStarts}) => {
  const f = useCurrentFrame() + laid[0].start; // نشتغل بالفريمات المطلقة
  const i = Math.max(0, laid.findIndex((l) => f >= l.start && f < l.start + l.frames));
  const cur = laid[i];
  const step = ep.steps[cur.step];
  const stepF = f - stepStarts[cur.step];
  const capF = f - cur.start;
  const capIn = interpolate(capF, [0, 10], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill>
      <Backdrop look="light" />
      {ep.steps.map((st, si) => (
        <Sequence key={si} from={stepStarts[si] - laid[0].start} durationInFrames={(stepStarts[si + 1] ?? laid[laid.length - 1].start + laid[laid.length - 1].frames) - stepStarts[si]} layout="none">
          <div style={{position: 'absolute', top: 210, left: 40, right: 40}}><Kinetic text={st.head} look="light" size={86} /></div>
        </Sequence>
      ))}
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center', fontFamily, fontSize: 34, fontWeight: 800, color: C.coral,
        opacity: interpolate(stepF, [0, 8], [0, 1], clamp)}}>{`الخطوة ${['١', '٢', '٣', '٤', '٥'][cur.step]}`}</div>
      <Laptop laid={laid} f={f} />
      <div style={{position: 'absolute', bottom: 430, left: 70, right: 70, display: 'flex', justifyContent: 'center', fontFamily, direction: 'rtl'}}>
        <div style={{background: C.ink, color: 'white', fontSize: 46, fontWeight: 800, padding: '20px 40px', borderRadius: 24, textAlign: 'center', lineHeight: 1.35,
          opacity: capIn, transform: `translateY(${(1 - capIn) * 30}px)`, boxShadow: '0 16px 40px rgba(0,0,0,0.25)'}}>
          <span style={{color: C.coral, marginLeft: 14}}>{i - laid.findIndex((l) => l.step === cur.step) + 1}.</span>{cur.shot.caption}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Tutorial: React.FC<{ep: TutorialEp; voice: boolean}> = ({ep, voice}) => {
  const {introBeats, laid, stepStarts, finalStart, outroStart, total} = layoutTutorial(ep, voice);
  const dropF = ep.final ? Math.round((voice && ep.final.dropAt ? ep.final.dropAt : 0.47) * FPS) : 0;
  const {fps} = useVideoConfig();
  const bed = voice ? 0.12 : 0.5;
  let t = 0;
  return (
    <AbsoluteFill style={{background: C.cream}}>
      {ep.intro.beats.map((b, bi) => {
        const from = t;
        t += introBeats[bi];
        return (
          <Sequence key={`i${bi}`} from={from} durationInFrames={introBeats[bi]}>
            <BeatView b={b} frames={introBeats[bi]} />
            <Audio src={staticFile(bi === 0 ? 'sfx/impact.wav' : 'sfx/whoosh.wav')} volume={0.5} />
          </Sequence>
        );
      })}
      {voice && ep.intro.voice ? <Sequence from={4}><Audio src={staticFile(ep.intro.voice)} /></Sequence> : null}
      <Sequence from={laid[0].start} durationInFrames={finalStart - laid[0].start}>
        <StepScene ep={ep} laid={laid} stepStarts={stepStarts} />
      </Sequence>
      {ep.final ? (
        <Sequence from={finalStart} durationInFrames={outroStart - finalStart}>
          <NotifyScene image={ep.final.image} head={ep.final.head} drop={dropF} />
          <Sequence from={dropF + 2} layout="none"><Audio src={staticFile('sfx/notify.wav')} volume={0.9} /></Sequence>
          <Sequence from={dropF + 26} layout="none"><Audio src={staticFile('sfx/notify.wav')} volume={0.75} /></Sequence>
          <Audio src={staticFile('sfx/whoosh.wav')} volume={0.4} />
          {voice && ep.final.voice ? <Sequence from={4}><Audio src={staticFile(ep.final.voice)} /></Sequence> : null}
        </Sequence>
      ) : null}
      {laid.map((l, li) => (
        <Sequence key={`s${li}`} from={l.start} durationInFrames={l.frames} layout="none">
          {l.shot.click ? (
            <Sequence from={Math.round(l.frames * 0.62)} layout="none"><Audio src={staticFile('sfx/key1.wav')} volume={0.7} /></Sequence>
          ) : null}
          {li === 0 || laid[li - 1].step !== l.step ? <Audio src={staticFile('sfx/whoosh.wav')} volume={0.35} /> : null}
        </Sequence>
      ))}
      {ep.steps.map((s, si) => (voice && s.voice ? (
        <Sequence key={`v${si}`} from={stepStarts[si] + 4} layout="none"><Audio src={staticFile(s.voice)} /></Sequence>
      ) : null))}
      <Sequence from={outroStart} durationInFrames={total - outroStart}>
        <Outro word={ep.outro.word} />
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.5} />
        <Sequence from={24}><Audio src={staticFile('sfx/pop.wav')} volume={0.7} /></Sequence>
        {voice && ep.outro.voice ? <Sequence from={4}><Audio src={staticFile(ep.outro.voice)} /></Sequence> : null}
      </Sequence>
      <Audio src={staticFile(ep.music)} volume={(fr) => bed * interpolate(fr, [total - 30, total], [1, 0], clamp)} />
      <Sequence durationInFrames={outroStart} layout="none">
        <div style={{position: 'absolute', bottom: 120, width: '100%', textAlign: 'center', fontFamily, fontSize: 30, fontWeight: 800, color: 'rgba(120,110,105,0.55)',
          direction: 'ltr'}}>{INSTAGRAM}</div>
      </Sequence>
      {fps ? null : null}
    </AbsoluteFill>
  );
};

export {PROMPT, TASK};
