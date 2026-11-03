"""Builds Code.gs: one Apps Script file that serves the attendance page and saves rows to the sheet."""
import base64, json, pathlib, sys

here = pathlib.Path(__file__).parent
logo = pathlib.Path(sys.argv[1]).read_bytes()
page = (here / "page.html").read_text(encoding="utf-8")
page = page.replace("__LOGO__", "data:image/jpeg;base64," + base64.b64encode(logo).decode())

code = r"""// تسجيل حضور غرفة الاجتماعات — ثانوية فاطمة الهاشمية
// الصقي هذا الملف كاملاً في Apps Script (الإضافات ← Apps Script) ثم انشريه كتطبيق ويب.

const SHEET_NAME = 'الحضور';

function doGet() {
  return HtmlService.createHtmlOutput(PAGE)
    .setTitle('تسجيل الحضور')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['#', 'الاسم', 'المدرسة', 'وقت الحضور']);
    sh.setRightToLeft(true);
    sh.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#ef7f1a').setFontColor('#ffffff');
    sh.setFrozenRows(1);
    sh.setColumnWidth(2, 240);
    sh.setColumnWidth(3, 240);
    sh.setColumnWidth(4, 170);
  }
  return sh;
}

function clean_(v) {
  let s = String(v || '').trim().slice(0, 80);
  if (/^[=+\-@]/.test(s)) s = "'" + s;   // يمنع تحويل النص إلى معادلة
  return s;
}

function register(name, school) {
  name = clean_(name);
  school = clean_(school);
  if (!name || !school) throw new Error('الاسم والمدرسة مطلوبة');
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh = sheet_();
    const n = sh.getLastRow();          // الصف الأول عناوين، فالرقم = عدد الصفوف الحالية
    sh.appendRow([n, name, school, new Date()]);
    sh.getRange(sh.getLastRow(), 4).setNumberFormat('yyyy/mm/dd  hh:mm');
    return n;
  } finally {
    lock.releaseLock();
  }
}

function getSchools() {
  const sh = sheet_();
  const last = sh.getLastRow();
  if (last < 2) return [];
  const vals = sh.getRange(2, 3, last - 1, 1).getValues().map(r => String(r[0])).filter(String);
  return Array.from(new Set(vals)).slice(0, 200);
}

const PAGE = """ + json.dumps(page, ensure_ascii=False) + ";\n"

(here / "Code.gs").write_text(code, encoding="utf-8")
print("Code.gs", len(code.encode()), "bytes")
