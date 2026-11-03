"""Builds Code.gs: one Apps Script file that serves the attendance page and saves rows to the sheet."""
import base64, json, pathlib, sys

here = pathlib.Path(__file__).parent
logo = pathlib.Path(sys.argv[1]).read_bytes()
page = (here / "page.html").read_text(encoding="utf-8")
uri = "data:image/jpeg;base64," + base64.b64encode(logo).decode()
page = page.replace("__LOGO__", uri)
admin = (here / "admin.html").read_text(encoding="utf-8").replace("__LOGO__", uri)
password = sys.argv[2]

code = r"""// حضور اجتماع مديري ومديرات المدارس — ثانوية فاطمة الهاشمية
// الصقي هذا الملف كاملاً في Apps Script (الإضافات ← Apps Script) ثم انشريه كتطبيق ويب.

const SHEET_NAME = 'الحضور';
const ADMIN_PASSWORD = '""" + password + """';   // كلمة سر صفحة الإدارة، تقدرين تغيرينها هنا

function doGet(e) {
  const admin = e && e.parameter && e.parameter.page === 'admin';
  return HtmlService.createHtmlOutput(admin ? ADMIN : PAGE)
    .setTitle(admin ? 'إدارة الحضور' : 'حضور اجتماع مديري ومديرات المدارس')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['#', 'الاسم', 'المدرسة', 'وقت الحضور', 'id']);
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
    sh.appendRow([n, name, school, new Date(), Utilities.getUuid()]);
    sh.getRange(sh.getLastRow(), 4).setNumberFormat('yyyy/mm/dd  hh:mm');
    return n;
  } finally {
    lock.releaseLock();
  }
}

function checkPw_(pw) {
  if (String(pw) !== ADMIN_PASSWORD) {
    Utilities.sleep(1000);
    throw new Error('wrong password');
  }
}

function adminList(pw) {
  checkPw_(pw);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = sheet_();
  const last = sh.getLastRow();
  const rows = last < 2 ? [] : sh.getRange(2, 1, last - 1, 5).getValues()
    .filter(r => r[1] !== '')
    .map((r, i) => ({ n: i + 1, name: String(r[1]).replace(/^'/, ''), school: String(r[2]).replace(/^'/, ''),
                      at: r[3] instanceof Date ? r[3].getTime() : Date.now(), id: String(r[4]) }));
  return { rows: rows, sheetUrl: ss.getUrl().replace(/\/edit.*$/, '') + '/export?format=xlsx' };
}

function adminDelete(pw, id) {
  checkPw_(pw);
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh = sheet_();
    const last = sh.getLastRow();
    if (last < 2) return false;
    const ids = sh.getRange(2, 5, last - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(id)) { sh.deleteRow(i + 2); return true; }
    }
    return false;
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

const PAGE = """ + json.dumps(page, ensure_ascii=False) + ";\n\nconst ADMIN = " + json.dumps(admin, ensure_ascii=False) + ";\n"

(here / "Code.gs").write_text(code, encoding="utf-8")
print("Code.gs", len(code.encode()), "bytes")
