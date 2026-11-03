import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

import { adminDelete, adminList, type AttendanceRow } from "../lib/api/attendance.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "إدارة الحضور" }, { name: "robots", content: "noindex" }],
  }),
  component: Admin,
});

const KEY = "fa-admin-pw";

function timeOf(ms: number) {
  return new Date(ms).toLocaleTimeString("ar-KW", { hour: "numeric", minute: "2-digit" });
}
function fullOf(ms: number) {
  return new Date(ms).toLocaleString("ar-KW", { dateStyle: "medium", timeStyle: "short" });
}

function Admin() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [armed, setArmed] = useState<number | null>(null);

  const load = useCallback(async (password: string) => {
    const list = await adminList({ data: { password } });
    setRows(list);
    setStatus("آخر تحديث " + timeOf(Date.now()) + " · تتحدث تلقائياً");
  }, []);

  async function login(password: string) {
    setBusy(true);
    setLoginError("");
    try {
      await load(password);
      setPw(password);
      setAuthed(true);
      try {
        sessionStorage.setItem(KEY, password);
      } catch {
        /* storage unavailable */
      }
    } catch {
      setLoginError("كلمة السر غلط.");
      try {
        sessionStorage.removeItem(KEY);
      } catch {
        /* storage unavailable */
      }
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(KEY);
    } catch {
      saved = null;
    }
    if (saved) void login(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!authed) return;
    const t = setInterval(() => {
      load(pw).catch(() => setStatus("ما قدرنا نحدّث القائمة، نحاول مرة ثانية بعد شوي."));
    }, 20000);
    return () => clearInterval(t);
  }, [authed, pw, load]);

  const filtered = useMemo(() => {
    const s = q.trim();
    return rows
      .map((r, i) => ({ ...r, n: i + 1 }))
      .filter((r) => !s || r.name.includes(s) || r.school.includes(s));
  }, [rows, q]);

  const schoolCount = useMemo(() => new Set(rows.map((r) => r.school)).size, [rows]);

  async function remove(id: number) {
    if (armed !== id) {
      setArmed(id);
      setTimeout(() => setArmed((a) => (a === id ? null : a)), 4000);
      return;
    }
    setArmed(null);
    try {
      await adminDelete({ data: { password: pw, id } });
      await load(pw);
    } catch {
      setStatus("ما قدرنا نحذف الاسم، حاول مرة ثانية.");
    }
  }

  function downloadCsv() {
    const esc = (v: unknown) => '"' + String(v ?? "").replace(/"/g, '""') + '"';
    const lines = [["#", "الاسم", "المدرسة", "وقت الحضور"].map(esc).join(",")].concat(
      rows.map((r, i) => [i + 1, r.name, r.school, fullOf(r.created_at)].map(esc).join(",")),
    );
    const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const d = new Date();
    a.href = url;
    a.download = `الحضور-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}.csv`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function logout() {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* storage unavailable */
    }
    setAuthed(false);
    setPw("");
    setRows([]);
  }

  if (!authed) {
    return (
      <main className="fa-page">
        <form
          className="fa-card fa-login"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            void login(pw);
          }}
        >
          <img className="fa-logo fa-logo-sm" src="/assets/logo.jpg" alt="شعار ثانوية فاطمة الهاشمية" width={360} height={273} />
          <h1>إدارة الحضور</h1>
          <label htmlFor="pw">
            كلمة السر
            <input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
          </label>
          <button type="submit" className="fa-submit" disabled={busy || !pw}>
            {busy ? "جاري الدخول…" : "دخول"}
          </button>
          <p className="fa-error" role="status">
            {loginError}
          </p>
        </form>
      </main>
    );
  }

  return (
    <main className="fa-page">
      <div className="fa-wrap fa-wide">
        <header className="fa-card fa-top">
          <div className="fa-brand">
            <img src="/assets/logo.jpg" alt="" width={72} height={55} />
            <div>
              <h1>حضور اجتماع مديري ومديرات المدارس</h1>
              <p>{status}</p>
            </div>
          </div>
          <div className="fa-actions">
            <button type="button" className="fa-ghost" onClick={() => load(pw).catch(() => setStatus("ما قدرنا نحدّث القائمة."))}>
              تحديث
            </button>
            <button type="button" className="fa-ghost" onClick={downloadCsv} disabled={!rows.length}>
              تنزيل القائمة (Excel)
            </button>
            <button type="button" className="fa-ghost" onClick={logout}>
              خروج
            </button>
          </div>
        </header>

        <div className="fa-stats">
          <div className="fa-stat fa-stat-main">
            <b>{rows.length}</b>
            <span>عدد الحضور</span>
          </div>
          <div className="fa-stat">
            <b>{schoolCount}</b>
            <span>عدد المدارس</span>
          </div>
          <div className="fa-stat">
            <b>{rows.length ? timeOf(rows[rows.length - 1].created_at) : "—"}</b>
            <span>آخر تسجيل</span>
          </div>
        </div>

        <section className="fa-card fa-table-card">
          <div className="fa-search">
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالاسم أو المدرسة" aria-label="بحث" />
            {q.trim() ? <small>النتائج: {filtered.length}</small> : null}
          </div>
          {rows.length === 0 ? (
            <p className="fa-empty">ما فيه أحد مسجل للحين. أول ما يسجل أحد بيطلع اسمه هنا.</p>
          ) : (
            <div className="fa-scroll">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>الاسم</th>
                    <th>المدرسة</th>
                    <th>وقت الحضور</th>
                    <th aria-label="إجراءات" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id}>
                      <td className="fa-n">{r.n}</td>
                      <td className="fa-name">{r.name}</td>
                      <td>
                        <span className="fa-pill">{r.school}</span>
                      </td>
                      <td className="fa-n">{fullOf(r.created_at)}</td>
                      <td>
                        <button type="button" className="fa-del" onClick={() => remove(r.id)}>
                          {armed === r.id ? "تأكيد الحذف" : "حذف"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
