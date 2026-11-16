// node render_lessons.js <outdir> [key...]  — renders each lesson spec to <outdir>/<key>_silent.mp4
const {chromium}=require('playwright');const {spawn}=require('child_process');const path=require('path');const fs=require('fs');
(async()=>{const out=process.argv[2];const specs=JSON.parse(fs.readFileSync(path.join(__dirname,'specs.json')));
const keys=process.argv.slice(3).length?process.argv.slice(3):Object.keys(specs);const fps=24;
const b=await chromium.launch();
await Promise.all([0,1,2].map(async w=>{ for(let ki=w;ki<keys.length;ki+=3){ const key=keys[ki];
  const p=await b.newPage({viewport:{width:960,height:540}});await p.goto('file://'+path.join(__dirname,'lesson.html'));await p.evaluate(()=>document.fonts.ready);
  const dur=await p.evaluate(s=>{setup(s);return DUR},specs[key]);await p.waitForTimeout(300);
  if(process.env.PREVIEW){for(const f of [.15,.4,.7,.92]){await p.evaluate(t=>render(t),dur*f);await p.screenshot({path:`${out}/${key}_${f}.jpg`,quality:60});}await p.close();continue;}
  const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',''+fps,'-i','-','-c:v','libx264','-pix_fmt','yuv420p','-crf','24','-preset','fast',`${out}/${key}_silent.mp4`],{stdio:['pipe','ignore','inherit']});
  for(let i=0;i<Math.round(dur*fps);i++){await p.evaluate(t=>render(t),i/fps);const buf=await p.screenshot({type:'jpeg',quality:85});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));}
  ff.stdin.end();await new Promise(r=>ff.on('close',r));await p.close();console.log('done',key,dur.toFixed(1));}}));
await b.close();})();
