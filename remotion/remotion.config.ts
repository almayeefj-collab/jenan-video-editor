import {Config} from '@remotion/cli/config';
import {existsSync} from 'node:fs';
import {globSync} from 'node:fs';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// في بيئة السحابة موقع تحميل Chrome الخاص بـ Remotion محجوب،
// فنستخدم المتصفح المثبت مسبقاً إذا كان موجوداً.
const preinstalled = globSync('/opt/pw-browsers/chromium_headless_shell-*/*/headless_shell')[0];
const browser = process.env.REMOTION_BROWSER ?? preinstalled;
if (browser && existsSync(browser)) {
  Config.setBrowserExecutable(browser);
}
