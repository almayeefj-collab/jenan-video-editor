import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { bindings } from "../bindings.server";

// SHA-256 of the admin password (the password itself is never stored in code).
const ADMIN_HASH = "__ADMIN_HASH__";

let ready = false;

async function getDb() {
  const { DB } = bindings();
  if (!DB) throw new Error("database_unavailable");
  if (!ready) {
    await DB.prepare(
      "CREATE TABLE IF NOT EXISTS attendance (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, school TEXT NOT NULL, created_at INTEGER NOT NULL)",
    ).run();
    ready = true;
  }
  return DB;
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function requireAdmin(password: string) {
  if ((await sha256(password)) !== ADMIN_HASH) {
    await new Promise((r) => setTimeout(r, 800));
    throw new Error("unauthorized");
  }
}

const field = z.string().trim().min(1).max(80);

export const registerAttendance = createServerFn({ method: "POST" })
  .inputValidator(z.object({ name: field, school: field }))
  .handler(async ({ data }) => {
    const DB = await getDb();
    await DB.prepare("INSERT INTO attendance (name, school, created_at) VALUES (?, ?, ?)")
      .bind(data.name, data.school, Date.now())
      .run();
    const row = await DB.prepare("SELECT COUNT(*) AS n FROM attendance").first<{ n: number }>();
    return { number: row?.n ?? 1 };
  });

export const listSchools = createServerFn({ method: "GET" }).handler(async () => {
  const DB = await getDb();
  const res = await DB.prepare(
    "SELECT school, COUNT(*) AS c FROM attendance GROUP BY school ORDER BY c DESC LIMIT 200",
  ).all<{ school: string }>();
  return (res.results ?? []).map((r) => r.school);
});

export type AttendanceRow = { id: number; name: string; school: string; created_at: number };

export const adminList = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string().max(200) }))
  .handler(async ({ data }) => {
    await requireAdmin(data.password);
    const DB = await getDb();
    const res = await DB.prepare(
      "SELECT id, name, school, created_at FROM attendance ORDER BY created_at ASC, id ASC",
    ).all<AttendanceRow>();
    return res.results ?? [];
  });

export const adminDelete = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string().max(200), id: z.number().int() }))
  .handler(async ({ data }) => {
    await requireAdmin(data.password);
    const DB = await getDb();
    await DB.prepare("DELETE FROM attendance WHERE id = ?").bind(data.id).run();
    return { ok: true };
  });
