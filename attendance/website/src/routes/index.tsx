import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { listSchools, registerAttendance } from "../lib/api/attendance.functions";

export const Route = createFileRoute("/")({
  component: CheckIn,
});

function CheckIn() {
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [schools, setSchools] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ first: string; number: number } | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listSchools()
      .then(setSchools)
      .catch(() => setSchools([]));
  }, [done]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const n = name.trim();
    const s = school.trim();
    if (!n || !s) {
      setError("اكتب الاسم والمدرسة قبل التسجيل.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await registerAttendance({ data: { name: n, school: s } });
      setDone({ first: n.split(/\s+/)[0], number: res.number });
    } catch {
      setError("ما تم التسجيل، تأكد من الإنترنت وحاول مرة ثانية.");
    } finally {
      setBusy(false);
    }
  }

  function again() {
    setName("");
    setSchool("");
    setDone(null);
    setTimeout(() => nameRef.current?.focus(), 0);
  }

  return (
    <main className="fa-page">
      <div className="fa-wrap">
        <header className="fa-head">
          <div className="fa-bar" />
          <div className="fa-head-inner">
            <img className="fa-logo" src="/assets/logo.jpg" alt="شعار ثانوية فاطمة الهاشمية" width={360} height={273} />
            <h1 className="fa-welcome">حيــاكــم اللّــه</h1>
            <p className="fa-event">حضور اجتماع مديري ومديرات المدارس</p>
            <p className="fa-sub">سجّل اسمك ومدرستك</p>
          </div>
        </header>

        {done ? (
          <section className="fa-card fa-done" aria-live="polite">
            <div className="fa-tick" aria-hidden="true">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </div>
            <h2>حياك الله يا {done.first}</h2>
            <p>
              تم تسجيل حضورك، رقمك <span className="fa-num">{done.number}</span>
            </p>
            <button type="button" className="fa-again" onClick={again}>
              تسجيل شخص آخر
            </button>
          </section>
        ) : (
          <form className="fa-card fa-form" onSubmit={submit} noValidate>
            <label htmlFor="name">
              الاسم
              <input
                id="name"
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                maxLength={80}
                placeholder="اكتب اسمك"
              />
            </label>
            <label htmlFor="school">
              المدرسة / الجهة
              <input
                id="school"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                list="schools"
                maxLength={80}
                placeholder="اكتب اسم المدرسة"
              />
              <datalist id="schools">
                {schools.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </label>
            <button type="submit" className="fa-submit" disabled={busy}>
              {busy ? "جاري التسجيل…" : "تسجيل الحضور"}
            </button>
            <p className="fa-error" role="status">
              {error}
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
