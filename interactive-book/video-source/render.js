const {chromium}=require('playwright');const {spawn}=require('child_process');
(async()=>{const [,,html,out,mode]=process.argv;const fps=30;
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});
await p.goto('file://'+html);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
const dur=await p.evaluate(()=>DUR);
if(mode==='preview'){for(const t of [4,12,21,30,40,49,57,65]){await p.evaluate(t=>render(t),t);await p.screenshot({path:`${out}/pv_${t}.jpg`,quality:70});}await b.close();return;}
const ff=spawn('ffmpeg',['-y','-f','image2pipe','-framerate',''+fps,'-i','-','-c:v','libx264','-pix_fmt','yuv420p','-crf','23','-preset','medium',out],{stdio:['pipe','ignore','inherit']});
const N=Math.round(dur*fps);
for(let i=0;i<N;i++){await p.evaluate(t=>render(t),i/fps);const buf=await p.screenshot({type:'jpeg',quality:88});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();})();
