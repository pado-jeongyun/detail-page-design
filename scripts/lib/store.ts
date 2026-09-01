// 일기의 거처. journal 폴더(~/Relay/diary-assistant) 아래 날짜 이름의 마크다운 파일로
// 하루에 한 편씩 둔다. 파일 이름이 곧 날짜(2026-08-26.md)라, 사용자가 폴더를 직접 열어
// 하루씩 읽고 고칠 수 있다.
import fs from "node:fs";
import path from "node:path";

export interface Ctx {
  dir(name: string): string;
}

const YMD = /^(\d{4})-(\d{2})-(\d{2})$/;

// 형식과 실재하는 날짜인지까지 본다(2026-02-30 같은 값 거르기).
export function isValidDate(s: string): boolean {
  const m = YMD.exec(s);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d;
}

// 오늘 날짜(로컬 시간대) YYYY-MM-DD.
export function todayLocal(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function root(ctx: Ctx): string {
  const d = ctx.dir("journal");
  fs.mkdirSync(d, { recursive: true });
  return d;
}

export function entryPath(ctx: Ctx, date: string): string {
  return path.join(root(ctx), `${date}.md`);
}

export function readEntry(ctx: Ctx, date: string): string | null {
  const f = entryPath(ctx, date);
  if (!fs.existsSync(f)) return null;
  return fs.readFileSync(f, "utf8");
}

export function writeEntry(ctx: Ctx, date: string, body: string): void {
  const text = body.endsWith("\n") ? body : body + "\n";
  fs.writeFileSync(entryPath(ctx, date), text);
}

export function removeEntry(ctx: Ctx, date: string): boolean {
  const f = entryPath(ctx, date);
  if (!fs.existsSync(f)) return false;
  fs.rmSync(f);
  return true;
}

export interface EntrySummary {
  date: string;
  preview: string;
  bytes: number;
  path: string;
}

// 미리보기 — 마크다운 제목·표식과 줄바꿈을 걷어낸 첫 마디 몇 글자.
function makePreview(body: string, max = 100): string {
  const flat = body
    .replace(/^#.*$/gm, " ")
    .replace(/[#>*_`~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return flat.length > max ? flat.slice(0, max).trimEnd() + "…" : flat;
}

// 저장된 일기 요약을 최근 날짜부터.
export function listEntries(ctx: Ctx): EntrySummary[] {
  const dir = root(ctx);
  const dates = fs
    .readdirSync(dir)
    .filter((n) => n.endsWith(".md") && isValidDate(n.slice(0, -3)))
    .map((n) => n.slice(0, -3))
    .sort((a, b) => b.localeCompare(a));
  return dates.map((date) => {
    const body = readEntry(ctx, date) ?? "";
    return {
      date,
      preview: makePreview(body),
      bytes: Buffer.byteLength(body, "utf8"),
      path: entryPath(ctx, date),
    };
  });
}
